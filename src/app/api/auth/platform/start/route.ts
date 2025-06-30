/**
 * Simple OAuth start endpoint - no authentication required
 */

import { NextRequest, NextResponse } from 'next/server';
import { GHLOAuth } from '@/lib/ghl/marketplace/oauth';
import { oauthStateStore } from '@/lib/ghl/marketplace/oauth-state-store';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userType = (searchParams.get('userType') || 'Location') as 'Location' | 'Company';
    
    // Generate a provisional tenant ID
    const provisionalTenantId = uuidv4();
    
    // Initialize OAuth
    const oauth = new GHLOAuth({
      clientId: process.env.GHL_OAUTH_CLIENT_ID!,
      clientSecret: process.env.GHL_OAUTH_CLIENT_SECRET!,
      redirectUri: `${(process.env.NEXT_PUBLIC_APP_URL || 'https://dealflow-mcp-rl-platform.vercel.app').trim()}/api/auth/platform/callback`,
      scopes: GHLOAuth.getAllRequiredScopes(),
    });

    // Generate state
    const state = GHLOAuth.generateState();
    
    // Store state with provisional tenant ID
    oauthStateStore.add(state, provisionalTenantId);
    
    // Also store in cookies for browser flow
    const cookieStore = cookies();
    
    // Enhanced logging for debugging
    console.log('OAuth start - Setting cookies:', {
      state: state.substring(0, 10) + '...',
      provisionalTenantId,
      nodeEnv: process.env.NODE_ENV,
      isProduction: process.env.NODE_ENV === 'production',
      redirectUri: oauth.config.redirectUri,
      cookieCount: cookieStore.getAll().length,
      timestamp: new Date().toISOString()
    });
    
    // Set cookies with proper domain and settings for cross-site OAuth
    const cookieOptions = {
      httpOnly: true,
      secure: true, // Always use secure in production
      sameSite: 'none' as const, // Required for cross-site OAuth
      maxAge: 60 * 10, // 10 minutes
      path: '/',
      // Add domain to ensure cookies work across subdomains
      ...(process.env.NODE_ENV === 'production' && {
        domain: '.vercel.app'
      })
    };
    
    cookieStore.set('ghl_oauth_state', state, cookieOptions);
    cookieStore.set('provisional_tenant_id', provisionalTenantId, {
      ...cookieOptions,
      maxAge: 60 * 60, // 1 hour for tenant ID
    });
    
    // Also store a backup state in the URL-safe format
    cookieStore.set('oauth_state_backup', `${state}:${provisionalTenantId}`, cookieOptions);

    // Generate authorization URL
    const authUrl = oauth.getAuthorizationUrl(state, userType);

    // Redirect to GoHighLevel
    return NextResponse.redirect(authUrl);
  } catch (error: any) {
    console.error('Failed to start OAuth flow:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/onboarding/error?error=oauth_start_failed&description=${encodeURIComponent(error.message)}`
    );
  }
}