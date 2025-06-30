/**
 * Unified AI Platform Integration Endpoint
 * Supports both SSE and Streaming HTTP based on headers
 * Compatible with VAPI, ElevenLabs, and other AI platforms
 */

import { NextRequest } from 'next/server';
import { tenantAuth } from '@/lib/auth/tenant-auth';
import { createTenantGHLClientFixed } from '@/lib/ghl/create-client-fix';

// Extended MCP tools mapping for AI use cases
const MCP_TOOLS: Record<string, string> = {
  // Contact Management - Essential for AI agents
  'search_contacts': 'searchContacts',
  'get_contact': 'getContact',
  'create_contact': 'createContact',
  'update_contact': 'updateContact',
  'get_contact_by_phone': 'getContactByPhone',
  'get_contact_by_email': 'getContactByEmail',
  'add_contact_tags': 'addContactTags',
  'create_contact_note': 'createContactNote',
  'update_contact_custom_fields': 'updateContactCustomFields',
  
  // Conversations - Critical for AI communication
  'search_conversations': 'searchConversations',
  'get_conversation': 'getConversation',
  'send_sms': 'sendSMS',
  'send_email': 'sendEmail',
  'send_whatsapp': 'sendWhatsApp',
  
  // Calendar - For AI scheduling
  'get_calendars': 'getCalendars',
  'get_free_slots': 'getFreeSlots',
  'create_appointment': 'createAppointment',
  'update_appointment': 'updateAppointment',
  
  // Opportunities - For AI sales agents
  'search_opportunities': 'searchOpportunities',
  'get_pipelines': 'getPipelines',
  'create_opportunity': 'createOpportunity',
  'update_opportunity': 'updateOpportunity',
  'update_opportunity_status': 'updateOpportunityStatus',
  
  // Location
  'get_location': 'getLocation',
};

export async function GET(
  request: NextRequest,
  { params }: { params: { tool: string[] } }
) {
  return handleAIRequest(request, params, 'GET');
}

export async function POST(
  request: NextRequest,
  { params }: { params: { tool: string[] } }
) {
  return handleAIRequest(request, params, 'POST');
}

async function handleAIRequest(
  request: NextRequest,
  params: { tool: string[] },
  method: 'GET' | 'POST'
) {
  // Detect preferred format from headers
  const acceptHeader = request.headers.get('accept') || '';
  const userAgent = request.headers.get('user-agent') || '';
  
  // Determine response format based on client
  const useSSE = acceptHeader.includes('text/event-stream') || 
                 userAgent.toLowerCase().includes('vapi') ||
                 request.headers.get('x-stream-format') === 'sse';
  
  if (useSSE) {
    return handleSSEResponse(request, params, method);
  } else {
    return handleStreamingResponse(request, params, method);
  }
}

// SSE Response Handler (for VAPI, etc.)
async function handleSSEResponse(
  request: NextRequest,
  params: { tool: string[] },
  method: 'GET' | 'POST'
) {
  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  const response = new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Tenant-API-Key, Authorization',
    },
  });

  // Process asynchronously
  processAIRequest(request, params, method, writer, encoder, 'sse').catch(console.error);

  return response;
}

// Streaming JSON Response Handler (for ElevenLabs, etc.)
async function handleStreamingResponse(
  request: NextRequest,
  params: { tool: string[] },
  method: 'GET' | 'POST'
) {
  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  const response = new Response(stream.readable, {
    headers: {
      'Content-Type': 'application/x-ndjson', // Newline-delimited JSON
      'Transfer-Encoding': 'chunked',
      'Cache-Control': 'no-cache',
      'X-Accel-Buffering': 'no',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Tenant-API-Key, Authorization',
    },
  });

  // Process asynchronously
  processAIRequest(request, params, method, writer, encoder, 'stream').catch(console.error);

  return response;
}

