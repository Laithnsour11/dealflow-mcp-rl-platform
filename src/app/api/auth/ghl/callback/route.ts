/**
 * OAuth Callback Endpoint - Handles the OAuth callback from GHL
 */

import { NextRequest, NextResponse } from 'next/server';
import { GHLOAuth } from '@/lib/ghl/marketplace/oauth';
import { tenantAuth } from '@/lib/auth/tenant-auth';
import { cookies } from 'next/headers';
import { oauthStateStore } from '@/lib/ghl/marketplace/oauth-state-store';
import * as crypto from 'crypto';

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
    const tenantId = cookieStore.get('ghl_oauth_tenant')?.value;

    let isValidState = false;
    let resolvedTenantId = tenantId;

    // Check cookie state first
    if (storedState && GHLOAuth.verifyState(state, storedState)) {
      isValidState = true;
    } else {
      // Fallback to in-memory state (for API-based flow)
      const verifyResult = oauthStateStore.verify(state);
      if (verifyResult.valid && verifyResult.tenantId) {
        isValidState = true;
        resolvedTenantId = verifyResult.tenantId;
      }
    }

    if (!isValidState || !resolvedTenantId) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/onboarding/error?error=invalid_state`
      );
    }

    // Clear OAuth cookies
    cookieStore.delete('ghl_oauth_state');
    cookieStore.delete('ghl_oauth_tenant');

    // Initialize OAuth
    const oauth = new GHLOAuth({
      clientId: process.env.GHL_OAUTH_CLIENT_ID!,
      clientSecret: process.env.GHL_OAUTH_CLIENT_SECRET!,
      redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/ghl/callback`,
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

    // TODO: Store installation in database
    await storeOAuthInstallation(installation);

    // Update tenant to use OAuth authentication
    await updateTenantAuthMethod(resolvedTenantId, 'oauth', installation.id);

    // Redirect to success page
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/onboarding/success?installation=${installation.id}`
    );
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/onboarding/error?error=callback_failed`
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

// Temporary storage functions (replace with actual database)
async function storeOAuthInstallation(installation: any) {
  // TODO: Implement database storage
  console.log('Storing OAuth installation:', installation);
}

async function updateTenantAuthMethod(tenantId: string, method: string, installationId: string) {
  // TODO: Update tenant in database to use OAuth
  console.log('Updating tenant auth method:', { tenantId, method, installationId });
}