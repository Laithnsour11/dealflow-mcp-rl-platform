/**
 * Multi-Tenant MCP API Endpoints
 * Handles all GHL MCP operations with tenant authentication and isolation
 */

import { NextRequest, NextResponse } from 'next/server'
import { tenantAuth } from '@/lib/auth/tenant-auth'
import { createTenantGHLClient } from '@/lib/ghl/tenant-client'

// Available MCP tools mapping
const MCP_TOOLS = {
  // Contact Management
  'search_contacts': 'getContacts',
  'get_contact': 'getContact',
  'create_contact': 'createContact',
  'update_contact': 'updateContact',
  'delete_contact': 'deleteContact',
  'add_contact_tags': 'addContactTags',
  'remove_contact_tags': 'removeContactTags',

  // Conversation Management  
  'search_conversations': 'getConversations',
  'get_conversation': 'getConversation',
  'send_sms': 'sendSMS',
  'send_email': 'sendEmail',

  // Opportunity Management
  'search_opportunities': 'getOpportunities',
  'get_opportunity': 'getOpportunity',
  'create_opportunity': 'createOpportunity',
  'update_opportunity': 'updateOpportunity',
  'update_opportunity_status': 'updateOpportunityStatus',
  'get_pipelines': 'getPipelines',

  // Calendar Management
  'get_calendars': 'getCalendars',
  'create_appointment': 'createAppointment',
  'get_calendar_events': 'getAppointments',

  // Workflow Management
  'get_workflows': 'getWorkflows',
  'add_contact_to_workflow': 'addContactToWorkflow',

  // Custom Fields
  'get_location_custom_fields': 'getCustomFields',
  'create_location_custom_field': 'createCustomField',

  // Media Management
  'get_media_files': 'getMediaFiles',
  'upload_media_file': 'uploadMediaFile',

  // Products
  'list_products': 'getProducts',
  'create_product': 'createProduct',

  // Special RL Integration endpoints
  'get_conversation_transcripts': 'getConversationTranscripts',
  'get_contact_journey': 'getContactJourney',
}

export async function GET(
  request: NextRequest,
  { params }: { params: { tool: string[] } }
) {
  return handleMCPRequest(request, params, 'GET')
}

export async function POST(
  request: NextRequest,
  { params }: { params: { tool: string[] } }
) {
  return handleMCPRequest(request, params, 'POST')
}

