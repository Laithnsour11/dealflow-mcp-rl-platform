/**
 * Fix database schema - Add missing columns and update structure
 */

import { NextRequest, NextResponse } from 'next/server'
import { neonDatabaseManager } from '@/lib/db/neon-database-manager'

export async function POST(request: NextRequest) {
  try {
    // Check admin authorization
    const adminKey = request.headers.get('X-Admin-Key')
    if (adminKey !== process.env.ADMIN_API_KEY && process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin key required' },
        { status: 401 }
      )
    }

    const db = neonDatabaseManager.getDatabase()
    const results = []

    // 1. Check if tenant_id column exists
    const checkColumn = await db.executeSql(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'tenants' 
      AND column_name = 'tenant_id'
    `, [])

    if (!checkColumn?.data?.rows?.length) {
      // Add tenant_id column
      results.push('Adding tenant_id column...')
      await db.executeSql(`
        ALTER TABLE tenants 
        ADD COLUMN IF NOT EXISTS tenant_id UUID UNIQUE DEFAULT uuid_generate_v4()
      `, [])

      // Update existing rows to have tenant_id = id
      await db.executeSql(`
        UPDATE tenants 
        SET tenant_id = id 
        WHERE tenant_id IS NULL
      `, [])

      results.push('✓ Added tenant_id column')
    } else {
      results.push('✓ tenant_id column already exists')
    }

    // 2. Check if subdomain column exists
    const checkSubdomain = await db.executeSql(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'tenants' 
      AND column_name = 'subdomain'
    `, [])

    if (!checkSubdomain?.data?.rows?.length) {
      results.push('Adding subdomain column...')
      await db.executeSql(`
        ALTER TABLE tenants 
        ADD COLUMN IF NOT EXISTS subdomain VARCHAR(255) UNIQUE
      `, [])

      // Generate subdomains from tenant names
      await db.executeSql(`
        UPDATE tenants 
        SET subdomain = LOWER(REPLACE(name, ' ', '-'))
        WHERE subdomain IS NULL
      `, [])

      results.push('✓ Added subdomain column')
    } else {
      results.push('✓ subdomain column already exists')
    }

    // 3. Check if oauth_installation_id column exists
    const checkOAuth = await db.executeSql(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'tenants' 
      AND column_name = 'oauth_installation_id'
    `, [])

    if (!checkOAuth?.data?.rows?.length) {
      results.push('Adding oauth_installation_id column...')
      await db.executeSql(`
        ALTER TABLE tenants 
        ADD COLUMN IF NOT EXISTS oauth_installation_id UUID
      `, [])
      results.push('✓ Added oauth_installation_id column')
    } else {
      results.push('✓ oauth_installation_id column already exists')
    }

    // 4. Check if usage_limit column exists (might be named usage_quota)
    const checkUsageLimit = await db.executeSql(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'tenants' 
      AND column_name = 'usage_limit'
    `, [])

    if (!checkUsageLimit?.data?.rows?.length) {
      results.push('Adding usage_limit column...')
      await db.executeSql(`
        ALTER TABLE tenants 
        ADD COLUMN IF NOT EXISTS usage_limit INTEGER DEFAULT 1000
      `, [])
      
      // Copy from usage_quota if it exists
      await db.executeSql(`
        UPDATE tenants 
        SET usage_limit = usage_quota 
        WHERE usage_limit IS NULL AND usage_quota IS NOT NULL
      `, [])
      
      results.push('✓ Added usage_limit column')
    } else {
      results.push('✓ usage_limit column already exists')
    }

    // 5. Create index on tenant_id if it doesn't exist
    await db.executeSql(`
      CREATE INDEX IF NOT EXISTS idx_tenants_tenant_id ON tenants(tenant_id)
    `, [])
    results.push('✓ Created index on tenant_id')

    // 6. Create index on subdomain if it doesn't exist
    await db.executeSql(`
      CREATE INDEX IF NOT EXISTS idx_tenants_subdomain ON tenants(subdomain)
    `, [])
    results.push('✓ Created index on subdomain')

    // 7. Verify final structure
    const finalCheck = await db.executeSql(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'tenants'
      ORDER BY ordinal_position
    `, [])

    return NextResponse.json({
      success: true,
      message: 'Schema fixes applied successfully',
      results,
      currentColumns: finalCheck?.data?.rows || [],
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('Schema fix error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fix schema',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

// GET endpoint to check current schema
export async function GET(request: NextRequest) {
  try {
    const db = neonDatabaseManager.getDatabase()
    
    // Get all columns in tenants table
    const columns = await db.executeSql(`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'tenants'
      ORDER BY ordinal_position
    `, [])

    // Get row count
    const count = await db.executeSql(`
      SELECT COUNT(*) as count FROM tenants
    `, [])

    // Get indexes
    const indexes = await db.executeSql(`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename = 'tenants'
    `, [])

    return NextResponse.json({
      columns: columns?.data?.rows || [],
      rowCount: count?.data?.rows?.[0]?.count || 0,
      indexes: indexes?.data?.rows || [],
      recommendations: [
        'Run POST to this endpoint to apply schema fixes',
        'This will add missing columns: tenant_id, subdomain, oauth_installation_id, usage_limit',
        'All operations are safe and use IF NOT EXISTS'
      ]
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}