/**
 * Flexible SSE endpoint for AI platforms
 * Handles various request formats and extracts tool information intelligently
 */

import { NextRequest } from 'next/server';
import { tenantAuth } from '@/lib/auth/tenant-auth';
import { createTenantGHLClientFixed } from '@/lib/ghl/create-client-fix';

// Tool mapping
const TOOL_MAP: Record<string, string> = {
  // Direct mappings
  'search_contacts': 'searchContacts',
  'searchContacts': 'searchContacts',
  'get_contact': 'getContact',
  'getContact': 'getContact',
  'create_contact': 'createContact',
  'createContact': 'createContact',
  'send_sms': 'sendSMS',
  'sendSMS': 'sendSMS',
  'send_email': 'sendEmail',
  'sendEmail': 'sendEmail',
  
  // Alternative names
  'find_contacts': 'searchContacts',
  'lookup_contact': 'getContact',
  'add_contact': 'createContact',
  'sms': 'sendSMS',
  'email': 'sendEmail',
  'text': 'sendSMS',
  'message': 'sendSMS',
};

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  const response = new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
      'Access-Control-Allow-Origin': '*',
    },
  });

  processFlexRequest(request, writer, encoder).catch(console.error);

  return response;
}

async function processFlexRequest(
  request: NextRequest,
  writer: WritableStreamDefaultWriter,
  encoder: TextEncoder
) {
  try {
    // Send connected
    await writer.write(encoder.encode(
      'event: connected\ndata: {"status": "connected", "service": "flexible-sse"}\n\n'
    ));

    // Extract request data
    let toolName: string | null = null;
    let parameters: any = {};
    let requestBody: any = null;

    // Try to parse body
    try {
      const text = await request.text();
      if (text) {
        try {
          requestBody = JSON.parse(text);
        } catch (e) {
          // Try to parse as form data
          const params = new URLSearchParams(text);
          requestBody = {};
          params.forEach((value, key) => {
            requestBody[key] = value;
          });
        }
      }
    } catch (e) {
      console.error('Body parse error:', e);
    }

    // Send debug info
    await writer.write(encoder.encode(
      `event: debug\ndata: ${JSON.stringify({
        message: 'Request received',
        body: requestBody,
        url: request.url
      })}\n\n`
    ));

    // Extract tool name from various sources
    if (requestBody) {
      // Check all possible tool fields
      const toolFields = [
        'tool', 'action', 'command', 'function', 'operation',
        'mcp_tool', 'tool_name', 'toolName', 'method', 'endpoint',
        'intent', 'skill', 'capability', 'task'
      ];
      
      for (const field of toolFields) {
        if (requestBody[field]) {
          toolName = requestBody[field];
          break;
        }
      }

      // Check nested structures
      if (!toolName && requestBody.request?.tool) {
        toolName = requestBody.request.tool;
      }
      if (!toolName && requestBody.data?.tool) {
        toolName = requestBody.data.tool;
      }

      // Extract parameters
      if (requestBody.parameters) {
        parameters = requestBody.parameters;
      } else if (requestBody.params) {
        parameters = requestBody.params;
      } else if (requestBody.args) {
        parameters = requestBody.args;
      } else if (requestBody.input) {
        parameters = requestBody.input;
      } else {
        // Use whole body as parameters, excluding tool fields
        parameters = { ...requestBody };
        toolFields.forEach(field => delete parameters[field]);
        delete parameters.request;
        delete parameters.data;
      }
    }

    // Map tool name to method
    const methodName = toolName ? TOOL_MAP[toolName] : null;

    if (!methodName) {
      await writer.write(encoder.encode(
        `event: error\ndata: ${JSON.stringify({
          error: 'Tool not found',
          requestedTool: toolName,
          availableTools: Object.keys(TOOL_MAP),
          exampleRequest: {
            tool: 'search_contacts',
            parameters: { query: 'john' }
          }
        })}\n\n`
      ));
      await writer.close();
      return;
    }

    // Send processing event
    await writer.write(encoder.encode(
      `event: processing\ndata: ${JSON.stringify({
        tool: toolName,
        method: methodName,
        parameters
      })}\n\n`
    ));

    // Authenticate
    const authResult = await tenantAuth.authenticateRequest(request);
    if (!authResult.success) {
      await writer.write(encoder.encode(
        `event: error\ndata: ${JSON.stringify({
          error: 'Authentication failed',
          message: authResult.error
        })}\n\n`
      ));
      await writer.close();
      return;
    }

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
    
    // Execute method
    const clientMethod = (ghlClient as any)[methodName];
    if (typeof clientMethod !== 'function') {
      await writer.write(encoder.encode(
        `event: error\ndata: {"error": "Method not implemented: ${methodName}"}\n\n`
      ));
      await writer.close();
      return;
    }

    // Call method
    const result = await clientMethod.call(ghlClient, parameters);

    // Send result
    await writer.write(encoder.encode(
      `event: result\ndata: ${JSON.stringify({
        success: true,
        tool: toolName,
        data: result
      })}\n\n`
    ));

    // Complete
    await writer.write(encoder.encode(
      'event: complete\ndata: {"status": "complete"}\n\n'
    ));

  } catch (error: any) {
    await writer.write(encoder.encode(
      `event: error\ndata: ${JSON.stringify({
        error: error.message || 'Unknown error',
        stack: error.stack
      })}\n\n`
    ));
  } finally {
    await writer.close();
  }
}

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  const response = new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
      'Access-Control-Allow-Origin': '*',
    },
  });

  (async () => {
    await writer.write(encoder.encode(
      `event: info\ndata: ${JSON.stringify({
        message: 'Flexible SSE endpoint',
        usage: 'POST with tool name in body',
        supportedFields: [
          'tool', 'action', 'command', 'function', 'operation',
          'mcp_tool', 'tool_name', 'toolName', 'method'
        ],
        example: {
          tool: 'search_contacts',
          parameters: { query: 'john' }
        },
        availableTools: Object.keys(TOOL_MAP)
      })}\n\n`
    ));
    await writer.close();
  })();

  return response;
}

export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': '*',
    },
  });
}