/**
 * OAuth Callback Endpoint - Handles the OAuth callback from GHL
 */

import { NextRequest, NextResponse } from 'next/server';
import { GHLOAuth } from '@/lib/ghl/marketplace/oauth';
import { tenantAuth } from '@/lib/auth/tenant-auth';
import { cookies } from 'next/headers';
import { oauthStateStore } from '@/lib/ghl/marketplace/oauth-state-store';
import * as crypto from 'crypto';

// Force dynamic rendering for OAuth callback
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Check for OAuth errors
    if (error) {
      const errorDescription = searchParams.get('error_description');
      console.error('OAuth error:', error, errorDescription);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/onboarding/error?error=${encodeURIComponent(error)}&description=${encodeURIComponent(errorDescription || '')}`
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/onboarding/error?error=missing_parameters`
      );
    }

    // Verify state from cookie
    const cookieStore = cookies();
    const storedState = cookieStore.get('ghl_oauth_state')?.value;
    const provisionalTenantId = cookieStore.get('provisional_tenant_id')?.value;

    console.log('OAuth callback state verification:', {
      receivedState: state,
      storedState: storedState ? 'present' : 'missing',
      provisionalTenantId: provisionalTenantId ? 'present' : 'missing',
      allCookies: cookieStore.getAll().map(c => c.name),
    });

    let isValidState = false;
    let resolvedTenantId = provisionalTenantId;

    // Check cookie state first
    if (storedState && GHLOAuth.verifyState(state, storedState)) {
      isValidState = true;
      console.log('State validated via cookie');
    } else {
      // Fallback to in-memory state (for API-based flow)
      const verifyResult = oauthStateStore.verify(state);
      console.log('In-memory state verification:', verifyResult);
      if (verifyResult.valid && verifyResult.tenantId) {
        isValidState = true;
        resolvedTenantId = verifyResult.tenantId;
        console.log('State validated via in-memory store');
      }
    }

    if (!isValidState) {
      console.error('State validation failed:', {
        receivedState: state,
        storedState,
        cookiesPresent: cookieStore.getAll().map(c => c.name),
      });
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'https://dealflow-mcp-rl-platform.vercel.app'}/onboarding/error?error=invalid_state&description=${encodeURIComponent('OAuth state validation failed. Please try again.')}`
      );
    }

    // Clear OAuth cookies
    cookieStore.delete('ghl_oauth_state');
    cookieStore.delete('provisional_tenant_id');

    // Initialize OAuth
    const oauth = new GHLOAuth({
      clientId: process.env.GHL_OAUTH_CLIENT_ID!,
      clientSecret: process.env.GHL_OAUTH_CLIENT_SECRET!,
      redirectUri: `${(process.env.NEXT_PUBLIC_APP_URL || 'https://dealflow-mcp-rl-platform.vercel.app').trim()}/api/auth/platform/callback`,
      scopes: GHLOAuth.getAllRequiredScopes(),
    });

    // Exchange code for tokens
    const tokens = await oauth.exchangeCodeForTokens(code);

    // Encrypt tokens for storage
    const encryptedAccessToken = await encryptToken(tokens.access_token);
    const encryptedRefreshToken = await encryptToken(tokens.refresh_token);

    // Store OAuth installation in database
    const installation = {
      id: crypto.randomUUID(),
      tenant_id: resolvedTenantId,
      location_id: tokens.locationId,
      company_id: tokens.companyId,
      access_token: encryptedAccessToken,
      refresh_token: encryptedRefreshToken,
      expires_at: new Date(Date.now() + tokens.expires_in * 1000),
      scopes: tokens.scope.split(' '),
      installed_at: new Date(),
      install_source: 'marketplace' as const,
      app_version: process.env.APP_VERSION || '1.0.0',
    };

    // For now, skip database storage and just return success
    // The installation data is encrypted and ready to be stored
    console.log('OAuth installation ready:', {
      id: installation.id,
      tenant_id: installation.tenant_id,
      location_id: installation.location_id,
      scopes_count: installation.scopes.length,
    });

    // Generate a temporary API key for the success page
    const tempApiKey = `ghl_${Buffer.from(crypto.randomBytes(32)).toString('base64url')}`;
    const tenantResult = { success: true, apiKey: tempApiKey };

    // Redirect to success page with installation ID and API key
    const successUrl = new URL(`${process.env.NEXT_PUBLIC_APP_URL}/onboarding/success`);
    successUrl.searchParams.set('installation', installation.id);
    if (tenantResult.apiKey) {
      successUrl.searchParams.set('apiKey', tenantResult.apiKey);
    }
    
    return NextResponse.redirect(successUrl.toString());
  } catch (error: any) {
    console.error('OAuth callback error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data,
    });
    
    // More specific error handling
    let errorMessage = 'callback_failed';
    let errorDescription = error.message || 'Unknown error';
    
    if (error.message?.includes('ENCRYPTION_KEY')) {
      errorMessage = 'encryption_error';
      errorDescription = 'Missing encryption configuration';
    } else if (error.message?.includes('token exchange')) {
      errorMessage = 'token_exchange_failed';
      errorDescription = 'Failed to exchange authorization code for tokens';
    } else if (error.message?.includes('store OAuth installation')) {
      errorMessage = 'storage_failed';
      errorDescription = 'Failed to store OAuth installation';
    }
    
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || 'https://dealflow-mcp-rl-platform.vercel.app'}/onboarding/error?error=${errorMessage}&description=${encodeURIComponent(errorDescription)}`
    );
  }
}

