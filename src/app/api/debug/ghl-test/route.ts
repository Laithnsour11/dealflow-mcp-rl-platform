/**
 * Debug endpoint to test GHL API directly
 */

import { NextRequest, NextResponse } from 'next/server'
import { tenantAuth } from '@/lib/auth/tenant-auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { apiKey, endpoint = '/locations/v1' } = body
    
    if (!apiKey) {
      return NextResponse.json({
        error: 'API key required in request body'
      }, { status: 400 })
    }
    
    // Authenticate
    const authResult = await tenantAuth.authenticateTenant(apiKey)
    if (!authResult) {
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 })
    }
    
    // Get tenant config with GHL credentials
    const tenantConfig = await tenantAuth.getTenantConfig(authResult.tenantId)
    if (!tenantConfig || !tenantConfig.ghlApiKey) {
      return NextResponse.json({ 
        error: 'No GHL API key found for tenant',
        tenantConfig: tenantConfig ? {
          hasConfig: true,
          hasGhlKey: !!tenantConfig.ghlApiKey
        } : { hasConfig: false }
      }, { status: 400 })
    }
    
    // Make direct API call to GHL
    const baseUrl = process.env.GHL_BASE_URL || 'https://services.leadconnectorhq.com'
    const url = `${baseUrl}${endpoint}${endpoint.includes('?') ? '&' : '?'}locationId=${tenantConfig.ghlLocationId}`
    
    console.log('Making GHL API call:', {
      url,
      locationId: tenantConfig.ghlLocationId,
      authHeader: `Bearer ${tenantConfig.ghlApiKey.substring(0, 10)}...`
    })
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${tenantConfig.ghlApiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Version': '2021-07-28'
      }
    })
    
    const responseText = await response.text()
    let responseData
    try {
      responseData = JSON.parse(responseText)
    } catch {
      responseData = responseText
    }
    
    return NextResponse.json({
      request: {
        url,
        locationId: tenantConfig.ghlLocationId,
        endpoint
      },
      response: {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data: responseData
      },
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('GHL test error:', error)
    return NextResponse.json({
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
  }
}