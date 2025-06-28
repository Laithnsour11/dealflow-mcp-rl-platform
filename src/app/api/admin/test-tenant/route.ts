/**
 * Create a test tenant for development/testing
 * This endpoint should be protected in production
 */

import { NextRequest, NextResponse } from 'next/server'
import { neonDatabaseManager } from '@/lib/db/neon-database-manager'
import { tenantAuth } from '@/lib/auth/tenant-auth'
import * as crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    // In production, you should verify admin authentication here
    if (process.env.NODE_ENV === 'production') {
      const adminSecret = request.headers.get('X-Admin-Secret')
      if (adminSecret !== process.env.ADMIN_SECRET) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
    }

    const body = await request.json()
    const {
      subdomain = 'test-tenant',
      name = 'Test Tenant',
      email = 'test@example.com',
      ghlLocationId = 'test-location-123',
      plan = 'pro',
      usageLimit = 10000
    } = body

    // Generate proper API key
    const apiKey = tenantAuth.generateApiKey()
    const apiKeyHash = tenantAuth.hashApiKey(apiKey)
    const tenantId = crypto.randomUUID()

    // Insert into database
    const db = neonDatabaseManager.getDatabase()
    
    const insertQuery = `
      INSERT INTO tenants (
        tenant_id,
        subdomain,
        api_key_hash,
        ghl_location_id,
        plan,
        status,
        usage_limit,
        current_usage,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      RETURNING *
    `

    const params = [
      tenantId,
      subdomain,
      apiKeyHash,
      ghlLocationId,
      plan,
      'active',
      usageLimit,
      0
    ]

    const result = await db.executeSql(insertQuery, params)

    if (!result.success) {
      throw new Error(`Database error: ${result.error}`)
    }

    const tenant = result.data?.rows?.[0]

    // Return the tenant info with the unhashed API key
    return NextResponse.json({
      success: true,
      tenant: {
        id: tenant.tenant_id,
        subdomain: tenant.subdomain,
        plan: tenant.plan,
        status: tenant.status,
        ghlLocationId: tenant.ghl_location_id,
        usageLimit: tenant.usage_limit,
        currentUsage: tenant.current_usage,
        createdAt: tenant.created_at
      },
      apiKey: apiKey, // Return the actual API key only once on creation
      instructions: {
        authentication: 'Use the apiKey in X-Tenant-API-Key header for requests',
        testEndpoint: '/api/mcp/available-tools',
        exampleCurl: `curl -H "X-Tenant-API-Key: ${apiKey}" ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/mcp/available-tools`
      }
    })
  } catch (error: any) {
    console.error('Error creating test tenant:', error)
    return NextResponse.json(
      { 
        error: error.message || 'Failed to create test tenant',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

// GET endpoint to check if test tenant exists
export async function GET(request: NextRequest) {
  try {
    const db = neonDatabaseManager.getDatabase()
    
    const query = `
      SELECT 
        tenant_id,
        subdomain,
        plan,
        status,
        usage_limit,
        current_usage,
        created_at,
        CASE WHEN api_key_hash IS NOT NULL THEN 'SET' ELSE 'NOT SET' END as api_key_status
      FROM tenants
      WHERE subdomain LIKE 'test-%'
      ORDER BY created_at DESC
      LIMIT 5
    `

    const result = await db.executeSql(query, [])

    return NextResponse.json({
      testTenants: result.data?.rows || [],
      count: result.data?.rows?.length || 0,
      instructions: {
        createNew: 'POST to this endpoint to create a new test tenant',
        requiredHeaders: process.env.NODE_ENV === 'production' ? ['X-Admin-Secret'] : [],
        optionalBody: {
          subdomain: 'test-tenant (default)',
          name: 'Test Tenant (default)',
          email: 'test@example.com (default)',
          ghlLocationId: 'test-location-123 (default)',
          plan: 'pro (default)',
          usageLimit: '10000 (default)'
        }
      }
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}