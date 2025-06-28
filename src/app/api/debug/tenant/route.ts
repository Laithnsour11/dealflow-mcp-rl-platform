/**
 * Debug endpoint to check tenant data
 */

import { NextRequest, NextResponse } from 'next/server'
import { tenantAuth } from '@/lib/auth/tenant-auth'
import { neonDatabaseManager } from '@/lib/db/neon-database-manager'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { apiKey } = body
    
    if (!apiKey) {
      return NextResponse.json({
        error: 'API key required in request body'
      }, { status: 400 })
    }
    
    // Generate hash
    const apiKeyHash = tenantAuth.hashApiKey(apiKey)
    
    // Query database directly
    const db = neonDatabaseManager.getDatabase()
    
    // Check if tenant exists with this API key hash
    const tenantResult = await db.executeSql(
      `SELECT tenant_id, subdomain, status, auth_method, 
              CASE WHEN api_key_hash IS NOT NULL THEN 'set' ELSE 'not set' END as has_api_key,
              CASE WHEN oauth_installation_id IS NOT NULL THEN 'yes' ELSE 'no' END as has_oauth,
              created_at, updated_at
       FROM tenants 
       WHERE api_key_hash = $1`,
      [apiKeyHash]
    )
    
    // Check all tenants (for debugging)
    const allTenantsResult = await db.executeSql(
      `SELECT tenant_id, subdomain, status, 
              SUBSTRING(api_key_hash, 1, 8) as api_key_hash_prefix,
              created_at
       FROM tenants 
       ORDER BY created_at DESC 
       LIMIT 10`,
      []
    )
    
    return NextResponse.json({
      apiKeyInfo: {
        provided: apiKey.substring(0, 12) + '...',
        hash: apiKeyHash.substring(0, 8) + '...',
        fullHash: apiKeyHash
      },
      tenant: {
        found: tenantResult?.data?.rows?.length > 0,
        data: tenantResult?.data?.rows?.[0] || null
      },
      allTenants: {
        count: allTenantsResult?.data?.rows?.length || 0,
        recent: allTenantsResult?.data?.rows || []
      },
      debug: {
        timestamp: new Date().toISOString()
      }
    })
  } catch (error: any) {
    console.error('Debug tenant error:', error)
    return NextResponse.json({
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
  }
}