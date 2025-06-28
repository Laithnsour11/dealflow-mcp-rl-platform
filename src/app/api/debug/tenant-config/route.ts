/**
 * Debug endpoint to check tenant configuration
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
    
    // Authenticate and get tenant config
    const authResult = await tenantAuth.authenticateTenant(apiKey)
    if (!authResult) {
      return NextResponse.json({
        error: 'Authentication failed'
      }, { status: 401 })
    }
    
    // Get full tenant configuration
    const tenantConfig = await tenantAuth.getTenantConfig(authResult.tenantId)
    
    return NextResponse.json({
      authenticated: true,
      tenantId: authResult.tenantId,
      tenantConfig: tenantConfig ? {
        id: tenantConfig.id,
        name: tenantConfig.name,
        locationId: tenantConfig.ghlLocationId,
        plan: tenantConfig.plan,
        status: tenantConfig.status,
        hasGhlApiKey: !!tenantConfig.ghlApiKey,
        ghlApiKeyLength: tenantConfig.ghlApiKey?.length || 0,
        ghlApiKeyPrefix: tenantConfig.ghlApiKey?.substring(0, 10) || null
      } : null,
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('Debug tenant config error:', error)
    return NextResponse.json({
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
  }
}