/**
 * Streaming HTTP wrapper for MCP tools
 * Provides streaming interface for AI platforms that require chunked responses
 */

import { NextRequest } from 'next/server';
import { tenantAuth } from '@/lib/auth/tenant-auth';
import { createTenantGHLClientFixed } from '@/lib/ghl/create-client-fix';

// Same MCP tools mapping
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
  return handleStreamRequest(request, params, 'GET');
}

export async function POST(
  request: NextRequest,
  { params }: { params: { tool: string[] } }
) {
  return handleStreamRequest(request, params, 'POST');
}

async function handleStreamRequest(
  request: NextRequest,
  params: { tool: string[] },
  method: 'GET' | 'POST'
) {
  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  // Create streaming response
  const response = new Response(stream.readable, {
    headers: {
      'Content-Type': 'application/json',
      'Transfer-Encoding': 'chunked',
      'Cache-Control': 'no-cache',
      'X-Accel-Buffering': 'no', // Disable Nginx buffering
      'Access-Control-Allow-Origin': '*',
    },
  });

  // Process in background
  processStreamRequest(request, params, method, writer, encoder).catch((error) => {
    console.error('Stream processing error:', error);
  });

  return response;
}

async function processStreamRequest(
  request: NextRequest,
  params: { tool: string[] },
  method: 'GET' | 'POST',
  writer: WritableStreamDefaultWriter,
  encoder: TextEncoder
) {
  try {
    // Send initial chunk
    await sendChunk(writer, encoder, {
      type: 'start',
      status: 'connected',
      message: 'Stream initialized'
    });

    // Validate tool
    const toolName = params.tool?.[0];
    if (!toolName || !MCP_TOOLS[toolName]) {
      await sendChunk(writer, encoder, {
        type: 'error',
        error: 'Invalid tool name',
        availableTools: Object.keys(MCP_TOOLS)
      });
      await writer.close();
      return;
    }

    // Send processing status
    await sendChunk(writer, encoder, {
      type: 'status',
      status: 'authenticating',
      tool: toolName
    });

    // Authenticate
    const authResult = await tenantAuth.authenticateRequest(request);
    if (!authResult.success) {
      await sendChunk(writer, encoder, {
        type: 'error',
        error: authResult.error,
        statusCode: authResult.statusCode
      });
      await writer.close();
      return;
    }

    // Auth success
    await sendChunk(writer, encoder, {
      type: 'authenticated',
      tenantId: authResult.tenant?.tenantId
    });

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

    // Send executing status
    await sendChunk(writer, encoder, {
      type: 'executing',
      tool: toolName,
      parameters: requestData
    });

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
      await sendChunk(writer, encoder, {
        type: 'error',
        error: `Method ${methodName} not found`
      });
      await writer.close();
      return;
    }

    // Call the method
    const result = await clientMethod.call(ghlClient, requestData);

    // For large results, we can chunk the data
    if (Array.isArray(result) && result.length > 10) {
      // Send data in chunks
      await sendChunk(writer, encoder, {
        type: 'result_start',
        totalItems: result.length
      });

      for (let i = 0; i < result.length; i += 10) {
        const chunk = result.slice(i, i + 10);
        await sendChunk(writer, encoder, {
          type: 'result_chunk',
          chunkIndex: Math.floor(i / 10),
          items: chunk
        });
      }

      await sendChunk(writer, encoder, {
        type: 'result_end'
      });
    } else {
      // Send complete result
      await sendChunk(writer, encoder, {
        type: 'result',
        success: true,
        data: result,
        metadata: {
          tool: toolName,
          tenantId: authResult.tenant?.tenantId,
          timestamp: new Date().toISOString()
        }
      });
    }

    // Send completion
    await sendChunk(writer, encoder, {
      type: 'complete',
      status: 'success',
      message: 'Request completed'
    });

  } catch (error: any) {
    console.error('Stream Error:', error);
    
    await sendChunk(writer, encoder, {
      type: 'error',
      error: error.message || 'Internal server error',
      code: error.code || 'UNKNOWN_ERROR'
    });
  } finally {
    await writer.close();
  }
}

// Helper function to send chunks
async function sendChunk(
  writer: WritableStreamDefaultWriter,
  encoder: TextEncoder,
  data: any
) {
  const chunk = JSON.stringify(data) + '\n';
  await writer.write(encoder.encode(chunk));
}