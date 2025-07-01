/**
 * Tenant Authentication System
 * Handles API key validation, rate limiting, and tenant isolation
 */

import { NextRequest } from 'next/server'
import { dbOperations } from '@/lib/db/neon-mcp-client'
import { dbOperationsDirect } from '@/lib/db/direct-db-client'
import { Tenant, TenantAuth, APIError } from '@/types'
import * as crypto from 'crypto'

export class TenantAuthService {
  private static instance: TenantAuthService
  private rateLimitMap = new Map<string, { count: number; resetTime: number }>()

  static getInstance(): TenantAuthService {
    if (!TenantAuthService.instance) {
      TenantAuthService.instance = new TenantAuthService()
    }
    return TenantAuthService.instance
  }

  /**
   * Hash API key for secure storage
   */
  hashApiKey(apiKey: string): string {
    const salt = process.env.API_KEY_SALT || 'default-salt-change-in-production'
    return crypto.createHash('sha256').update(apiKey + salt).digest('hex')
  }

  /**
   * Generate a new API key for a tenant
   */
  generateApiKey(): string {
    const prefix = 'ghl_mcp_'
    const randomBytes = crypto.randomBytes(32).toString('hex')
    return prefix + randomBytes
  }

  /**
   * Encrypt sensitive data (like GHL API keys)
   */
  private encrypt(text: string): string {
    const algorithm = 'aes-256-gcm'
    const encryptionKey = process.env.ENCRYPTION_KEY || 'default-32-char-key-change-prod!!'
    const key = Buffer.from(encryptionKey.padEnd(32, '0').slice(0, 32), 'utf8')
    const iv = crypto.randomBytes(16)
    
    const cipher = crypto.createCipheriv(algorithm, key, iv)
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    const authTag = cipher.getAuthTag()
    
    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted
  }

  /**
   * Decrypt API key for tenant
   */
  async decryptApiKey(encryptedKey: string): Promise<string> {
    return this.decrypt(encryptedKey)
  }

  /**
   * Decrypt OAuth token (different format than regular encryption)
   */
  async decryptOAuthToken(encryptedToken: string): Promise<string> {
    try {
      const key = Buffer.from(process.env.ENCRYPTION_KEY!, 'base64')
      const parts = encryptedToken.split(':')
      if (parts.length !== 3) {
        throw new Error('Invalid encrypted token format')
      }
      const [ivBase64, authTagBase64, encrypted] = parts
      const iv = Buffer.from(ivBase64, 'base64')
      const authTag = Buffer.from(authTagBase64, 'base64')
      
      const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
      decipher.setAuthTag(authTag)
      
      let decrypted = decipher.update(encrypted, 'base64', 'utf8')
      decrypted += decipher.final('utf8')
      
      return decrypted
    } catch (error) {
      console.error('Error decrypting OAuth token:', error)
      throw error
    }
  }

  /**
   * Decrypt sensitive data
   */
  private decrypt(encryptedText: string): string {
    const algorithm = 'aes-256-gcm'
    const encryptionKey = process.env.ENCRYPTION_KEY || 'default-32-char-key-change-prod!!'
    const key = Buffer.from(encryptionKey.padEnd(32, '0').slice(0, 32), 'utf8')
    
    const parts = encryptedText.split(':')
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted text format')
    }
    const [ivHex, authTagHex, encrypted] = parts
    const iv = Buffer.from(ivHex, 'hex')
    const authTag = Buffer.from(authTagHex, 'hex')
    
