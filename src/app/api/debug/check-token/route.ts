/**
 * Debug endpoint to check OAuth token
 */

import { NextRequest, NextResponse } from 'next/server'
import { neonDatabaseManager } from '@/lib/db/neon-database-manager'
import { tenantAuth } from '@/lib/auth/tenant-auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tenantId } = body
    
    if (!tenantId) {
      return NextResponse.json({
        error: 'Tenant ID required'
      }, { status: 400 })
    }
    
    const db = neonDatabaseManager.getDatabase()
    
    // Get OAuth installation
    const result = await db.executeSql(
      `SELECT 
        t.tenant_id,
        t.oauth_installation_id,
        oi.access_token,
        oi.expires_at,
        oi.installed_at
       FROM tenants t
       JOIN oauth_installations oi ON oi.id = t.oauth_installation_id
       WHERE t.tenant_id = $1`,
      [tenantId]
    )
    
    if (!result?.data?.rows?.[0]) {
      return NextResponse.json({
        error: 'Tenant or OAuth installation not found'
      }, { status: 404 })
    }
    
    const data = result.data.rows[0]
    
    // Try to decrypt the token
    let decryptedToken = null
    let tokenInfo = null
    let decryptError = null
    
    try {
      decryptedToken = await tenantAuth.decryptOAuthToken(data.access_token)
      
      // Check if it looks like a JWT
      const parts = decryptedToken.split('.')
      tokenInfo = {
        isJWT: parts.length === 3,
        parts: parts.length,
        startsWithEy: decryptedToken.startsWith('ey')
      }
    } catch (err: any) {
      decryptError = err.message
    }
    
    return NextResponse.json({
      tenant: {
        tenantId: data.tenant_id,
        oauthInstallationId: data.oauth_installation_id
      },
      token: {
        encryptedLength: data.access_token.length,
        encryptedPrefix: data.access_token.substring(0, 20) + '...',
        decryptedLength: decryptedToken?.length || 0,
        decryptedPrefix: decryptedToken?.substring(0, 20) + '...' || null,
        decryptError
      },
      tokenInfo,
      installation: {
        expiresAt: data.expires_at,
        installedAt: data.installed_at,
        isExpired: new Date(data.expires_at) < new Date()
      },
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('Check token error:', error)
    return NextResponse.json({
      error: error.message
    }, { status: 500 })
  }
}