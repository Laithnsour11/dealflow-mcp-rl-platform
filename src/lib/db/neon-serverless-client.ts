/**
 * Neon Serverless Database Client
 * Uses @neondatabase/serverless for Edge-compatible database access
 */

import { neon } from '@neondatabase/serverless';

export class NeonServerlessClient {
  private sql: any;

  constructor() {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.warn('DATABASE_URL not set - database operations will fail');
      // Create a mock function for development
      this.sql = async () => ({ rows: [], rowCount: 0 });
    } else {
      this.sql = neon(databaseUrl);
    }
  }

  async executeSql(query: string, params?: any[]): Promise<any> {
    try {
      console.log('Executing SQL:', query.substring(0, 100) + '...');
      
      // Execute the query with parameters
      const result = await this.sql(query, params || []);
      
      // Format response to match expected structure
      return {
        success: true,
        data: {
          rows: Array.isArray(result) ? result : result.rows || [],
          rowCount: Array.isArray(result) ? result.length : result.rowCount || 0,
        },
      };
    } catch (error: any) {
      console.error('Database query error:', error);
      // Return error in expected format
      return {
        success: false,
        error: error.message || 'Database query failed',
        data: { rows: [], rowCount: 0 }
      };
    }
  }
}

// Create singleton instance
let clientInstance: NeonServerlessClient | null = null;

export function getNeonServerlessClient() {
  if (!clientInstance) {
    clientInstance = new NeonServerlessClient();
  }
  return clientInstance;
}