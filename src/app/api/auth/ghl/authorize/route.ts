/**
 * OAuth Authorization Endpoint - Starts the OAuth flow
 */

import { NextRequest, NextResponse } from 'next/server';
import { GHLOAuth } from '@/lib/ghl/marketplace/oauth';
import { tenantAuth } from '@/lib/auth/tenant-auth';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    // Get tenant from API key or session
    const authResult = await tenantAuth.authenticateRequest(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { tenant } = authResult;
    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    // Get user type from query params
    const searchParams = request.nextUrl.searchParams;
    const userType = (searchParams.get('userType') || 'Location') as 'Location' | 'Company';

    // Initialize OAuth
    const oauth = new GHLOAuth({
      clientId: process.env.GHL_OAUTH_CLIENT_ID!,
      clientSecret: process.env.GHL_OAUTH_CLIENT_SECRET!,
      redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/ghl/callback`,
      scopes: GHLOAuth.getAllRequiredScopes(),
    });

    // Generate state and authorization URL
    const state = GHLOAuth.generateState();
    const authUrl = oauth.getAuthorizationUrl(state, userType);

    // Store state in secure cookie
    const cookieStore = cookies();
    cookieStore.set('ghl_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
      path: '/',
    });

    // Store tenant ID in state cookie for callback
    cookieStore.set('ghl_oauth_tenant', tenant.tenantId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
      path: '/',
    });

    // Redirect to GHL OAuth
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('OAuth authorization error:', error);
    return NextResponse.json(
      { error: 'Failed to start OAuth flow' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Alternative POST endpoint for API-based OAuth initiation
    const authResult = await tenantAuth.authenticateRequest(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { tenant } = authResult;
    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const userType = (body.userType || 'Location') as 'Location' | 'Company';

    // Initialize OAuth
    const oauth = new GHLOAuth({
      clientId: process.env.GHL_OAUTH_CLIENT_ID!,
      clientSecret: process.env.GHL_OAUTH_CLIENT_SECRET!,
      redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/ghl/callback`,
      scopes: GHLOAuth.getAllRequiredScopes(),
    });

    // Generate state and authorization URL
    const state = GHLOAuth.generateState();
    const authUrl = oauth.getAuthorizationUrl(state, userType);

    // Store state in database (for API-based flow)
    await storeOAuthState(state, tenant.tenantId);

    return NextResponse.json({
      success: true,
      data: {
        authUrl,
        state,
        expiresIn: 600, // 10 minutes
      },
    });
  } catch (error) {
    console.error('OAuth authorization error:', error);
    return NextResponse.json(
      { error: 'Failed to start OAuth flow' },
      { status: 500 }
    );
  }
}

// Temporary state storage (should be replaced with Redis or database)
const oauthStates = new Map<string, { tenantId: string; createdAt: Date }>();

async function storeOAuthState(state: string, tenantId: string) {
  oauthStates.set(state, {
    tenantId,
    createdAt: new Date(),
  });

  // Clean up expired states
  const now = Date.now();
  for (const [key, value] of oauthStates.entries()) {
    if (now - value.createdAt.getTime() > 600000) { // 10 minutes
      oauthStates.delete(key);
    }
  }
}

export { oauthStates }; // Export for use in callback