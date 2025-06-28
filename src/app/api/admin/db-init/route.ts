/**
 * Database initialization endpoint
 * Creates necessary tables if they don't exist
 */

import { NextRequest, NextResponse } from 'next/server'
import { neonDatabaseManager } from '@/lib/db/neon-database-manager'
import { getSchemaStatements } from '@/lib/db/schema-constants'

export async function POST(request: NextRequest) {
  try {
    // Check admin authorization
    const adminKey = request.headers.get('X-Admin-Key')
    if (adminKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = neonDatabaseManager.getDatabase()
    const results = []
    
    // Get schema statements
    const statements = getSchemaStatements()
    
    // Execute each statement
    for (const statement of statements) {
      try {
        const tableName = statement.match(/CREATE TABLE (?:IF NOT EXISTS )?(\w+)/)?.[1] || 'unknown'
        console.log(`Creating table: ${tableName}`)
        
        const result = await db.executeSql(statement, [])
        results.push({
          table: tableName,
          success: true,
          message: 'Table created or already exists'
        })
      } catch (error: any) {
        const tableName = statement.match(/CREATE TABLE (?:IF NOT EXISTS )?(\w+)/)?.[1] || 'unknown'
        console.error(`Error creating table ${tableName}:`, error)
        results.push({
          table: tableName,
          success: false,
          error: error.message
        })
      }
    }

    // Check if tables exist
    const checkQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `
    
    const tablesResult = await db.executeSql(checkQuery, [])
    const existingTables = tablesResult?.data?.rows?.map((row: any) => row.table_name) || []

    return NextResponse.json({
      success: true,
      results,
      existingTables,
      databaseConnected: !!process.env.DATABASE_URL
    })
  } catch (error: any) {
    console.error('Database initialization error:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      databaseConnected: !!process.env.DATABASE_URL
    }, { status: 500 })
  }
}

// GET endpoint to check database status
export async function GET(request: NextRequest) {
  try {
    // Check admin authorization
    const adminKey = request.headers.get('X-Admin-Key')
    if (adminKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = neonDatabaseManager.getDatabase()
    
    // Check if tables exist
    const checkQuery = `
      SELECT table_name, 
             (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `
    
    const tablesResult = await db.executeSql(checkQuery, [])
    const tables = tablesResult?.data?.rows || []

    // Get row counts for each table
    const tableCounts: any = {}
    for (const table of tables) {
      try {
        const countResult = await db.executeSql(`SELECT COUNT(*) as count FROM ${table.table_name}`, [])
        tableCounts[table.table_name] = countResult?.data?.rows?.[0]?.count || 0
      } catch (error) {
        tableCounts[table.table_name] = 'error'
      }
    }

    return NextResponse.json({
      success: true,
      databaseConnected: !!process.env.DATABASE_URL,
      databaseUrl: process.env.DATABASE_URL ? 
        (process.env.DATABASE_URL.includes('neon.tech') ? 'Neon Cloud' : 'Other Database') : 
        'Not configured',
      tables: tables.map((t: any) => ({
        name: t.table_name,
        columns: t.column_count,
        rows: tableCounts[t.table_name]
      }))
    })
  } catch (error: any) {
    console.error('Database status check error:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      databaseConnected: !!process.env.DATABASE_URL
    }, { status: 500 })
  }
}