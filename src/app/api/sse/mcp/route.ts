/**
 * MCP Tool SSE Endpoint - Handles tool extraction from request body
 * Compatible with AI platforms that send tool info in the body
 */

import { NextRequest } from 'next/server';
import { tenantAuth } from '@/lib/auth/tenant-auth';
import { createTenantGHLClientFixed } from '@/lib/ghl/create-client-fix';

// MCP tools mapping
const MCP_TOOLS: Record<string, string> = {
  // Contact Management
  'search_contacts': 'searchContacts',
  'get_contact': 'getContact',
  'create_contact': 'createContact',
  'update_contact': 'updateContact',
  'delete_contact': 'deleteContact',
  'get_contact_by_email': 'getContactByEmail',
  'get_contact_by_phone': 'getContactByPhone',
  'add_contact_tags': 'addContactTags',
  'remove_contact_tags': 'removeContactTags',
  'get_contact_notes': 'getContactNotes',
  'create_contact_note': 'createContactNote',
  'get_contact_tasks': 'getContactTasks',
  'create_contact_task': 'createContactTask',
  'get_contact_custom_fields': 'getContactCustomFields',
  'update_contact_custom_fields': 'updateContactCustomFields',
  
  // Conversations
  'search_conversations': 'searchConversations',
  'get_conversation': 'getConversation',
  'send_sms': 'sendSMS',
  'send_email': 'sendEmail',
  'send_whatsapp': 'sendWhatsApp',
  
  // Calendar
  'get_calendars': 'getCalendars',
  'get_free_slots': 'getFreeSlots',
  'create_appointment': 'createAppointment',
  'update_appointment': 'updateAppointment',
  'delete_appointment': 'deleteAppointment',
  
  // Opportunities
  'search_opportunities': 'searchOpportunities',
  'get_pipelines': 'getPipelines',
  'create_opportunity': 'createOpportunity',
  'update_opportunity': 'updateOpportunity',
  'update_opportunity_status': 'updateOpportunityStatus',
  
  // Location
  'get_location': 'getLocation',
  'update_location': 'updateLocation',
};

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  // Create SSE response
  const response = new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'X-Accel-Buffering': 'no',
    },
  });

  // Process request in background
  processMCPRequest(request, writer, encoder).catch((error) => {
    console.error('MCP SSE error:', error);
  });

  return response;
}

async function processMCPRequest(
  request: NextRequest,
  writer: WritableStreamDefaultWriter,
  encoder: TextEncoder
) {
  try {
    // Send connection event
    await writer.write(encoder.encode(
      'event: connected\ndata: {"status": "connected", "message": "MCP SSE endpoint ready"}\n\n'
    ));

    // Parse request body to extract tool and parameters
    let requestData: any = {};
    let toolName: string | null = null;
    
    try {
      const body = await request.json();
      
      // Extract tool name from various possible fields
      toolName = body.tool || body.action || body.command || body.function || body.mcp_tool;
      
      // Extract parameters (remove the tool field)
      requestData = { ...body };
      delete requestData.tool;
      delete requestData.action;
      delete requestData.command;
      delete requestData.function;
      delete requestData.mcp_tool;
      
      // Some platforms might nest parameters
      if (body.parameters) {
        requestData = { ...requestData, ...body.parameters };
        delete requestData.parameters;
      }
      if (body.args) {
        requestData = { ...requestData, ...body.args };
        delete requestData.args;
      }
      
    } catch (error) {
      await writer.write(encoder.encode(
        'event: error\ndata: {"error": "Invalid request body", "message": "Request must be valid JSON"}\n\n'
      ));
      await writer.close();
      return;
    }

    // Validate tool
    if (!toolName) {
      await writer.write(encoder.encode(
        'event: error\ndata: ' + JSON.stringify({
          error: 'No tool specified',
          message: 'Request must include tool, action, command, or mcp_tool field',
          example: {
            tool: 'search_contacts',
            query: 'john'
          },
          availableTools: Object.keys(MCP_TOOLS)
        }) + '\n\n'
      ));
      await writer.close();
      return;
    }

    if (!MCP_TOOLS[toolName]) {
      await writer.write(encoder.encode(
        'event: error\ndata: ' + JSON.stringify({
          error: 'Invalid tool',
          requestedTool: toolName,
          availableTools: Object.keys(MCP_TOOLS),
          suggestion: 'Check tool name spelling'
        }) + '\n\n'
      ));
      await writer.close();
      return;
    }

    // Send processing event
    await writer.write(encoder.encode(
      `event: processing\ndata: ${JSON.stringify({
        status: 'processing',
        tool: toolName,
        message: 'Authenticating...'
      })}\n\n`
    ));

    // Authenticate
    const authResult = await tenantAuth.authenticateRequest(request);
    if (!authResult.success) {
      await writer.write(encoder.encode(
        'event: error\ndata: ' + JSON.stringify({
          error: authResult.error,
          statusCode: authResult.statusCode
        }) + '\n\n'
      ));
      await writer.close();
      return;
    }

    // Send auth success
    await writer.write(encoder.encode(
      'event: authenticated\ndata: {"status": "authenticated", "tenantId": "' + 
      authResult.tenant?.tenantId + '"}\n\n'
    ));

    // Send executing event
    await writer.write(encoder.encode(
      `event: executing\ndata: ${JSON.stringify({
        status: 'executing',
        tool: toolName,
        parameters: requestData
      })}\n\n`
    ));

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
    
    // Execute tool
    const methodName = MCP_TOOLS[toolName];
    const clientMethod = (ghlClient as any)[methodName];
    
    if (typeof clientMethod !== 'function') {
      await writer.write(encoder.encode(
        'event: error\ndata: {"error": "Method not found", "method": "' + methodName + '"}\n\n'
      ));
      await writer.close();
      return;
    }

    // Call the method
    const result = await clientMethod.call(ghlClient, requestData);

    // Send result
    await writer.write(encoder.encode(
      'event: result\ndata: ' + JSON.stringify({
        success: true,
        tool: toolName,
        data: result,
        metadata: {
          tenantId: authResult.tenant?.tenantId,
          timestamp: new Date().toISOString()
        }
      }) + '\n\n'
    ));

    // Send complete
    await writer.write(encoder.encode(
      'event: complete\ndata: {"status": "complete", "message": "Request completed successfully"}\n\n'
    ));

  } catch (error: any) {
    console.error('MCP processing error:', error);
    
    await writer.write(encoder.encode(
      'event: error\ndata: ' + JSON.stringify({
        error: error.message || 'Internal error',
        code: error.code || 'UNKNOWN_ERROR'
      }) + '\n\n'
    ));
  } finally {
    await writer.close();
  }
}

// Support GET for testing
export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  const response = new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'X-Accel-Buffering': 'no',
    },
  });

  // Send info about how to use this endpoint
  (async () => {
    await writer.write(encoder.encode(
      'event: info\ndata: ' + JSON.stringify({
        message: 'MCP SSE endpoint - POST required',
        usage: 'Send POST request with tool name and parameters',
        example: {
          tool: 'search_contacts',
          query: 'john',
          limit: 10
        },
        availableTools: Object.keys(MCP_TOOLS)
      }) + '\n\n'
    ));
    
    await writer.write(encoder.encode(
      'event: complete\ndata: {"message": "Use POST method with tool specification"}\n\n'
    ));
    
    await writer.close();
  })();

  return response;
}

// OPTIONS for CORS
export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Tenant-API-Key, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}