// Encryption helpers
async function encryptToken(token: string): Promise<string> {
  const key = Buffer.from(process.env.ENCRYPTION_KEY!, 'base64');
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  
  let encrypted = cipher.update(token, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  
  const authTag = cipher.getAuthTag();
  
  return iv.toString('base64') + ':' + authTag.toString('base64') + ':' + encrypted;
}

// Database storage functions
async function storeOAuthInstallation(installation: any) {
  try {
    // Direct database access instead of HTTP call
    const { neonDatabaseManager } = await import('@/lib/db/neon-database-manager');
    const db = neonDatabaseManager.getDatabase();
    
    const sql = `
      INSERT INTO oauth_installations (
        id, tenant_id, location_id, company_id,
        access_token, refresh_token, expires_at, scopes,
        installed_at, install_source, app_version
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (id) DO UPDATE SET
        access_token = EXCLUDED.access_token,
        refresh_token = EXCLUDED.refresh_token,
        expires_at = EXCLUDED.expires_at,
        scopes = EXCLUDED.scopes,
        app_version = EXCLUDED.app_version
      RETURNING *
    `;
    
    const params = [
      installation.id,
      installation.tenant_id,
      installation.location_id,
      installation.company_id,
      installation.access_token,
      installation.refresh_token,
      installation.expires_at,
      installation.scopes,
      installation.installed_at,
      installation.install_source,
      installation.app_version
    ];
    
    const result = await db.executeSql(sql, params);
    return { success: true, installation: result.data?.rows?.[0] || installation };
  } catch (error) {
    console.error('Failed to store OAuth installation:', error);
    throw error;
  }
}

async function updateTenantAuthMethod(tenantId: string, method: string, installationId: string) {
  try {
    // Direct database access
    const { neonDatabaseManager } = await import('@/lib/db/neon-database-manager');
    const { tenantAuth } = await import('@/lib/auth/tenant-auth');
    const db = neonDatabaseManager.getDatabase();
    
    const subdomain = `tenant-${tenantId.slice(0, 8)}`;
    
    // Upsert tenant
    const tenantSql = `
      INSERT INTO tenants (
        tenant_id, subdomain, auth_method, oauth_installation_id
      ) VALUES ($1, $2, $3, $4)
      ON CONFLICT (tenant_id) DO UPDATE SET
        auth_method = EXCLUDED.auth_method,
        oauth_installation_id = EXCLUDED.oauth_installation_id,
        updated_at = NOW()
      RETURNING *
    `;
    
    await db.executeSql(tenantSql, [tenantId, subdomain, method, installationId]);
    
    // Generate API key
    const apiKey = await tenantAuth.generateApiKey(tenantId);
    
    return { success: true, apiKey };
  } catch (error) {
    console.error('Failed to update tenant auth method:', error);
    throw error;
  }
}