    const decipher = crypto.createDecipheriv(algorithm, key, iv)
    decipher.setAuthTag(authTag)
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
  }

  /**
   * Create a new tenant
   */
  async createTenant(tenantData: {
    name: string
    email: string
    ghlApiKey: string
    ghlLocationId: string
    plan?: string
    usageQuota?: number
  }): Promise<{ tenant: Tenant; apiKey: string }> {
    try {
      const apiKey = this.generateApiKey()
      const apiKeyHash = this.hashApiKey(apiKey)
      const encryptedGhlKey = this.encrypt(tenantData.ghlApiKey)

      const query = `
        INSERT INTO tenants (
          name, email, api_key, api_key_hash, ghl_api_key_encrypted, 
          ghl_location_id, plan, usage_quota
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, name, email, plan, status, usage_quota, current_usage, created_at, updated_at
      `

      const params = [
        tenantData.name,
        tenantData.email,
        apiKey,
        apiKeyHash,
        encryptedGhlKey,
        tenantData.ghlLocationId,
        tenantData.plan || 'starter',
        tenantData.usageQuota || 1000
      ]

      // For development, create a mock tenant
      if (process.env.NODE_ENV === 'development') {
        const mockTenantId = crypto.randomUUID()
        const tenant: Tenant = {
          id: mockTenantId,
          name: tenantData.name,
          subdomain: tenantData.name.toLowerCase().replace(/\s+/g, '-'),
          api_key_hash: apiKeyHash,
          encrypted_ghl_api_key: encryptedGhlKey,
          ghl_location_id: tenantData.ghlLocationId,
          settings: {},
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
          subscription_tier: (tenantData.plan || 'free') as 'free' | 'pro' | 'enterprise',
          usage_limit: tenantData.usageQuota || 1000,
          current_usage: 0
        }
        
        return { tenant, apiKey }
      }
      
      const result = await dbOperations.query(query, params)
      const tenantRow = result[0]

      const tenant: Tenant = {
        id: tenantRow.id,
        name: tenantRow.name,
        subdomain: tenantRow.subdomain,
        api_key_hash: tenantRow.api_key_hash,
        encrypted_ghl_api_key: tenantRow.ghl_api_key_encrypted,
        ghl_location_id: tenantData.ghlLocationId,
        settings: tenantRow.settings || {},
        is_active: tenantRow.status === 'active',
        created_at: tenantRow.created_at,
        updated_at: tenantRow.updated_at,
        subscription_tier: tenantRow.plan as 'free' | 'pro' | 'enterprise',
        usage_limit: tenantRow.usage_quota,
        current_usage: tenantRow.current_usage
      }

      return { tenant, apiKey }
    } catch (error) {
      console.error('Error creating tenant:', error)
      throw new APIError('Failed to create tenant', 500, 'TENANT_CREATION_FAILED')
    }
  }

  /**
   * Authenticate tenant by API key
   */
  async authenticateTenant(apiKey: string): Promise<TenantAuth | null> {
    try {
      if (!apiKey || !apiKey.startsWith('ghl_mcp_')) {
        console.log('Invalid API key format:', apiKey ? apiKey.substring(0, 12) + '...' : 'no key')
        return null
      }

      const apiKeyHash = this.hashApiKey(apiKey)
      console.log('Authenticating with API key hash:', apiKeyHash.substring(0, 8) + '...')
      
      const query = `
        SELECT tenant_id as id, subdomain as name, 
               auth_method as plan, 'active' as status,
               1000 as usage_quota, 0 as current_usage,
               location_id as ghl_location_id, oauth_installation_id
        FROM tenants 
        WHERE tenant_id IN (
          SELECT tenant_id FROM api_keys WHERE key_hash = $1 AND is_active = true
        )
      `

      // For development, create a mock authenticated tenant
      if (process.env.NODE_ENV === 'development' && (apiKey.startsWith('tenant_') || apiKey.startsWith('ghl_mcp_'))) {
        console.log('Using development mock authentication')
        return {
          tenantId: 'dev-tenant-123',
          apiKey: apiKey,
          permissions: this.getPermissionsForPlan('pro')
        }
      }
      
      // Use direct database client for authentication
      const { neonDatabaseManager } = await import('@/lib/db/neon-database-manager')
      const db = neonDatabaseManager.getDatabase()
      console.log('Executing database query for authentication...')
      const result = await db.executeSql(query, [apiKeyHash])
      console.log('Database query result:', {
        success: result?.success,
        hasData: !!result?.data,
        rowCount: result?.data?.rowCount || 0,
        error: result?.error
      })
      
      if (!result || !result.data?.rows || result.data.rows.length === 0) {
        console.log('No tenant found for API key hash:', apiKeyHash.substring(0, 8) + '...')
        
        // Debug: Check if any tenants exist
        const debugQuery = `SELECT COUNT(*) as count FROM tenants`
        const debugResult = await db.executeSql(debugQuery, [])
        console.log('Total tenants in database:', debugResult?.data?.rows?.[0]?.count || 0)
        
        return null
      }

      const tenant = result.data.rows[0]

      // Check usage quota
      if (tenant.current_usage >= tenant.usage_quota) {
        throw new APIError('Usage quota exceeded', 429, 'QUOTA_EXCEEDED', { tenantId: tenant.id })
      }

      return {
        tenantId: tenant.id,
        apiKey: apiKey,
        permissions: this.getPermissionsForPlan(tenant.plan)
      }
    } catch (error) {
      if (error instanceof APIError) {
        throw error
      }
      console.error('Error authenticating tenant:', error)
      return null
    }
  }

  /**
   * Get tenant configuration (including decrypted GHL credentials)
   */
  async getTenantConfig(tenantId: string): Promise<{
    id: string
    name: string
    ghlApiKey: string
    ghlLocationId: string
    plan: string
    status: string
  } | null> {
    try {
      const query = `
        SELECT tenant_id as id, subdomain as name, 
               oauth_installation_id, location_id as ghl_location_id, 
               auth_method as plan, 'active' as status
        FROM tenants 
        WHERE tenant_id = $1
      `

      // For development, return mock config
      if (process.env.NODE_ENV === 'development' && tenantId === 'dev-tenant-123') {
        return {
          id: 'dev-tenant-123',
          name: 'Development Tenant',
          ghlApiKey: 'dev-ghl-api-key',
          ghlLocationId: 'dev-location-123',
          plan: 'pro',
          status: 'active'
        }
      }
      
      // Use direct database client
      const { neonDatabaseManager } = await import('@/lib/db/neon-database-manager')
      const db = neonDatabaseManager.getDatabase()
      const result = await db.executeSql(query, [tenantId])
      
      if (!result || !result.data?.rows || result.data.rows.length === 0) {
        return null
      }

      const tenant = result.data.rows[0]
      
      // For OAuth tenants, get a valid (potentially refreshed) access token
      let ghlApiKey = ''
      if (tenant.oauth_installation_id) {
        try {
          const { oauthTokenManager } = await import('@/lib/ghl/oauth-token-manager')
          ghlApiKey = await oauthTokenManager.getValidAccessToken(tenant.oauth_installation_id)
        } catch (error) {
          console.error('Failed to get valid OAuth token:', error)
          // Fallback to direct query if token manager fails
          const oauthQuery = `
            SELECT access_token FROM oauth_installations 
            WHERE id = $1
          `
          const oauthResult = await db.executeSql(oauthQuery, [tenant.oauth_installation_id])
          if (oauthResult?.data?.rows?.[0]) {
            const encryptedToken = oauthResult.data.rows[0].access_token
            ghlApiKey = await this.decryptOAuthToken(encryptedToken)
          }
        }
      }

      return {
        id: tenant.id,
        name: tenant.name,
        ghlApiKey: ghlApiKey,
        ghlLocationId: tenant.ghl_location_id,
        plan: tenant.plan,
        status: tenant.status
      }
    } catch (error) {
      console.error('Error getting tenant config:', error)
      return null
    }
  }

  /**
   * Rate limiting check
   */
  async checkRateLimit(tenantId: string): Promise<{ allowed: boolean; resetTime?: number }> {
    const now = Date.now()
    const windowMs = 15 * 60 * 1000 // 15 minutes
    const maxRequests = 1000 // requests per window

    const key = `rate_limit_${tenantId}`
    const current = this.rateLimitMap.get(key)

    if (!current || now > current.resetTime) {
      // Reset or initialize
      this.rateLimitMap.set(key, {
        count: 1,
        resetTime: now + windowMs
      })
      return { allowed: true }
    }

    if (current.count >= maxRequests) {
      return { 
        allowed: false, 
        resetTime: current.resetTime 
      }
    }

    // Increment count
    current.count++
    this.rateLimitMap.set(key, current)

    return { allowed: true }
  }

  /**
   * Record API usage for billing and analytics
   */
  async recordUsage(
    tenantId: string,
    endpoint: string,
    method: string,
    responseTime: number,
    statusCode: number,
    tokensCost?: number,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      // For development, just log the usage
      if (process.env.NODE_ENV === 'development') {
        console.log('Usage recorded:', {
          tenantId,
          endpoint,
          method,
          responseTime,
          statusCode,
          tokensCost
        })
        return
      }
      
      const query = `
        INSERT INTO usage_records (
          tenant_id, endpoint, method, response_time, status_code, tokens_cost, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `

      const params = [
        tenantId,
        endpoint,
        method,
        responseTime,
        statusCode,
        tokensCost || 0,
        JSON.stringify(metadata || {})
      ]

      await dbOperations.query(query, params)
    } catch (error) {
      console.error('Error recording usage:', error)
      // Don't throw - usage recording shouldn't break the main request
    }
  }

  /**
   * Middleware function for tenant authentication
   */
  async authenticateRequest(request: NextRequest): Promise<{
    success: boolean
    tenant?: TenantAuth
    tenantConfig?: any
    error?: string
    statusCode?: number
  }> {
    try {
      // Extract API key from headers
      const apiKey = request.headers.get('X-Tenant-API-Key') || 
                    request.headers.get('Authorization')?.replace('Bearer ', '')

      if (!apiKey) {
        return {
          success: false,
          error: 'API key required',
          statusCode: 401
        }
      }

      // Authenticate tenant
      const tenant = await this.authenticateTenant(apiKey)
      if (!tenant) {
        return {
          success: false,
          error: 'Invalid API key',
          statusCode: 401
        }
      }

      // Check rate limiting
      const rateLimit = await this.checkRateLimit(tenant.tenantId)
      if (!rateLimit.allowed) {
        return {
          success: false,
          error: 'Rate limit exceeded',
          statusCode: 429
        }
      }

      // Get tenant configuration
      const tenantConfig = await this.getTenantConfig(tenant.tenantId)
      if (!tenantConfig) {
        return {
          success: false,
          error: 'Tenant configuration not found',
          statusCode: 404
        }
      }

      return {
        success: true,
        tenant,
        tenantConfig
      }
    } catch (error) {
      console.error('Authentication error:', error)
      
      if (error instanceof APIError) {
        return {
          success: false,
          error: error.message,
          statusCode: error.statusCode
        }
      }

      return {
        success: false,
        error: 'Authentication failed',
        statusCode: 500
      }
    }
  }

  /**
   * Get permissions based on plan
   */
  private getPermissionsForPlan(plan: string): string[] {
    const permissions: Record<string, string[]> = {
      starter: ['mcp:basic', 'rl:basic'],
      professional: ['mcp:basic', 'mcp:advanced', 'rl:basic', 'rl:advanced'],
      enterprise: ['mcp:basic', 'mcp:advanced', 'rl:basic', 'rl:advanced', 'rl:custom', 'analytics:full']
    }

    return permissions[plan] || permissions.starter
  }

  /**
   * Create anonymized hash for RL system
   */
  createAnonymizedHash(tenantId: string, data: string): string {
    const salt = process.env.RL_ANONYMIZATION_SALT || 'rl-salt-change-in-production'
    return crypto.createHash('sha256').update(tenantId + data + salt).digest('hex')
  }
}


// Export singleton instance
export const tenantAuth = TenantAuthService.getInstance()