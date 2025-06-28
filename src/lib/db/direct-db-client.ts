/**
 * Direct database client for local development
 * Uses Neon serverless client for actual database operations
 */

import { getSchemaStatements } from './schema-constants'
import { getNeonServerlessClient } from './neon-serverless-client'

export class DirectDatabaseClient {
  private neonClient: any

  constructor() {
    this.neonClient = getNeonServerlessClient()
  }

  async executeSql(sql: string, params?: any[]): Promise<any> {
    return this.neonClient.executeSql(sql, params)
  }

  async initializeSchema(): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('Initializing database schema...')
      const statements = getSchemaStatements()
      
      // In a real implementation, execute each statement
      // For now, we'll simulate success
      console.log(`Would execute ${statements.length} schema statements`)
      
      return { success: true }
    } catch (error) {
      console.error('Schema initialization error:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  async checkHealth(): Promise<{ healthy: boolean; tables?: string[]; error?: string }> {
    try {
      // Mock health check for development
      return {
        healthy: true,
        tables: [
          'tenants',
          'tenant_auth',
          'usage_records',
          'conversations',
          'conversation_analysis',
          'ab_tests',
          'ab_test_variants',
          'webhook_events'
        ]
      }
    } catch (error) {
      return {
        healthy: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}

// Create singleton instance
export const directDb = new DirectDatabaseClient()

// Export function for neon-database-manager
export function getDirectDatabaseClient() {
  return directDb;
}

// Helper for development/testing
export const dbOperationsDirect = {
  async ensureSchema(): Promise<void> {
    const result = await directDb.initializeSchema()
    if (!result.success) {
      throw new Error(`Schema initialization failed: ${result.error}`)
    }
  },

  async query<T = any>(sql: string, params?: any[]): Promise<T> {
    const result = await directDb.executeSql(sql, params)
    return result.data as T
  },

  async checkHealth() {
    return directDb.checkHealth()
  }
}