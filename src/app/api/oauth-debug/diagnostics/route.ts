/**
 * Comprehensive diagnostics endpoint for authentication issues
 */

import { NextRequest, NextResponse } from 'next/server'
import { neonDatabaseManager } from '@/lib/db/neon-database-manager'
import { tenantAuth } from '@/lib/auth/tenant-auth'
import * as crypto from 'crypto'

export async function GET(request: NextRequest) {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      appUrl: process.env.NEXT_PUBLIC_APP_URL,
      databaseConfigured: !!process.env.DATABASE_URL,
      encryptionKeyConfigured: !!process.env.ENCRYPTION_KEY,
      apiKeySaltConfigured: !!process.env.API_KEY_SALT,
    },
    database: {
      connected: false,
      error: null,
      stats: {}
    },
    tenants: {
      count: 0,
      recent: [],
      withApiKeys: 0,
      withOAuth: 0
    },
    apiKeyTest: null,
    recommendations: []
  }

  try {
    // Test database connection
    const db = neonDatabaseManager.getDatabase()
    const healthCheck = await db.executeSql('SELECT 1 as connected', [])
    diagnostics.database.connected = healthCheck?.success || false

    if (diagnostics.database.connected) {
      // Get tenant statistics
      const countResult = await db.executeSql(
        'SELECT COUNT(*) as total, COUNT(api_key_hash) as with_api_keys, COUNT(oauth_installation_id) as with_oauth FROM tenants',
        []
      )
      
      if (countResult?.data?.rows?.[0]) {
        const stats = countResult.data.rows[0]
        diagnostics.tenants.count = parseInt(stats.total) || 0
        diagnostics.tenants.withApiKeys = parseInt(stats.with_api_keys) || 0
        diagnostics.tenants.withOAuth = parseInt(stats.with_oauth) || 0
      }

      // Get recent tenants with masked sensitive data
      const recentResult = await db.executeSql(
        `SELECT 
          tenant_id,
          subdomain,
          status,
          created_at,
          CASE WHEN api_key_hash IS NOT NULL THEN 'SET' ELSE 'NOT SET' END as api_key_status,
          CASE WHEN oauth_installation_id IS NOT NULL THEN oauth_installation_id ELSE 'NOT SET' END as oauth_status,
          plan,
          usage_limit,
          current_usage
        FROM tenants 
        ORDER BY created_at DESC 
        LIMIT 5`,
        []
      )

      if (recentResult?.data?.rows) {
        diagnostics.tenants.recent = recentResult.data.rows
      }

      // Check if tables exist
      const tablesResult = await db.executeSql(
        `SELECT table_name FROM information_schema.tables 
         WHERE table_schema = 'public' 
         AND table_name IN ('tenants', 'oauth_installations', 'usage_records')`,
        []
      )
      
      diagnostics.database.tables = tablesResult?.data?.rows?.map((r: any) => r.table_name) || []
    }
  } catch (error: any) {
    diagnostics.database.error = error.message
    diagnostics.database.connected = false
  }

  // Test API key generation and hashing
  try {
    const testApiKey = tenantAuth.generateApiKey()
    const testHash = tenantAuth.hashApiKey(testApiKey)
    
    diagnostics.apiKeyTest = {
      sampleFormat: testApiKey.substring(0, 12) + '...',
      hashLength: testHash.length,
      validFormat: testApiKey.startsWith('ghl_mcp_'),
      hashAlgorithm: 'sha256'
    }
  } catch (error: any) {
    diagnostics.apiKeyTest = {
      error: error.message
    }
  }

  // Add recommendations based on diagnostics
  if (!diagnostics.database.connected) {
    diagnostics.recommendations.push({
      issue: 'Database not connected',
      action: 'Check DATABASE_URL environment variable and ensure Neon database is accessible'
    })
  }

  if (diagnostics.tenants.count === 0) {
    diagnostics.recommendations.push({
      issue: 'No tenants found in database',
      action: 'Create a test tenant using the admin/tenant endpoint or complete OAuth flow'
    })
  }

  if (!diagnostics.environment.encryptionKeyConfigured) {
    diagnostics.recommendations.push({
      issue: 'No encryption key configured',
      action: 'Set ENCRYPTION_KEY environment variable for secure token storage'
    })
  }

  if (!diagnostics.environment.apiKeySaltConfigured) {
    diagnostics.recommendations.push({
      issue: 'No API key salt configured',
      action: 'Set API_KEY_SALT environment variable for secure API key hashing'
    })
  }

  // Add test endpoints
  diagnostics.testEndpoints = {
    createTestTenant: '/api/admin/tenant (POST)',
    testAuth: '/api/debug/auth (POST with apiKey in body)',
    healthCheck: '/api/health/db',
    initDatabase: '/api/admin/init-db (POST)'
  }

  return NextResponse.json(diagnostics, { 
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    }
  })
}

// POST endpoint to test specific API key
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { apiKey } = body

    if (!apiKey) {
      return NextResponse.json({
        error: 'Please provide apiKey in request body'
      }, { status: 400 })
    }

    // Test the API key
    const validFormat = apiKey.startsWith('ghl_mcp_')
    const apiKeyHash = tenantAuth.hashApiKey(apiKey)
    
    // Try to authenticate
    const authResult = await tenantAuth.authenticateTenant(apiKey)
    
    // Check database for this hash
    const db = neonDatabaseManager.getDatabase()
    const dbResult = await db.executeSql(
      'SELECT tenant_id, subdomain, status FROM tenants WHERE api_key_hash = $1',
      [apiKeyHash]
    )

    return NextResponse.json({
      apiKey: {
        provided: apiKey.substring(0, 16) + '...',
        validFormat,
        hash: apiKeyHash.substring(0, 16) + '...'
      },
      authentication: {
        success: !!authResult,
        result: authResult
      },
      database: {
        found: dbResult?.data?.rows?.length > 0,
        tenant: dbResult?.data?.rows?.[0] || null
      },
      debug: {
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
      }
    })
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
  }
}