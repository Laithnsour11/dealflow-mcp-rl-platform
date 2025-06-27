import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  // Get all query parameters
  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    params[key] = value;
  });
  
  // Check environment variables
  const envCheck = {
    NEXT_PUBLIC_APP_URL: !!process.env.NEXT_PUBLIC_APP_URL,
    GHL_OAUTH_CLIENT_ID: !!process.env.GHL_OAUTH_CLIENT_ID,
    GHL_OAUTH_CLIENT_SECRET: !!process.env.GHL_OAUTH_CLIENT_SECRET,
    ENCRYPTION_KEY: !!process.env.ENCRYPTION_KEY,
    INTERNAL_API_SECRET: !!process.env.INTERNAL_API_SECRET,
    DATABASE_URL: !!process.env.DATABASE_URL,
  };
  
  // Get cookies
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = Object.fromEntries(
    cookieHeader.split('; ').map(c => c.split('=').map(decodeURIComponent))
  );
  
  return NextResponse.json({
    callback_params: params,
    env_variables_present: envCheck,
    cookies_present: {
      ghl_oauth_state: !!cookies.ghl_oauth_state,
      provisional_tenant_id: !!cookies.provisional_tenant_id,
    },
    expected_redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL || 'https://dealflow-mcp-rl-platform.vercel.app'}/api/auth/platform/callback`,
    actual_app_url: process.env.NEXT_PUBLIC_APP_URL,
    timestamp: new Date().toISOString(),
  });
}