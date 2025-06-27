/**
 * Root OAuth callback handler that redirects to the actual callback
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Get all search params
  const searchParams = request.nextUrl.searchParams;
  
  // Build the redirect URL with all params
  const callbackUrl = new URL('/api/auth/platform/callback', request.url);
  searchParams.forEach((value, key) => {
    callbackUrl.searchParams.append(key, value);
  });
  
  // Redirect to the actual callback handler
  return NextResponse.redirect(callbackUrl);
}