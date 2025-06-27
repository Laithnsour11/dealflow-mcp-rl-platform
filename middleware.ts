import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/api/health',
  '/api/admin/init-db',
  '/api/tenant/register',
  '/_next',
  '/favicon.ico',
  '/static',
]

// Define route patterns that require authentication
const PROTECTED_API_PATTERNS = [
  '/api/mcp/',
  '/api/rl/',
  '/api/tenant/',
  '/api/admin/',
]

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Check if the route is public
  const isPublicRoute = PUBLIC_ROUTES.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  )

  if (isPublicRoute) {
    // Allow public routes to pass through
    return NextResponse.next()
  }

  // Check if this is a protected API route
  const isProtectedAPI = PROTECTED_API_PATTERNS.some(pattern => 
    pathname.startsWith(pattern)
  )

  if (isProtectedAPI) {
    // Check for API key in headers
    const apiKey = request.headers.get('X-Tenant-API-Key') || 
                  request.headers.get('Authorization')?.replace('Bearer ', '')

    if (!apiKey) {
      // Return 401 Unauthorized with helpful error message
      return NextResponse.json(
        { 
          success: false,
          error: 'API key required',
          message: 'Please provide a valid tenant API key in the X-Tenant-API-Key header',
          documentation: 'https://your-docs-url.com/authentication'
        },
        { 
          status: 401,
          headers: {
            'WWW-Authenticate': 'Bearer realm="GHL MCP Platform"',
            'Content-Type': 'application/json',
          }
        }
      )
    }

    // API key is present, let the route handler validate it
    // Add CORS headers for API routes
    const response = NextResponse.next()
    
    // Set CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Tenant-API-Key')
    response.headers.set('Access-Control-Max-Age', '86400')
    
    return response
  }

  // For all other routes, allow access (static assets, etc.)
  return NextResponse.next()
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * But include API routes
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}