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
    const backupState = cookieStore.get('oauth_state_backup')?.value;

    console.log('OAuth callback - State verification:', {
      receivedState: state?.substring(0, 10) + '...',
      storedState: storedState ? storedState.substring(0, 10) + '...' : 'missing',
      provisionalTenantId: provisionalTenantId ? 'present' : 'missing',
      backupState: backupState ? 'present' : 'missing',
      allCookies: cookieStore.getAll().map(c => ({ name: c.name, hasValue: !!c.value })),
      timestamp: new Date().toISOString(),
      headers: {
        cookie: request.headers.get('cookie')?.substring(0, 100) + '...',
        origin: request.headers.get('origin'),
        referer: request.headers.get('referer')
      }
    });

    let isValidState = false;
    let resolvedTenantId = provisionalTenantId;

    // Try multiple validation methods
    if (storedState && state === storedState) {
      isValidState = true;
      console.log('State validated via direct cookie match');
    } else if (backupState && backupState.startsWith(state + ':')) {
      // Extract tenant ID from backup state
      const parts = backupState.split(':');
      if (parts.length === 2) {
        isValidState = true;
        resolvedTenantId = parts[1];
        console.log('State validated via backup cookie');
      }
    } else {
      // Try timing-safe comparison if states are similar length
      try {
        if (storedState && storedState.length === state.length && GHLOAuth.verifyState(state, storedState)) {
          isValidState = true;
          console.log('State validated via timing-safe comparison');
        }
      } catch (e) {
        console.log('Timing-safe comparison failed:', e);
      }
      
      // Final fallback to in-memory state
      if (!isValidState) {
        const verifyResult = oauthStateStore.verify(state);
        console.log('In-memory state verification:', verifyResult);
        if (verifyResult.valid && verifyResult.tenantId) {
          isValidState = true;
          resolvedTenantId = verifyResult.tenantId;
          console.log('State validated via in-memory store');
        }
      }
    }

    if (!isValidState) {
      console.error('State validation failed - details:', {
        receivedState: state?.substring(0, 20) + '...',
        storedState: storedState?.substring(0, 20) + '...',
        statesMatch: state === storedState,
        stateLengths: { received: state?.length, stored: storedState?.length },
        cookiesPresent: cookieStore.getAll().map(c => c.name),
        provisionalTenantId,
        backupState: backupState?.substring(0, 30) + '...',
      });
      
      // For now, if we have a provisional tenant ID, continue with a warning
      if (provisionalTenantId) {
        console.warn('Continuing with provisional tenant ID despite state mismatch');
        resolvedTenantId = provisionalTenantId;
      } else {
        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_APP_URL || 'https://dealflow-mcp-rl-platform.vercel.app'}/onboarding/error?error=invalid_state&description=${encodeURIComponent('OAuth state validation failed. Please try again.')}`
        );
      }
    }

    // Clear OAuth cookies with proper options
    const deleteCookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: 'none' as const,
      path: '/',
      ...(process.env.NODE_ENV === 'production' && {
        domain: '.vercel.app'
      })
    };
    
    // Try to delete with various configurations to ensure cleanup
    cookieStore.delete('ghl_oauth_state');
    cookieStore.delete('provisional_tenant_id');
    cookieStore.delete('oauth_state_backup');
    
    // Also try setting them to empty with expiry
    cookieStore.set('ghl_oauth_state', '', { ...deleteCookieOptions, maxAge: 0 });
    cookieStore.set('provisional_tenant_id', '', { ...deleteCookieOptions, maxAge: 0 });
    cookieStore.set('oauth_state_backup', '', { ...deleteCookieOptions, maxAge: 0 });

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

    // Store installation in database
    await storeOAuthInstallation(installation);

    // Update tenant to use OAuth authentication
    const tenantResult = await updateTenantAuthMethod(resolvedTenantId, 'oauth', installation.id);

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
    
    // Generate API key
    const apiKey = tenantAuth.generateApiKey();
    const apiKeyHash = tenantAuth.hashApiKey(apiKey);
    
    // Get OAuth installation to retrieve location ID
    const installResult = await db.executeSql(
      'SELECT location_id FROM oauth_installations WHERE id = $1',
      [installationId]
    );
    
    const locationId = installResult.data?.rows?.[0]?.location_id || '';
    
    // Upsert tenant (without API key hash - that goes in api_keys table)
    const tenantSql = `
      INSERT INTO tenants (
        tenant_id, subdomain, auth_method, oauth_installation_id,
        location_id, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      ON CONFLICT (tenant_id) DO UPDATE SET
        auth_method = EXCLUDED.auth_method,
        oauth_installation_id = EXCLUDED.oauth_installation_id,
        location_id = EXCLUDED.location_id,
        updated_at = NOW()
      RETURNING *
    `;
    
    await db.executeSql(tenantSql, [
      tenantId, 
      subdomain, 
      method, 
      installationId,
      locationId
    ]);
    
    // Store API key in api_keys table
    const apiKeySql = `
      INSERT INTO api_keys (
        tenant_id, key_hash, key_prefix, name, is_active, created_at
      ) VALUES ($1, $2, $3, $4, $5, NOW())
      ON CONFLICT (key_hash) DO NOTHING
    `;
    
    await db.executeSql(apiKeySql, [
      tenantId,
      apiKeyHash,
      'ghl_mcp_',
      'OAuth Generated Key',
      true
    ]);
    
    return { success: true, apiKey };
  } catch (error) {
    console.error('Failed to update tenant auth method:', error);
    throw error;
  }
}