/**
 * SSE (Server-Sent Events) wrapper for MCP tools
 * Provides streaming interface for AI platforms like VAPI, ElevenLabs, etc.
 */

import { NextRequest } from 'next/server';
import { tenantAuth } from '@/lib/auth/tenant-auth';
import { createTenantGHLClientFixed } from '@/lib/ghl/create-client-fix';

// Same MCP tools mapping as main endpoint
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
  
  // Add more as needed...
};

export async function GET(
  request: NextRequest,
  { params }: { params: { tool: string[] } }
) {
  return handleSSERequest(request, params, 'GET');
}

export async function POST(
  request: NextRequest,
  { params }: { params: { tool: string[] } }
) {
  return handleSSERequest(request, params, 'POST');
}

async function handleSSERequest(
  request: NextRequest,
  params: { tool: string[] },
  method: 'GET' | 'POST'
) {
  // Create SSE response
  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  // Start SSE response
  const response = new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'X-Accel-Buffering': 'no', // Disable Nginx buffering
    },
  });

  // Process request in background
  processRequest(request, params, method, writer, encoder).catch((error) => {
    console.error('SSE processing error:', error);
  });

  return response;
}

async function processRequest(
  request: NextRequest,
  params: { tool: string[] },
  method: 'GET' | 'POST',
  writer: WritableStreamDefaultWriter,
  encoder: TextEncoder
) {
  try {
    // Send initial connection event
    await writer.write(encoder.encode('event: connected\ndata: {"status": "connected", "message": "SSE stream established"}\n\n'));

    // Extract tool name
    const toolName = params.tool?.[0];
    if (!toolName || !MCP_TOOLS[toolName]) {
      await writer.write(encoder.encode(
        `event: error\ndata: ${JSON.stringify({
          error: 'Invalid tool name',
          availableTools: Object.keys(MCP_TOOLS)
        })}\n\n`
      ));
      await writer.close();
      return;
    }

    // Send processing event
    await writer.write(encoder.encode(
      `event: processing\ndata: ${JSON.stringify({
        status: 'processing',
        tool: toolName,
        message: 'Authenticating request...'
      })}\n\n`
    ));

    // Authenticate
    const authResult = await tenantAuth.authenticateRequest(request);
    if (!authResult.success) {
      await writer.write(encoder.encode(
        `event: error\ndata: ${JSON.stringify({
          error: authResult.error,
          statusCode: authResult.statusCode
        })}\n\n`
      ));
      await writer.close();
      return;
    }

    // Send auth success event
    await writer.write(encoder.encode(
      `event: authenticated\ndata: ${JSON.stringify({
        status: 'authenticated',
        tenantId: authResult.tenant?.tenantId
      })}\n\n`
    ));

    // Parse request data
    let requestData: Record<string, any> = {};
    if (method === 'POST') {
      try {
        requestData = await request.json();
      } catch (error) {
        requestData = {};
      }
    } else {
      const url = new URL(request.url);
      url.searchParams.forEach((value, key) => {
        requestData[key] = value;
      });
    }

    // Send executing event
    await writer.write(encoder.encode(
      `event: executing\ndata: ${JSON.stringify({
        status: 'executing',
        tool: toolName,
        message: `Calling ${toolName}...`
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
        `event: error\ndata: ${JSON.stringify({
          error: `Method ${methodName} not found`
        })}\n\n`
      ));
      await writer.close();
      return;
    }

    // Call the method
    const result = await clientMethod.call(ghlClient, requestData);

    // Send result event
    await writer.write(encoder.encode(
      `event: result\ndata: ${JSON.stringify({
        success: true,
        data: result,
        metadata: {
          tool: toolName,
          tenantId: authResult.tenant?.tenantId,
          timestamp: new Date().toISOString()
        }
      })}\n\n`
    ));

    // Send complete event
    await writer.write(encoder.encode(
      'event: complete\ndata: {"status": "complete", "message": "Request completed successfully"}\n\n'
    ));

  } catch (error: any) {
    console.error('SSE Error:', error);
    
    // Send error event
    await writer.write(encoder.encode(
      `event: error\ndata: ${JSON.stringify({
        error: error.message || 'Internal server error',
        code: error.code || 'UNKNOWN_ERROR'
      })}\n\n`
    ));
  } finally {
    // Close the stream
    await writer.close();
  }
}