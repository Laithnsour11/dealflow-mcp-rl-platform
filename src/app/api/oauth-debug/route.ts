import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://dealflow-mcp-rl-platform.vercel.app';
  
  return NextResponse.json({
    current_redirect_uri: `${appUrl.trim()}/api/auth/platform/callback`,
    app_url: appUrl,
    app_url_trimmed: appUrl.trim(),
    possible_alternatives: [
      `${appUrl.trim()}/`,
      `${appUrl.trim()}/api/auth/platform/callback`,
      `${appUrl.trim()}/auth/callback`,
      `${appUrl.trim()}/callback`,
      'https://dealflow-mcp-rl-platform.vercel.app/',
      'https://dealflow-mcp-rl-platform.vercel.app/api/auth/platform/callback',
    ],
    instructions: 'Copy the exact redirect URI from your GHL marketplace app settings and compare with these values'
  });
}