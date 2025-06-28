/**
 * Debug endpoint to check api_keys table
 */

import { NextRequest, NextResponse } from 'next/server'
import { neonDatabaseManager } from '@/lib/db/neon-database-manager'

export async function GET(request: NextRequest) {
  try {
    const db = neonDatabaseManager.getDatabase()
    
    // Check all API keys
    const apiKeysResult = await db.executeSql(
      `SELECT 
        ak.tenant_id,
        ak.key_prefix,
        SUBSTRING(ak.key_hash, 1, 8) as hash_prefix,
        ak.name,
        ak.is_active,
        ak.created_at,
        t.subdomain
       FROM api_keys ak
       LEFT JOIN tenants t ON t.tenant_id = ak.tenant_id
       ORDER BY ak.created_at DESC
       LIMIT 10`,
      []
    )
    
    // Check if there are any orphaned API keys
    const orphanedResult = await db.executeSql(
      `SELECT COUNT(*) as count
       FROM api_keys ak
       LEFT JOIN tenants t ON t.tenant_id = ak.tenant_id
       WHERE t.tenant_id IS NULL`,
      []
    )
    
    // Get recent tenants without API keys
    const tenantsWithoutKeys = await db.executeSql(
      `SELECT t.tenant_id, t.subdomain, t.auth_method, t.created_at
       FROM tenants t
       LEFT JOIN api_keys ak ON ak.tenant_id = t.tenant_id
       WHERE ak.tenant_id IS NULL
       ORDER BY t.created_at DESC
       LIMIT 5`,
      []
    )
    
    return NextResponse.json({
      apiKeys: {
        total: apiKeysResult?.data?.rows?.length || 0,
        records: apiKeysResult?.data?.rows || []
      },
      orphanedApiKeys: orphanedResult?.data?.rows?.[0]?.count || 0,
      tenantsWithoutApiKeys: tenantsWithoutKeys?.data?.rows || [],
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('Check API keys error:', error)
    return NextResponse.json({
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}