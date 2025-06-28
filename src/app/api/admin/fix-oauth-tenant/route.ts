/**
 * Fix OAuth tenant creation for existing installations
 */

import { NextRequest, NextResponse } from 'next/server'
import { neonDatabaseManager } from '@/lib/db/neon-database-manager'
import { tenantAuth } from '@/lib/auth/tenant-auth'
import * as crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const db = neonDatabaseManager.getDatabase()
    
    // Check if there are any oauth_installations without corresponding tenants
    const orphanedInstallations = await db.executeSql(
      `SELECT oi.* 
       FROM oauth_installations oi
       LEFT JOIN tenants t ON t.oauth_installation_id = oi.id
       WHERE t.tenant_id IS NULL`,
      []
    )
    
    const fixed = []
    const errors = []
    
    for (const installation of (orphanedInstallations?.data?.rows || [])) {
      try {
        // Generate tenant data
        const tenantId = installation.tenant_id || crypto.randomUUID()
        const subdomain = `tenant-${tenantId.slice(0, 8)}`
        const apiKey = tenantAuth.generateApiKey()
        const apiKeyHash = tenantAuth.hashApiKey(apiKey)
        
        // Create tenant
        const result = await db.executeSql(
          `INSERT INTO tenants (
            tenant_id, subdomain, auth_method, oauth_installation_id,
            api_key_hash, ghl_location_id, name, email, plan, status,
            created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
          ON CONFLICT (tenant_id) DO UPDATE SET
            oauth_installation_id = EXCLUDED.oauth_installation_id,
            api_key_hash = EXCLUDED.api_key_hash,
            ghl_location_id = EXCLUDED.ghl_location_id,
            updated_at = NOW()
          RETURNING *`,
          [
            tenantId,
            subdomain,
            'oauth',
            installation.id,
            apiKeyHash,
            installation.location_id,
            subdomain,
            `${subdomain}@dealflow.ai`,
            'starter',
            'active'
          ]
        )
        
        // Also create API key record
        await db.executeSql(
          `INSERT INTO api_keys (
            tenant_id, key_hash, key_prefix, name, is_active, created_at
          ) VALUES ($1, $2, $3, $4, $5, NOW())
          ON CONFLICT (key_hash) DO NOTHING`,
          [
            tenantId,
            apiKeyHash,
            'ghl_mcp_',
            'OAuth Generated Key',
            true
          ]
        )
        
        fixed.push({
          installationId: installation.id,
          tenantId,
          apiKey,
          locationId: installation.location_id
        })
      } catch (err: any) {
        errors.push({
          installationId: installation.id,
          error: err.message
        })
      }
    }
    
    // Get current stats
    const stats = await db.executeSql(
      `SELECT 
        (SELECT COUNT(*) FROM oauth_installations) as total_installations,
        (SELECT COUNT(*) FROM tenants) as total_tenants,
        (SELECT COUNT(*) FROM tenants WHERE oauth_installation_id IS NOT NULL) as oauth_tenants,
        (SELECT COUNT(*) FROM api_keys) as total_api_keys`,
      []
    )
    
    return NextResponse.json({
      orphanedInstallations: orphanedInstallations?.data?.rows?.length || 0,
      fixed: fixed.length,
      errors: errors.length,
      details: {
        fixed,
        errors
      },
      stats: stats?.data?.rows?.[0] || {},
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('Fix OAuth tenant error:', error)
    return NextResponse.json({
      error: error.message,
      details: error.detail || null,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}