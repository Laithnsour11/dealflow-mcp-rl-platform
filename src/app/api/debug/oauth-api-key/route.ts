/**
 * Get API key for OAuth tenant
 */

import { NextRequest, NextResponse } from 'next/server'
import { neonDatabaseManager } from '@/lib/db/neon-database-manager'

export async function GET(request: NextRequest) {
  try {
    const db = neonDatabaseManager.getDatabase()
    
    // Get OAuth tenants with their API keys
    const result = await db.executeSql(
      `SELECT 
        t.tenant_id,
        t.subdomain,
        t.location_id,
        t.oauth_installation_id,
        ak.key_hash,
        SUBSTRING(ak.key_hash, 1, 8) as hash_prefix,
        oi.location_id as oauth_location_id,
        oi.company_id
       FROM tenants t
       LEFT JOIN api_keys ak ON ak.tenant_id = t.tenant_id
       LEFT JOIN oauth_installations oi ON oi.id = t.oauth_installation_id
       WHERE t.auth_method = 'oauth'
       ORDER BY t.created_at DESC`,
      []
    )
    
    return NextResponse.json({
      oauthTenants: result?.data?.rows || [],
      instructions: {
        note: "The OAuth tenant's API key was shown when it was created. Look for the tenant with hash_prefix matching the one from the 'Fix OAuth Tenants' operation.",
        fixedTenant: {
          tenantId: "58d5ac27-e13b-4055-a826-bd254180ad52",
          apiKey: "ghl_mcp_361c82b4e1b16bf6ff0b6f565d7295048c50a7cc6beadc26d4861214ba4223fe",
          locationId: "d4ouozOIcshCJu5QH8oD"
        }
      }
    })
  } catch (error: any) {
    console.error('OAuth API key error:', error)
    return NextResponse.json({
      error: error.message
    }, { status: 500 })
  }
}