// Main processing function
async function processAIRequest(
  request: NextRequest,
  params: { tool: string[] },
  method: 'GET' | 'POST',
  writer: WritableStreamDefaultWriter,
  encoder: TextEncoder,
  format: 'sse' | 'stream'
) {
  const sendMessage = async (data: any, event?: string) => {
    if (format === 'sse') {
      const message = event 
        ? `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
        : `data: ${JSON.stringify(data)}\n\n`;
      await writer.write(encoder.encode(message));
    } else {
      await writer.write(encoder.encode(JSON.stringify(data) + '\n'));
    }
  };

  try {
    // Initial connection
    await sendMessage({
      status: 'connected',
      timestamp: new Date().toISOString(),
      format
    }, 'connection');

    // Validate tool
    const toolName = params.tool?.[0];
    if (!toolName || !MCP_TOOLS[toolName]) {
      await sendMessage({
        error: 'Invalid tool',
        requestedTool: toolName,
        availableTools: Object.keys(MCP_TOOLS),
        suggestion: 'Use one of the available tools listed above'
      }, 'error');
      await writer.close();
      return;
    }

    // Status update
    await sendMessage({
      status: 'authenticating',
      tool: toolName
    }, 'status');

    // Authenticate
    const authResult = await tenantAuth.authenticateRequest(request);
    if (!authResult.success) {
      await sendMessage({
        error: authResult.error,
        statusCode: authResult.statusCode,
        message: 'Please check your API key'
      }, 'error');
      await writer.close();
      return;
    }

    // Authentication successful
    await sendMessage({
      status: 'authenticated',
      tenantId: authResult.tenant?.tenantId
    }, 'auth');

    // Parse request data
    let requestData: Record<string, any> = {};
    if (method === 'POST') {
      try {
        const contentType = request.headers.get('content-type') || '';
        
        if (contentType.includes('application/json')) {
          requestData = await request.json();
        } else if (contentType.includes('application/x-www-form-urlencoded')) {
          const formData = await request.formData();
          formData.forEach((value, key) => {
            requestData[key] = value;
          });
        }
      } catch (error) {
        console.log('Could not parse body, using empty object');
      }
    } else {
      const url = new URL(request.url);
      url.searchParams.forEach((value, key) => {
        requestData[key] = value;
      });
    }

    // Executing
    await sendMessage({
      status: 'executing',
      tool: toolName,
      parameters: requestData
    }, 'progress');

    // Create GHL client
    const tenantData = {
      id: authResult.tenantConfig.id,
      name: authResult.tenantConfig.name,
      subdomain: authResult.tenantConfig.name.toLowerCase().replace(/\s+/g, '-'),
      api_key_hash: '',
      encrypted_ghl_api_key: '',
      ghl_location_id: authResult.tenantConfig.ghlLocationId,
      settings: {},
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
      subscription_tier: 'pro' as const,
      usage_limit: 1000,
      current_usage: 0
    };

    const ghlClient = createTenantGHLClientFixed(tenantData, authResult.tenantConfig.ghlApiKey);
    
    // Get method
    const methodName = MCP_TOOLS[toolName];
    const clientMethod = (ghlClient as any)[methodName];
    
    if (typeof clientMethod !== 'function') {
      await sendMessage({
        error: `Method ${methodName} not implemented`,
        tool: toolName
      }, 'error');
      await writer.close();
      return;
    }

    // Execute
    const startTime = Date.now();
    const result = await clientMethod.call(ghlClient, requestData);
    const executionTime = Date.now() - startTime;

    // Send result
    await sendMessage({
      success: true,
      tool: toolName,
      executionTime: `${executionTime}ms`,
      data: result,
      metadata: {
        timestamp: new Date().toISOString(),
        tenantId: authResult.tenant?.tenantId,
        format
      }
    }, 'result');

    // Complete
    await sendMessage({
      status: 'complete',
      message: 'Request processed successfully'
    }, 'complete');

  } catch (error: any) {
    console.error('AI Processing Error:', error);
    
    await sendMessage({
      error: error.message || 'Processing failed',
      code: error.code || 'INTERNAL_ERROR',
      tool: params.tool?.[0],
      suggestion: 'Check your parameters and try again'
    }, 'error');
  } finally {
    await writer.close();
  }
}

// OPTIONS handler for CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Tenant-API-Key, Authorization, Accept',
      'Access-Control-Max-Age': '86400',
    },
  });
}