/**
 * Provision a temporary tenant for OAuth flow
 */

import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';
import { cookies } from 'next/headers';
import { GHLOAuth } from '@/lib/ghl/marketplace/oauth';
import { oauthStateStore } from '@/lib/ghl/marketplace/oauth-state-store';

export async function POST(request: NextRequest) {
  try {
    const { authMethod, userType = 'Location' } = await request.json();

    if (authMethod !== 'oauth') {
      return NextResponse.json(
        { error: 'Invalid auth method' },
        { status: 400 }
      );
    }

    // Generate a provisional tenant ID for the OAuth flow
    const provisionalTenantId = uuidv4();
    
    // Store in a secure session cookie
    const cookieStore = cookies();
    cookieStore.set('provisional_tenant_id', provisionalTenantId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60, // 1 hour
      path: '/',
    });

    // Initialize OAuth
    const oauth = new GHLOAuth({
      clientId: process.env.GHL_OAUTH_CLIENT_ID!,
      clientSecret: process.env.GHL_OAUTH_CLIENT_SECRET!,
      redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/ghl/callback`,
      scopes: GHLOAuth.getAllRequiredScopes(),
    });

    // Generate state and store it
    const state = GHLOAuth.generateState();
    oauthStateStore.add(state, provisionalTenantId);

    // Also store state in cookie for browser-based flow
    cookieStore.set('ghl_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10, // 10 minutes
      path: '/',
    });

    // Generate authorization URL
    const authUrl = oauth.getAuthorizationUrl(state, userType as 'Location' | 'Company');

    return NextResponse.json({
      success: true,
      authUrl,
      provisionalTenantId,
    });
  } catch (error: any) {
    console.error('Failed to provision tenant:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to provision tenant' },
      { status: 500 }
    );
  }
}