/**
 * Neon MCP Client - Database operations using MCP protocol
 * Integrates with the Neon MCP server for database management
 */

import { APIResponse } from '@/types'

interface NeonMCPConfig {
  mcpServerUrl?: string
  projectId?: string
  databaseName?: string
  branchId?: string
}

export class NeonMCPClient {
  private config: NeonMCPConfig
  private mcpServerUrl: string

  constructor(config: NeonMCPConfig = {}) {
    this.config = config
    this.mcpServerUrl = config.mcpServerUrl || process.env.NEON_MCP_SERVER_URL || 'http://localhost:8000'
  }

  /**
   * Execute SQL using Neon MCP server
   */
  async executeSql(sql: string, params?: any[]): Promise<APIResponse> {
    try {
      const response = await fetch(`${this.mcpServerUrl}/api/mcp/sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEON_MCP_API_KEY || ''}`,
        },
        body: JSON.stringify({
          sql,
          params,
          projectId: this.config.projectId || process.env.NEON_PROJECT_ID,
          databaseName: this.config.databaseName || process.env.NEON_DATABASE_NAME || 'neondb',
          branchId: this.config.branchId,
        }),
      })

      if (!response.ok) {
        throw new Error(`MCP SQL execution failed: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error executing SQL via MCP:', error)
      throw error
    }
  }

  /**
   * Execute multiple SQL statements in a transaction
   */
  async executeTransaction(statements: string[]): Promise<APIResponse> {
    try {
      const response = await fetch(`${this.mcpServerUrl}/api/mcp/transaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEON_MCP_API_KEY || ''}`,
        },
        body: JSON.stringify({
          sqlStatements: statements,
          projectId: this.config.projectId || process.env.NEON_PROJECT_ID,
          databaseName: this.config.databaseName || process.env.NEON_DATABASE_NAME || 'neondb',
          branchId: this.config.branchId,
        }),
      })

      if (!response.ok) {
        throw new Error(`MCP transaction failed: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error executing transaction via MCP:', error)
      throw error
    }
  }

  /**
   * Get database tables
   */
  async getTables(): Promise<APIResponse> {
    try {
      const response = await fetch(`${this.mcpServerUrl}/api/mcp/tables`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.NEON_MCP_API_KEY || ''}`,
        },
      })

      if (!response.ok) {
        throw new Error(`MCP get tables failed: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error getting tables via MCP:', error)
      throw error
    }
  }

  /**
   * Describe table schema
   */
  async describeTable(tableName: string): Promise<APIResponse> {
    try {
      const response = await fetch(`${this.mcpServerUrl}/api/mcp/table-schema`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEON_MCP_API_KEY || ''}`,
        },
        body: JSON.stringify({
          tableName,
          projectId: this.config.projectId || process.env.NEON_PROJECT_ID,
          databaseName: this.config.databaseName || process.env.NEON_DATABASE_NAME || 'neondb',
          branchId: this.config.branchId,
        }),
      })

      if (!response.ok) {
        throw new Error(`MCP describe table failed: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error describing table via MCP:', error)
      throw error
    }
  }

  /**
   * Initialize database schema
   */
  async initializeSchema(): Promise<APIResponse> {
    try {
      // Read the schema file
      const fs = await import('fs')
      const path = await import('path')
      
      const schemaPath = path.join(process.cwd(), 'src/lib/db/schema.sql')
      const schemaSQL = fs.readFileSync(schemaPath, 'utf8')

      // Split into individual statements
      const statements = schemaSQL
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))

      // Execute as transaction
      return await this.executeTransaction(statements)
    } catch (error) {
      console.error('Error initializing schema via MCP:', error)
      throw error
    }
  }

  /**
   * Check if database is properly initialized
   */
  async checkDatabaseHealth(): Promise<{ healthy: boolean; tables: string[]; error?: string }> {
    try {
      const tablesResponse = await this.getTables()
      
      if (!tablesResponse.success) {
        return {
          healthy: false,
          tables: [],
          error: tablesResponse.error || 'Failed to get tables'
        }
      }

      const tables = tablesResponse.data || []
      const requiredTables = [
        'tenants',
        'usage_records', 
        'rl_analyses',
        'conversion_outcomes',
        'ai_agent_configs',
        'lead_routing_rules',
        'webhook_events',
        'ab_tests',
        'analytics_metrics'
      ]

      const missingTables = requiredTables.filter(table => 
        !tables.some((t: any) => t.table_name === table)
      )

      return {
        healthy: missingTables.length === 0,
        tables: tables.map((t: any) => t.table_name),
        error: missingTables.length > 0 ? `Missing tables: ${missingTables.join(', ')}` : undefined
      }
    } catch (error) {
      return {
        healthy: false,
        tables: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Create a new branch for testing
   */
  async createBranch(branchName?: string): Promise<APIResponse> {
    try {
      const response = await fetch(`${this.mcpServerUrl}/api/mcp/create-branch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEON_MCP_API_KEY || ''}`,
        },
        body: JSON.stringify({
          branchName,
          projectId: this.config.projectId || process.env.NEON_PROJECT_ID,
        }),
      })

      if (!response.ok) {
        throw new Error(`MCP create branch failed: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error creating branch via MCP:', error)
      throw error
    }
  }

  /**
   * Database migration utilities
   */
  async prepareMigration(migrationSql: string): Promise<APIResponse> {
    try {
      const response = await fetch(`${this.mcpServerUrl}/api/mcp/prepare-migration`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEON_MCP_API_KEY || ''}`,
        },
        body: JSON.stringify({
          migrationSql,
          projectId: this.config.projectId || process.env.NEON_PROJECT_ID,
          databaseName: this.config.databaseName || process.env.NEON_DATABASE_NAME || 'neondb',
        }),
      })

      if (!response.ok) {
        throw new Error(`MCP prepare migration failed: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error preparing migration via MCP:', error)
      throw error
    }
  }

  async completeMigration(migrationId: string): Promise<APIResponse> {
    try {
      const response = await fetch(`${this.mcpServerUrl}/api/mcp/complete-migration`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEON_MCP_API_KEY || ''}`,
        },
        body: JSON.stringify({
          migrationId,
        }),
      })

      if (!response.ok) {
        throw new Error(`MCP complete migration failed: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error completing migration via MCP:', error)
      throw error
    }
  }
}

// Create singleton instance
export const neonMCP = new NeonMCPClient()

// Helper functions for common database operations
export const dbOperations = {
  /**
   * Initialize the database schema if needed
   */
  async ensureSchema(): Promise<void> {
    const health = await neonMCP.checkDatabaseHealth()
    
    if (!health.healthy) {
      console.log('Database not healthy, initializing schema...')
      const result = await neonMCP.initializeSchema()
      
      if (!result.success) {
        throw new Error(`Failed to initialize schema: ${result.error}`)
      }
      
      console.log('Database schema initialized successfully')
    } else {
      console.log('Database schema is healthy')
    }
  },

  /**
   * Execute a query with error handling
   */
  async query(sql: string, params?: any[]): Promise<any> {
    const result = await neonMCP.executeSql(sql, params)
    
    if (!result.success) {
      throw new Error(`Database query failed: ${result.error}`)
    }
    
    return result.data
  },

  /**
   * Execute multiple queries in a transaction
   */
  async transaction(queries: string[]): Promise<any> {
    const result = await neonMCP.executeTransaction(queries)
    
    if (!result.success) {
      throw new Error(`Database transaction failed: ${result.error}`)
    }
    
    return result.data
  }
}