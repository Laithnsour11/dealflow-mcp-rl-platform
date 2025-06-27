import { NextRequest, NextResponse } from 'next/server'
import { tenantAuth } from '@/lib/auth/tenant-auth'
import { z } from 'zod'

// Validation schema for tenant registration
const registrationSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  subdomain: z.string().min(3).max(50).regex(/^[a-z0-9-]+$/),
  ghlApiKey: z.string().min(10),
  ghlLocationId: z.string().min(10),
  plan: z.enum(['free', 'pro', 'enterprise']).default('free'),
})

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()
    
    // Validate input
    const validationResult = registrationSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid input',
          details: validationResult.error.errors
        },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Create tenant
    const result = await tenantAuth.createTenant({
      name: data.name,
      email: data.email,
      ghlApiKey: data.ghlApiKey,
      ghlLocationId: data.ghlLocationId,
      plan: data.plan,
      usageQuota: data.plan === 'free' ? 1000 : data.plan === 'pro' ? 10000 : 100000
    })

    // Return success response with API key
    return NextResponse.json({
      success: true,
      message: 'Tenant created successfully',
      data: {
        tenantId: result.tenant.id,
        name: result.tenant.name,
        subdomain: result.tenant.subdomain,
        apiKey: result.apiKey, // Only returned on creation
        plan: result.tenant.subscription_tier,
        usageLimit: result.tenant.usage_limit,
        nextSteps: [
          'Save your API key securely - it won\'t be shown again',
          'Use the API key in the X-Tenant-API-Key header for all requests',
          'Test your integration with GET /api/health',
          'Explore MCP endpoints at /api/mcp/*',
          'Try RL analysis at /api/rl/analyze'
        ],
        documentation: {
          gettingStarted: '/docs/getting-started',
          apiReference: '/docs/api-reference',
          examples: '/docs/examples'
        }
      }
    })
  } catch (error: any) {
    console.error('Tenant registration error:', error)
    
    // Check for specific errors
    if (error.message?.includes('duplicate key')) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Tenant already exists',
          message: 'A tenant with this subdomain or email already exists'
        },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to create tenant',
        message: error.message || 'An unexpected error occurred'
      },
      { status: 500 }
    )
  }
}

// GET endpoint to check subdomain availability
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const subdomain = searchParams.get('subdomain')

    if (!subdomain) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Subdomain parameter required'
        },
        { status: 400 }
      )
    }

    // Validate subdomain format
    if (!/^[a-z0-9-]+$/.test(subdomain)) {
      return NextResponse.json({
        success: false,
        available: false,
        error: 'Invalid subdomain format. Use only lowercase letters, numbers, and hyphens'
      })
    }

    // Check if subdomain is available
    // This is a simplified check - in production you'd query the database
    const reserved = ['api', 'app', 'admin', 'dashboard', 'www', 'mail', 'ftp']
    if (reserved.includes(subdomain)) {
      return NextResponse.json({
        success: true,
        available: false,
        message: 'This subdomain is reserved'
      })
    }

    // In production, check database for existing subdomain
    // For now, we'll assume it's available
    return NextResponse.json({
      success: true,
      available: true,
      message: 'Subdomain is available'
    })
  } catch (error: any) {
    console.error('Subdomain check error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to check subdomain availability'
      },
      { status: 500 }
    )
  }
}

// OPTIONS endpoint for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  })
}