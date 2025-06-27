/**
 * Database Initialization API Endpoint
 * Sets up the multi-tenant schema using Neon MCP
 */

import { NextRequest, NextResponse } from 'next/server'
import { neonMCP, dbOperations } from '@/lib/db/neon-mcp-client'
import { directDb, dbOperationsDirect } from '@/lib/db/direct-db-client'

export async function POST(request: NextRequest) {
  try {
    // Check if we have admin authorization
    const adminKey = request.headers.get('X-Admin-Key')
    if (adminKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin key required' },
        { status: 401 }
      )
    }

    // For development, use direct DB client
    const isDevelopment = process.env.NODE_ENV === 'development'
    
    if (isDevelopment) {
      // Use direct client for development
      const healthCheck = await dbOperationsDirect.checkHealth()
      
      if (healthCheck.healthy) {
        return NextResponse.json({
          success: true,
          message: 'Database is already properly initialized (dev mode)',
          tables: healthCheck.tables,
          timestamp: new Date().toISOString()
        })
      }

      // Initialize the schema
      console.log('Initializing database schema (dev mode)...')
      await dbOperationsDirect.ensureSchema()

      return NextResponse.json({
        success: true,
        message: 'Database schema initialized successfully (dev mode)',
        tables: ['tenants', 'tenant_auth', 'usage_records', 'conversations'],
        timestamp: new Date().toISOString()
      })
    } else {
      // Production mode - use MCP
      const healthCheck = await neonMCP.checkDatabaseHealth()
      
      if (healthCheck.healthy) {
        return NextResponse.json({
          success: true,
          message: 'Database is already properly initialized',
          tables: healthCheck.tables,
          timestamp: new Date().toISOString()
        })
      }

      // Initialize the schema
      console.log('Initializing database schema...')
      await dbOperations.ensureSchema()

      // Verify initialization
      const postInitHealth = await neonMCP.checkDatabaseHealth()
      
      if (!postInitHealth.healthy) {
        throw new Error(`Schema initialization failed: ${postInitHealth.error}`)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Database schema initialized successfully',
      tables: postInitHealth.tables,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Database initialization error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check admin authorization
    const adminKey = request.headers.get('X-Admin-Key')
    if (adminKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin key required' },
        { status: 401 }
      )
    }

    // Get database health status
    const healthCheck = await neonMCP.checkDatabaseHealth()
    
    return NextResponse.json({
      success: true,
      healthy: healthCheck.healthy,
      tables: healthCheck.tables,
      error: healthCheck.error,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Database health check error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}