/**
 * OAuth Token Manager - Handles token refresh and validation
 */

import { GHLOAuth } from './marketplace/oauth';
import * as crypto from 'crypto';

interface TokenInfo {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  locationId: string;
}

export class OAuthTokenManager {
  private static instance: OAuthTokenManager;
  private oauth: GHLOAuth;

  private constructor() {
    this.oauth = new GHLOAuth({
      clientId: process.env.GHL_OAUTH_CLIENT_ID!,
      clientSecret: process.env.GHL_OAUTH_CLIENT_SECRET!,
      redirectUri: `${process.env.NEXT_PUBLIC_APP_URL || 'https://dealflow-mcp-rl-platform.vercel.app'}/api/auth/platform/callback`,
      scopes: GHLOAuth.getAllRequiredScopes(),
    });
  }

  static getInstance(): OAuthTokenManager {
    if (!OAuthTokenManager.instance) {
      OAuthTokenManager.instance = new OAuthTokenManager();
    }
    return OAuthTokenManager.instance;
  }

  /**
   * Get valid access token, refreshing if necessary
   */
  async getValidAccessToken(installationId: string): Promise<string> {
    try {
      // Get installation from database
      const { neonDatabaseManager } = await import('@/lib/db/neon-database-manager');
      const db = neonDatabaseManager.getDatabase();
      
      const query = `
        SELECT access_token, refresh_token, expires_at, location_id
        FROM oauth_installations
        WHERE id = $1
      `;
      
      const result = await db.executeSql(query, [installationId]);
      if (!result?.data?.rows?.[0]) {
        throw new Error('OAuth installation not found');
      }
      
      const installation = result.data.rows[0];
      const expiresAt = new Date(installation.expires_at);
      
      // Check if token is still valid (with 5 minute buffer)
      const bufferMs = 5 * 60 * 1000; // 5 minutes
      if (expiresAt.getTime() - Date.now() > bufferMs) {
        // Token is still valid, decrypt and return
        const { tenantAuth } = await import('@/lib/auth/tenant-auth');
        return await tenantAuth.decryptOAuthToken(installation.access_token);
      }
      
      // Token needs refresh
      console.log('OAuth token expired, refreshing...');
      const refreshedToken = await this.refreshToken(installationId, installation.refresh_token);
      return refreshedToken;
    } catch (error) {
      console.error('Error getting valid access token:', error);
      throw error;
    }
  }

  /**
   * Refresh OAuth token
   */
  private async refreshToken(installationId: string, encryptedRefreshToken: string): Promise<string> {
    try {
      // Decrypt refresh token
      const { tenantAuth } = await import('@/lib/auth/tenant-auth');
      const refreshToken = await tenantAuth.decryptOAuthToken(encryptedRefreshToken);
      
      // Refresh tokens
      const tokens = await this.oauth.refreshAccessToken(refreshToken);
      
      // Encrypt new tokens
      const encryptedAccessToken = await this.encryptToken(tokens.access_token);
      const encryptedNewRefreshToken = await this.encryptToken(tokens.refresh_token);
      
      // Update in database
      const { neonDatabaseManager } = await import('@/lib/db/neon-database-manager');
      const db = neonDatabaseManager.getDatabase();
      
      const updateQuery = `
        UPDATE oauth_installations
        SET access_token = $1,
            refresh_token = $2,
            expires_at = $3,
            last_refreshed_at = NOW()
        WHERE id = $4
      `;
      
      const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);
      await db.executeSql(updateQuery, [
        encryptedAccessToken,
        encryptedNewRefreshToken,
        expiresAt,
        installationId
      ]);
      
      console.log('OAuth token refreshed successfully');
      return tokens.access_token;
    } catch (error) {
      console.error('Error refreshing OAuth token:', error);
      throw error;
    }
  }

  /**
   * Encrypt token for storage
   */
  private async encryptToken(token: string): Promise<string> {
    const key = Buffer.from(process.env.ENCRYPTION_KEY!, 'base64');
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    
    let encrypted = cipher.update(token, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    
    const authTag = cipher.getAuthTag();
    
    return iv.toString('base64') + ':' + authTag.toString('base64') + ':' + encrypted;
  }

  /**
   * Check if installation needs refresh
   */
  async needsRefresh(installationId: string): Promise<boolean> {
    try {
      const { neonDatabaseManager } = await import('@/lib/db/neon-database-manager');
      const db = neonDatabaseManager.getDatabase();
      
      const query = `
        SELECT expires_at
        FROM oauth_installations
        WHERE id = $1
      `;
      
      const result = await db.executeSql(query, [installationId]);
      if (!result?.data?.rows?.[0]) {
        return false;
      }
      
      const expiresAt = new Date(result.data.rows[0].expires_at);
      const bufferMs = 5 * 60 * 1000; // 5 minutes
      
      return expiresAt.getTime() - Date.now() <= bufferMs;
    } catch (error) {
      console.error('Error checking token expiry:', error);
      return false;
    }
  }
}

export const oauthTokenManager = OAuthTokenManager.getInsta