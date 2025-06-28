/**
 * Check database schema
 */

import { NextRequest, NextResponse } from 'next/server'
import { neonDatabaseManager } from '@/lib/db/neon-database-manager'

export async function GET(request: NextRequest) {
  try {
    const db = neonDatabaseManager.getDatabase()
    
    // Check if tables exist
    const tablesResult = await db.executeSql(
      `SELECT table_name 
       FROM information_schema.tables 
       WHERE table_schema = 'public' 
       AND table_type = 'BASE TABLE'
       ORDER BY table_name`,
      []
    )
    
    // Check tenants table structure
    const columnsResult = await db.executeSql(
      `SELECT column_name, data_type, is_nullable, column_default
       FROM information_schema.columns
       WHERE table_schema = 'public' 
       AND table_name = 'tenants'
       ORDER BY ordinal_position`,
      []
    )
    
    // Check if any tenants exist at all
    const allTenantsResult = await db.executeSql(
      `SELECT * FROM tenants LIMIT 5`,
      []
    )
    
    // Check oauth_installations
    const oauthResult = await db.executeSql(
      `SELECT COUNT(*) as count FROM oauth_installations`,
      []
    )
    
    return NextResponse.json({
      tables: tablesResult?.data?.rows || [],
      tenants: {
        columns: columnsResult?.data?.rows || [],
        sampleData: allTenantsResult?.data?.rows || [],
        totalCount: allTenantsResult?.data?.rows?.length || 0
      },
      oauth_installations: {
        count: oauthResult?.data?.rows?.[0]?.count || 0
      },
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('Schema check error:', error)
    return NextResponse.json({
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}