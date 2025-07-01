/**
 * GoHighLevel OAuth 2.0 Implementation for Marketplace Apps
 */

import * as crypto from 'crypto';

interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
}

interface OAuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  locationId: string;
  companyId?: string;
  userId?: string;
}

export class GHLOAuth {
  config: OAuthConfig; // Made public for debugging
  private baseUrl = 'https://services.leadconnectorhq.com';
  private marketplaceUrl = 'https://marketplace.leadconnectorhq.com';

  constructor(config: OAuthConfig) {
    this.config = config;
  }

  /**
   * Generate OAuth authorization URL
   */
  getAuthorizationUrl(state: string, userType: 'Location' | 'Company' = 'Location'): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: this.config.scopes.join(' '),
      state,
      userType,
    });

    return `${this.marketplaceUrl}/oauth/chooselocation?${params.toString()}`;
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(code: string): Promise<OAuthTokens> {
    const response = await fetch(`${this.baseUrl}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        redirect_uri: this.config.redirectUri,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OAuth token exchange failed: ${error}`);
    }

    return response.json();
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<OAuthTokens> {
    const response = await fetch(`${this.baseUrl}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OAuth token refresh failed: ${error}`);
    }

    return response.json();
  }

  /**
   * Revoke access token
   */
  async revokeToken(token: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/oauth/revoke`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        token,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OAuth token revocation failed: ${error}`);
    }
  }

  /**
   * Generate secure state parameter
   */
  static generateState(): string {
    return crypto.randomBytes(32).toString('base64url');
  }

  /**
   * Verify state parameter
   */
  static verifyState(state: string, storedState: string): boolean {
    return crypto.timingSafeEqual(Buffer.from(state), Buffer.from(storedState));
  }

  /**
   * Get all required OAuth scopes for full MCP functionality
   */
  static getAllRequiredScopes(): string[] {
    // Complete marketplace OAuth scopes for full MCP functionality
    return [
      // Calendars
      'calendars.readonly',
      'calendars.write',
      'calendars/events.readonly',
      'calendars/events.write',
      'calendars/groups.readonly',
      'calendars/groups.write',
      'calendars/resources.readonly',
      'calendars/resources.write',
      
      // Campaigns
      'campaigns.readonly',
      
      // Conversations - CRITICAL for message history & sending
      'conversations.readonly',
      'conversations.write',
      'conversations/message.readonly',
      'conversations/message.write',
      'conversations/reports.readonly',
      'conversations/livechat.write',
      
      // Contacts - CRITICAL for notes & custom fields
      'contacts.readonly',
      'contacts.write',
      
      // Custom Objects
      'objects/schema.readonly',
      'objects/schema.write',
      'objects/record.readonly',
      'objects/record.write',
      
      // Associations
      'associations.write',
      'associations.readonly',
      'associations/relation.readonly',
      'associations/relation.write',
      
      // Courses
      'courses.write',
      'courses.readonly',
      
      // Forms
      'forms.readonly',
      'forms.write',
      
      // Invoices
      'invoices.readonly',
      'invoices.write',
      'invoices/schedule.readonly',
      'invoices/schedule.write',
      'invoices/template.readonly',
      'invoices/template.write',
      'invoices/estimate.readonly',
      'invoices/estimate.write',
      
      // Links
      'links.readonly',
      'links.write',
      'lc-email.readonly',
      
      // Locations - CRITICAL for custom fields
      'locations.readonly',
      'locations/customValues.readonly',
      'locations/customValues.write',
      'locations/customFields.readonly',
      'locations/customFields.write',
      'locations/tasks.readonly',
      'locations/tasks.write',
      'locations/tags.readonly',
      'locations/tags.write',
      'locations/templates.readonly',
      
      // Media
      'medias.readonly',
      'medias.write',
      
      // Funnels
      'funnels/redirect.readonly',
      'funnels/page.readonly',
      'funnels/funnel.readonly',
      'funnels/pagecount.readonly',
      'funnels/redirect.write',
      
      // OAuth
      'oauth.write',
      'oauth.readonly',
      
      // Opportunities
      'opportunities.readonly',
      'opportunities.write',
      
      // Payments
      'payments/orders.readonly',
      'payments/orders.write',
      'payments/integration.readonly',
      'payments/integration.write',
      'payments/transactions.readonly',
      'payments/subscriptions.readonly',
      'payments/coupons.readonly',
      'payments/coupons.write',
      'payments/custom-provider.readonly',
      'payments/custom-provider.write',
      
      // Products
      'products.readonly',
      'products.write',
      'products/prices.readonly',
      'products/prices.write',
      'products/collection.readonly',
      'products/collection.write',
      
      // Social Planner
      'socialplanner/oauth.readonly',
      'socialplanner/oauth.write',
      'socialplanner/post.readonly',
      'socialplanner/post.write',
      'socialplanner/account.readonly',
      'socialplanner/account.write',
      'socialplanner/csv.readonly',
      'socialplanner/csv.write',
      'socialplanner/category.readonly',
      'socialplanner/tag.readonly',
      'socialplanner/tag.write',
      'socialplanner/statistics.readonly',
      
      // Store
      'store/shipping.readonly',
      
      // Surveys
      'surveys.readonly',
      
      // Users
      'users.readonly',
      'users.write',
      
      // Workflows
      'workflows.readonly',
      
      // Email Builder
      'emails/builder.write',
      'emails/builder.readonly',
      'emails/schedule.readonly',
      
      // Twilio
      'twilioaccount.read'
    ];
  }
}

