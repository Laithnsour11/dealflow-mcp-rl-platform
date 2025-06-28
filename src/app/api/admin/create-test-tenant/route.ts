/**
 * Create a test tenant for debugging
 */

import { NextRequest, NextResponse } from 'next/server'
import { neonDatabaseManager } from '@/lib/db/neon-database-manager'
import { tenantAuth } from '@/lib/auth/tenant-auth'
import * as crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const db = neonDatabaseManager.getDatabase()
    
    // Generate test data
    const tenantId = crypto.randomUUID()
    const subdomain = `test-${Date.now()}`
    const apiKey = tenantAuth.generateApiKey()
    const apiKeyHash = tenantAuth.hashApiKey(apiKey)
    
    // Create test tenant
    const result = await db.executeSql(
      `INSERT INTO tenants (
        tenant_id, subdomain, auth_method, api_key_hash,
        ghl_location_id, name, email, plan, status,
        usage_limit, current_usage, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
      ON CONFLICT (tenant_id) DO UPDATE SET
        api_key_hash = EXCLUDED.api_key_hash,
        updated_at = NOW()
      RETURNING *`,
      [
        tenantId,
        subdomain,
        'api_key',
        apiKeyHash,
        'test-location-123',
        'Test Tenant',
        'test@example.com',
        'starter',
        'active',
        1000,
        0
      ]
    )
    
    // Also create an API key record
    await db.executeSql(
      `INSERT INTO api_keys (
        tenant_id, key_hash, key_prefix, name, is_active, created_at
      ) VALUES ($1, $2, $3, $4, $5, NOW())
      ON CONFLICT (key_hash) DO NOTHING`,
      [
        tenantId,
        apiKeyHash,
        'ghl_mcp_',
        'Test API Key',
        true
      ]
    )
    
    return NextResponse.json({
      success: true,
      tenant: {
        tenantId,
        subdomain,
        apiKey,
        apiKeyHash: apiKeyHash.substring(0, 8) + '...'
      },
      created: result?.data?.rows?.[0] || null,
      instructions: {
        testAuth: `curl -X POST https://dealflow-mcp-rl-platform.vercel.app/api/debug/auth -H "Content-Type: application/json" -d '{"apiKey": "${apiKey}"}'`,
        testEndpoint: `curl https://dealflow-mcp-rl-platform.vercel.app/api/mcp/get_location -H "X-Tenant-API-Key: ${apiKey}"`
      }
    })
  } catch (error: any) {
    console.error('Create test tenant error:', error)
    return NextResponse.json({
      error: error.message,
      details: error.detail || null,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}