async function handleMCPRequest(
  request: NextRequest,
  params: { tool: string[] },
  method: 'GET' | 'POST'
) {
  const startTime = Date.now()
  
  try {
    // Extract tool name from URL
    const toolPath = params.tool
    if (!toolPath || toolPath.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Tool name required' 
        },
        { status: 400 }
      )
    }

    const toolName = toolPath[0]
    
    // Check if tool is supported
    if (!MCP_TOOLS[toolName as keyof typeof MCP_TOOLS]) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Tool '${toolName}' not supported`,
          availableTools: Object.keys(MCP_TOOLS)
        },
        { status: 400 }
      )
    }

    // Authenticate tenant
    const authResult = await tenantAuth.authenticateRequest(request)
    if (!authResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: authResult.error 
        },
        { status: authResult.statusCode || 401 }
      )
    }

    const { tenant, tenantConfig } = authResult
    if (!tenant || !tenantConfig) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Tenant configuration not found' 
        },
        { status: 404 }
      )
    }

    // Create tenant-specific GHL client
    // tenantConfig already has the decrypted GHL API key
    const tenantData = {
      id: tenantConfig.id,
      name: tenantConfig.name,
      subdomain: tenantConfig.name.toLowerCase().replace(/\s+/g, '-'),
      api_key_hash: '',
      encrypted_ghl_api_key: '',
      ghl_location_id: tenantConfig.ghlLocationId,
      settings: {},
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
      subscription_tier: tenantConfig.plan as 'free' | 'pro' | 'enterprise',
      usage_limit: 1000,
      current_usage: 0
    }
    const ghlClient = createTenantGHLClient(tenantData, tenantConfig.ghlApiKey)
    if (!ghlClient) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to create GHL client for tenant' 
        },
        { status: 500 }
      )
    }

    // Parse request body for POST requests
    let requestData: Record<string, any> = {}
    if (method === 'POST') {
      try {
        requestData = await request.json()
      } catch (error) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Invalid JSON in request body' 
          },
          { status: 400 }
        )
      }
    } else {
      // Parse query parameters for GET requests
      const url = new URL(request.url)
      url.searchParams.forEach((value, key) => {
        requestData[key] = value
      })
    }

    // Execute the tool
    const methodName = MCP_TOOLS[toolName as keyof typeof MCP_TOOLS]
    
    if (!methodName) {
      throw new Error(`Unknown MCP tool: ${toolName}`)
    }
    
    // Get the method from the GHL client
    const clientMethod = (ghlClient as any)[methodName]
    
    if (typeof clientMethod !== 'function') {
      throw new Error(`Method ${methodName} not found on GHL client`)
    }
    
    // Call the method with appropriate parameters based on the tool
    let result
    
    // Handle methods that expect specific parameter structures
    if (methodName === 'getContactById' || methodName === 'updateContact' || methodName === 'deleteContact') {
      result = await clientMethod.call(ghlClient, requestData.contactId, requestData)
    } else if (methodName === 'searchContacts') {
      result = await clientMethod.call(ghlClient, requestData.query || '')
    } else if (methodName === 'addContactTags' || methodName === 'removeContactTags') {
      result = await clientMethod.call(ghlClient, requestData.contactId, requestData.tags || [])
    } else if (methodName === 'sendMessage') {
      result = await clientMethod.call(ghlClient, requestData.conversationId, requestData.message)
    } else if (methodName === 'updateOpportunity' || methodName === 'deleteOpportunity') {
      result = await clientMethod.call(ghlClient, requestData.opportunityId, requestData)
    } else if (methodName === 'moveOpportunityStage') {
      result = await clientMethod.call(ghlClient, requestData.opportunityId, requestData.stageId)
    } else if (methodName === 'getStages') {
      result = await clientMethod.call(ghlClient, requestData.pipelineId)
    } else if (methodName === 'updateAppointment' || methodName === 'deleteAppointment') {
      result = await clientMethod.call(ghlClient, requestData.appointmentId, requestData)
    } else if (methodName === 'updateTask' || methodName === 'deleteTask' || methodName === 'completeTask') {
      result = await clientMethod.call(ghlClient, requestData.taskId, requestData)
    } else if (methodName === 'createNote' || methodName === 'getNotes') {
      result = await clientMethod.call(ghlClient, requestData.contactId, requestData.body)
    } else if (methodName === 'updateNote' || methodName === 'deleteNote') {
      result = await clientMethod.call(ghlClient, requestData.contactId, requestData.noteId, requestData.body)
    } else if (methodName === 'triggerWorkflow') {
      result = await clientMethod.call(ghlClient, requestData.workflowId, requestData.contactId)
    } else if (methodName === 'getFormSubmissions' || methodName === 'getSurveySubmissions') {
      result = await clientMethod.call(ghlClient, requestData.formId || requestData.surveyId)
    } else if (methodName === 'addContactToCampaign' || methodName === 'removeContactFromCampaign') {
      result = await clientMethod.call(ghlClient, requestData.campaignId, requestData.contactId)
    } else if (methodName === 'updateCustomValues' || methodName === 'getCustomValues') {
      result = await clientMethod.call(ghlClient, requestData.contactId, requestData.customFields)
    } else if (methodName === 'getUserById') {
      result = await clientMethod.call(ghlClient, requestData.userId)
    } else if (methodName === 'createWebhook') {
      result = await clientMethod.call(ghlClient, requestData.url, requestData.events || [])
    } else if (methodName === 'updateWebhook' || methodName === 'deleteWebhook') {
      result = await clientMethod.call(ghlClient, requestData.webhookId, requestData)
    } else if (methodName === 'updateLocation') {
      result = await clientMethod.call(ghlClient, requestData)
    } else if (methodName === 'getReportingData') {
      result = await clientMethod.call(ghlClient, requestData.reportType, requestData)
    } else {
      // Default: pass all request data as a single parameter
      result = await clientMethod.call(ghlClient, requestData)
    }

    const responseTime = Date.now() - startTime

    // Record successful usage
    await tenantAuth.recordUsage(
      tenant.tenantId,
      `mcp/${toolName}`,
      method,
      responseTime,
      200,
      calculateTokensCost(toolName, result),
      {
        toolName,
        requestSize: JSON.stringify(requestData).length,
        responseSize: JSON.stringify(result).length
      }
    )

    return NextResponse.json({
      success: true,
      data: result,
      metadata: {
        tool: toolName,
        tenantId: tenant.tenantId,
        timestamp: new Date().toISOString(),
        responseTime: `${responseTime}ms`
      }
    })

  } catch (error) {
    const responseTime = Date.now() - startTime
    console.error('MCP API error:', error)

    // Record error usage if we have tenant info
    if (params?.tool?.[0]) {
      try {
        const apiKey = request.headers.get('X-Tenant-API-Key') || 
                      request.headers.get('Authorization')?.replace('Bearer ', '')
        if (apiKey) {
          const tenant = await tenantAuth.authenticateTenant(apiKey)
          if (tenant) {
            await tenantAuth.recordUsage(
              tenant.tenantId,
              `mcp/${params.tool[0]}`,
              method,
              responseTime,
              500,
              0,
              {
                error: error instanceof Error ? error.message : 'Unknown error'
              }
            )
          }
        }
      } catch (recordError) {
        console.error('Error recording usage:', recordError)
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        metadata: {
          timestamp: new Date().toISOString(),
          responseTime: `${responseTime}ms`
        }
      },
      { status: 500 }
    )
  }
}

/**
 * Calculate tokens cost based on tool usage
 */
function calculateTokensCost(toolName: string, result: unknown): number {
  // Simple cost calculation - can be made more sophisticated
  const baseCost = 0.001 // Base cost per API call
  const dataCost = JSON.stringify(result).length * 0.000001 // Cost per byte of response
  
  // Tool-specific multipliers
  const toolMultipliers: Record<string, number> = {
    'send_sms': 2.0,
    'send_email': 1.5,
    'create_contact': 1.2,
    'create_opportunity': 1.2,
    'get_conversation_transcripts': 3.0, // More expensive for RL integration
    'get_contact_journey': 2.5,
  }

  const multiplier = toolMultipliers[toolName] || 1.0
  return (baseCost + dataCost) * multiplier
}

/**
 * List all available MCP tools endpoint
 */
export async function OPTIONS(request: NextRequest) {
  try {
    // Authenticate tenant for tool listing
    const authResult = await tenantAuth.authenticateRequest(request)
    if (!authResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: authResult.error 
        },
        { status: authResult.statusCode || 401 }
      )
    }

    const tools = Object.keys(MCP_TOOLS).map(toolName => ({
      name: toolName,
      description: getToolDescription(toolName),
      category: getToolCategory(toolName),
      parameters: getToolParameters(toolName)
    }))

    return NextResponse.json({
      success: true,
      data: {
        tools,
        totalTools: tools.length,
        categories: [...new Set(tools.map(t => t.category))]
      },
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }
    })

  } catch (error) {
    console.error('Error listing MCP tools:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to list tools'
      },
      { status: 500 }
    )
  }
}

function getToolDescription(toolName: string): string {
  const descriptions: Record<string, string> = {
    'search_contacts': 'Search and filter contacts in GHL',
    'get_contact': 'Get detailed contact information',
    'create_contact': 'Create a new contact',
    'update_contact': 'Update existing contact information',
    'delete_contact': 'Delete a contact',
    'send_sms': 'Send SMS message to contact',
    'send_email': 'Send email to contact',
    'search_opportunities': 'Search opportunities in pipelines',
    'create_opportunity': 'Create new sales opportunity',
    'get_conversation_transcripts': 'Get formatted conversation transcripts for RL analysis',
    'get_contact_journey': 'Get complete contact journey timeline'
  }
  
  return descriptions[toolName] || 'GHL API operation'
}

function getToolCategory(toolName: string): string {
  if (toolName.includes('contact')) return 'Contacts'
  if (toolName.includes('conversation') || toolName.includes('sms') || toolName.includes('email')) return 'Communications'
  if (toolName.includes('opportunity') || toolName.includes('pipeline')) return 'Sales'
  if (toolName.includes('calendar') || toolName.includes('appointment')) return 'Scheduling'
  if (toolName.includes('workflow')) return 'Automation'
  if (toolName.includes('product')) return 'E-commerce'
  if (toolName.includes('transcripts') || toolName.includes('journey')) return 'RL Integration'
  return 'General'
}

function getToolParameters(toolName: string): Record<string, string> {
  // Define expected parameters for each tool
  const parameters: Record<string, Record<string, string>> = {
    'get_contact': { contactId: 'string (required)' },
    'create_contact': { firstName: 'string', lastName: 'string', email: 'string', phone: 'string' },
    'send_sms': { contactId: 'string (required)', message: 'string (required)' },
    'send_email': { contactId: 'string (required)', subject: 'string (required)', body: 'string (required)' },
    'search_contacts': { query: 'string', tags: 'array', limit: 'number' },
    'get_conversation_transcripts': { contactId: 'string', startDate: 'string', endDate: 'string', includeTypes: 'array' }
  }
  
  return parameters[toolName] || {}
}