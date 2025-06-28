/**
 * Debug endpoint to test authentication
 */

import { NextRequest, NextResponse } from 'next/server'
import { tenantAuth } from '@/lib/auth/tenant-auth'
import { neonDatabaseManager } from '@/lib/db/neon-database-manager'

export async function POST(request: NextRequest) {
  try {
    const { apiKey } = await request.json()
    
    if (!apiKey) {
      return NextResponse.json({ 
        error: 'API key required',
        headers: Object.fromEntries(request.headers.entries())
      }, { status: 400 })
    }

    // Test authentication
    console.log('Testing authentication with API key:', apiKey.substring(0, 16) + '...')
    
    const apiKeyHash = tenantAuth.hashApiKey(apiKey)
    console.log('Generated hash:', apiKeyHash.substring(0, 16) + '...')
    
    // Check if API key exists in database
    const db = neonDatabaseManager.getDatabase()
    const checkQuery = `
      SELECT tenant_id, subdomain, plan, status, api_key_hash, ghl_location_id, oauth_installation_id
      FROM tenants 
      WHERE api_key_hash = $1
    `
    
    const result = await db.executeSql(checkQuery, [apiKeyHash])
    console.log('Database query result:', result)
    
    if (!result?.data?.rows || result.data.rows.length === 0) {
      // Check all tenants for debugging
      const allTenantsQuery = `
        SELECT tenant_id, subdomain, api_key_hash, status, oauth_installation_id
        FROM tenants 
        ORDER BY created_at DESC
        LIMIT 10
      `
      const allTenants = await db.executeSql(allTenantsQuery, [])
      
      return NextResponse.json({ 
        error: 'No tenant found for API key',
        debug: {
          providedKeyPrefix: apiKey.substring(0, 16),
          generatedHash: apiKeyHash.substring(0, 16),
          recentTenants: allTenants.data?.rows?.map((t: any) => ({
            id: t.tenant_id,
            subdomain: t.subdomain,
            hashPrefix: t.api_key_hash?.substring(0, 16),
            status: t.status,
            hasOAuth: !!t.oauth_installation_id
          }))
        }
      })
    }
    
    const tenant = result.data.rows[0]
    
    // Try to authenticate
    const authResult = await tenantAuth.authenticateTenant(apiKey)
    
    return NextResponse.json({
      success: true,
      tenant: {
        id: tenant.tenant_id,
        subdomain: tenant.subdomain,
        status: tenant.status,
        plan: tenant.plan,
        hasOAuth: !!tenant.oauth_installation_id,
        locationId: tenant.ghl_location_id
      },
      authResult,
      debug: {
        apiKeyValid: !!authResult,
        hashMatches: tenant.api_key_hash === apiKeyHash
      }
    })
    
  } catch (error: any) {
    console.error('Debug auth error:', error)
    return NextResponse.json({ 
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}

// GET endpoint to check authentication headers
export async function GET(request: NextRequest) {
  const headers = Object.fromEntries(request.headers.entries())
  const apiKeyFromHeader = request.headers.get('X-Tenant-API-Key') || 
                          request.headers.get('Authorization')?.replace('Bearer ', '')
  
  return NextResponse.json({
    headers,
    apiKeyFound: !!apiKeyFromHeader,
    apiKeyPrefix: apiKeyFromHeader?.substring(0, 16)
  })
}