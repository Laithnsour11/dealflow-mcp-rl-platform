/**
 * Database health check endpoint
 */

import { NextRequest, NextResponse } from 'next/server'
import { neonDatabaseManager } from '@/lib/db/neon-database-manager'

export async function GET(request: NextRequest) {
  try {
    const db = neonDatabaseManager.getDatabase()
    
    // Basic health check
    const healthResult = await db.executeSql('SELECT 1 as healthy', [])
    
    // Check tenants table
    const tenantsResult = await db.executeSql(
      'SELECT COUNT(*) as count FROM tenants WHERE status = $1',
      ['active']
    )
    
    // Check recent tenants (without exposing sensitive data)
    const recentResult = await db.executeSql(
      `SELECT tenant_id, subdomain, status, created_at, 
              CASE WHEN api_key_hash IS NOT NULL THEN 'set' ELSE 'not set' END as has_api_key,
              CASE WHEN oauth_installation_id IS NOT NULL THEN 'yes' ELSE 'no' END as has_oauth
       FROM tenants 
       ORDER BY created_at DESC 
       LIMIT 5`,
      []
    )

    return NextResponse.json({
      status: 'healthy',
      database: {
        connected: healthResult?.success || false,
        url: process.env.DATABASE_URL ? 'configured' : 'not configured'
      },
      tenants: {
        active: tenantsResult?.data?.rows?.[0]?.count || 0,
        recent: recentResult?.data?.rows || []
      },
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('Database health check error:', error)
    return NextResponse.json({
      status: 'error',
      error: error.message,
      database: {
        connected: false,
        url: process.env.DATABASE_URL ? 'configured' : 'not configured'
      },
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}