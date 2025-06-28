/**
 * Neon Database Client using fetch API
 * Works in both Edge Runtime and Node.js environments
 */

export class NeonClient {
  private databaseUrl: string;

  constructor() {
    this.databaseUrl = process.env.DATABASE_URL || '';
    if (!this.databaseUrl) {
      throw new Error('DATABASE_URL environment variable is required');
    }
  }

  async executeSql(sql: string, params?: any[]): Promise<any> {
    try {
      // Parse the connection string to get host and database info
      const url = new URL(this.databaseUrl.replace('postgresql://', 'https://'));
      const [username, password] = url.username && url.password 
        ? [url.username, url.password] 
        : this.databaseUrl.match(/postgresql:\/\/([^:]+):([^@]+)@/)?.slice(1) || [];
      
      if (!username || !password) {
        throw new Error('Invalid DATABASE_URL format');
      }

      // Neon SQL-over-HTTP endpoint
      const apiUrl = `https://${url.hostname}/sql`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`,
          'Neon-Connection-String': this.databaseUrl,
        },
        body: JSON.stringify({
          query: sql,
          params: params || [],
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Database query failed: ${response.status} - ${error}`);
      }

      const result = await response.json();
      
      // Format response to match expected structure
      return {
        success: true,
        data: {
          rows: result.rows || [],
          rowCount: result.rowCount || 0,
        },
      };
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }
}

// Create singleton instance
let clientInstance: NeonClient | null = null;

export function getNeonClient() {
  if (!clientInstance) {
    clientInstance = new NeonClient();
  }
  return clientInstance;
}