/**
 * OAuth installation data structure
 */
export interface OAuthInstallation {
  id: string;
  tenantId: string;
  locationId: string;
  companyId?: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  scopes: string[];
  installedAt: Date;
  lastRefreshedAt?: Date;
  installSource: 'marketplace' | 'direct';
  appVersion: string;
}

/**
 * OAuth service for managing installations
 */
export class OAuthService {
  private oauth: GHLOAuth;

  constructor(config: OAuthConfig) {
    this.oauth = new GHLOAuth(config);
  }

  /**
   * Start OAuth flow
   */
  async startOAuthFlow(tenantId: string, userType: 'Location' | 'Company' = 'Location'): Promise<{ url: string; state: string }> {
    const state = GHLOAuth.generateState();
    // Store state in session/cache with tenantId for verification
    await this.storeState(state, tenantId);
    
    const url = this.oauth.getAuthorizationUrl(state, userType);
    return { url, state };
  }

  /**
   * Complete OAuth flow
   */
  async completeOAuthFlow(code: string, state: string): Promise<OAuthInstallation> {
    // Verify state
    const storedData = await this.getStoredState(state);
    if (!storedData) {
      throw new Error('Invalid or expired state parameter');
    }

    // Exchange code for tokens
    const tokens = await this.oauth.exchangeCodeForTokens(code);
    
    // Create installation record
    const installation: OAuthInstallation = {
      id: crypto.randomUUID(),
      tenantId: storedData.tenantId,
      locationId: tokens.locationId,
      companyId: tokens.companyId,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
      scopes: tokens.scope.split(' '),
      installedAt: new Date(),
      installSource: 'marketplace',
      appVersion: process.env.APP_VERSION || '1.0.0',
    };

    // Store installation
    await this.storeInstallation(installation);
    
    // Clean up state
    await this.deleteState(state);
    
    return installation;
  }

  /**
   * Refresh installation tokens
   */
  async refreshInstallation(installationId: string): Promise<OAuthInstallation> {
    const installation = await this.getInstallation(installationId);
    if (!installation) {
      throw new Error('Installation not found');
    }

    // Check if refresh is needed (refresh 1 hour before expiry)
    const expiryBuffer = 60 * 60 * 1000; // 1 hour
    if (installation.expiresAt.getTime() - Date.now() > expiryBuffer) {
      return installation; // No refresh needed
    }

    // Refresh tokens
    const tokens = await this.oauth.refreshAccessToken(installation.refreshToken);
    
    // Update installation
    installation.accessToken = tokens.access_token;
    installation.refreshToken = tokens.refresh_token;
    installation.expiresAt = new Date(Date.now() + tokens.expires_in * 1000);
    installation.lastRefreshedAt = new Date();
    
    await this.updateInstallation(installation);
    
    return installation;
  }

  /**
   * Revoke installation
   */
  async revokeInstallation(installationId: string): Promise<void> {
    const installation = await this.getInstallation(installationId);
    if (!installation) {
      throw new Error('Installation not found');
    }

    // Revoke tokens
    await this.oauth.revokeToken(installation.accessToken);
    
    // Delete installation
    await this.deleteInstallation(installationId);
  }

  // Storage methods (to be implemented with your database)
  private async storeState(state: string, tenantId: string): Promise<void> {
    // TODO: Store in Redis or database with TTL
    throw new Error('Not implemented');
  }

  private async getStoredState(state: string): Promise<{ tenantId: string } | null> {
    // TODO: Retrieve from Redis or database
    throw new Error('Not implemented');
  }

  private async deleteState(state: string): Promise<void> {
    // TODO: Delete from Redis or database
    throw new Error('Not implemented');
  }

  private async storeInstallation(installation: OAuthInstallation): Promise<void> {
    // TODO: Store in database
    throw new Error('Not implemented');
  }

  private async getInstallation(installationId: string): Promise<OAuthInstallation | null> {
    // TODO: Retrieve from database
    throw new Error('Not implemented');
  }

  private async updateInstallation(installation: OAuthInstallation): Promise<void> {
    // TODO: Update in database
    throw new Error('Not implemented');
  }

  private async deleteInstallation(installationId: string): Promise<void> {
    // TODO: Delete from database
    throw new Error('Not implemented');
  }
}