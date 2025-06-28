/**
 * Debug endpoint to check authentication
 */

import { NextRequest, NextResponse } from 'next/server'
import { tenantAuth } from '@/lib/auth/tenant-auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { apiKey } = body
    
    if (!apiKey) {
      return NextResponse.json({
        error: 'API key required in request body'
      }, { status: 400 })
    }
    
    // Check API key format
    const isValidFormat = apiKey.startsWith('ghl_mcp_')
    
    // Generate hash
    const apiKeyHash = tenantAuth.hashApiKey(apiKey)
    
    // Try to authenticate
    const authResult = await tenantAuth.authenticateTenant(apiKey)
    
    return NextResponse.json({
      apiKey: {
        provided: apiKey.substring(0, 12) + '...',
        validFormat: isValidFormat,
        hash: apiKeyHash.substring(0, 8) + '...'
      },
      authentication: {
        success: !!authResult,
        tenantId: authResult?.tenantId || null,
        permissions: authResult?.permissions || []
      },
      debug: {
        timestamp: new Date().toISOString()
      }
    })
  } catch (error: any) {
    console.error('Debug auth error:', error)
    return NextResponse.json({
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
  }
}