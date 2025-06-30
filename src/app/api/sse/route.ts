/**
 * SSE Test Endpoint - No tool name required
 * Use this to test SSE connectivity with AI platforms
 */

import { NextRequest } from 'next/server';
import { tenantAuth } from '@/lib/auth/tenant-auth';

export async function GET(request: NextRequest) {
  return handleSSETest(request);
}

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  // Create SSE response immediately
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

  // Process in background
  processMCPToolRequest(request, writer, encoder).catch((error) => {
    console.error('SSE MCP error:', error);
  });

  return response;
}

async function handleSSETest(request: NextRequest) {
  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  // Create SSE response with proper headers
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

  // Process test in background
  processTestSSE(request, writer, encoder).catch((error) => {
    console.error('SSE test error:', error);
  });

  return response;
}

async function processMCPToolRequest(
  request: NextRequest,
  writer: WritableStreamDefaultWriter,
  encoder: TextEncoder
) {
  try {
    // Send connected event
    await writer.write(encoder.encode(
      'event: connected\ndata: {"status": "connected", "message": "MCP endpoint ready"}\n\n'
    ));

    // Try to extract tool information from request body
    let toolName: string | null = null;
    let params: any = {};
    let rawBody: string = '';

    try {
      // Clone request to read body without consuming it
      const clonedRequest = request.clone();
      rawBody = await clonedRequest.text();
      
      // Log for debugging
      console.log('SSE POST request received:', {
        url: request.url,
        headers: Object.fromEntries(request.headers.entries()),
        bodyLength: rawBody.length,
        bodyPreview: rawBody.substring(0, 200)
      });

      if (rawBody) {
        try {
          // Try JSON parse
          const body = JSON.parse(rawBody);
          
          // Extract tool from various possible locations
          toolName = body.tool || body.action || body.command || body.function || 
                     body.mcp_tool || body.tool_name || body.toolName || 
                     body.method || body.operation || body.intent || body.skill;
          
          // Check nested locations
          if (!toolName && body.request?.tool) toolName = body.request.tool;
          if (!toolName && body.data?.tool) toolName = body.data.tool;
          if (!toolName && body.payload?.tool) toolName = body.payload.tool;
          
          // Extract parameters
          params = body.parameters || body.params || body.args || body.input || 
                   body.data || body.payload || {};
          
          // If params is still empty and we have a body, use the whole body
          if (Object.keys(params).length === 0 && Object.keys(body).length > 0) {
            params = { ...body };
            // Remove tool-related fields
            ['tool', 'action', 'command', 'function', 'mcp_tool', 'tool_name', 
             'toolName', 'method', 'operation', 'intent', 'skill', 'request', 
             'data', 'payload'].forEach(field => delete params[field]);
          }
        } catch (jsonError) {
          // Try URL encoded
          try {
            const urlParams = new URLSearchParams(rawBody);
            toolName = urlParams.get('tool') || urlParams.get('action') || 
                      urlParams.get('command') || urlParams.get('function');
            urlParams.forEach((value, key) => {
              if (!['tool', 'action', 'command', 'function'].includes(key)) {
                params[key] = value;
              }
            });
          } catch (urlError) {
            console.error('Failed to parse as URL encoded:', urlError);
          }
        }
      }
      
      // Also check URL params
      const url = new URL(request.url);
      if (!toolName) {
        toolName = url.searchParams.get('tool') || url.searchParams.get('action');
      }
      
    } catch (e) {
      console.error('Error parsing request:', e);
      await writer.write(encoder.encode(
        `event: parse_error\ndata: ${JSON.stringify({
          error: 'Failed to parse request',
          message: e instanceof Error ? e.message : 'Unknown error',
          suggestion: 'Ensure request body is valid JSON or URL-encoded'
        })}\n\n`
      ));
    }

    // If no tool found, send available tools
    if (!toolName) {
      await writer.write(encoder.encode(
        'event: tools\ndata: ' + JSON.stringify({
          status: 'available_tools',
          message: 'No tool specified. Available tools:',
          tools: [
            { name: 'search_contacts', description: 'Search for contacts' },
            { name: 'get_contact', description: 'Get contact by ID' },
            { name: 'create_contact', description: 'Create new contact' },
            { name: 'send_sms', description: 'Send SMS message' },
            { name: 'send_email', description: 'Send email' },
            { name: 'create_appointment', description: 'Create appointment' },
            { name: 'get_pipelines', description: 'Get sales pipelines' },
            { name: 'create_opportunity', description: 'Create opportunity' }
          ],
          usage: {
            json: { tool: 'search_contacts', parameters: { query: 'john' } },
            form: 'tool=search_contacts&query=john'
          }
        }) + '\n\n'
      ));
      
      await writer.write(encoder.encode(
        'event: complete\ndata: {"status": "complete", "message": "Please specify a tool to use"}\n\n'
      ));
      
      await writer.close();
      return;
    }

    // Send processing event
    await writer.write(encoder.encode(
      `event: processing\ndata: ${JSON.stringify({
        status: 'processing',
        tool: toolName,
        parameters: params
      })}\n\n`
    ));

    // Import and execute the tool
    try {
      const { handleSSERequest } = await import('./[...tool]/route');
      
      // Create a new request with the tool in the URL path
      const toolUrl = new URL(request.url);
      toolUrl.pathname = `/api/sse/${toolName}`;
      
      // Create new request with modified URL
      const toolRequest = new Request(toolUrl.toString(), {
        method: 'POST',
        headers: request.headers,
        body: JSON.stringify(params)
      });

      // Close our writer and let the tool handler take over
      await writer.close();
      
      // Execute the tool
      return handleSSERequest(toolRequest, { tool: [toolName] }, 'POST');
      
    } catch (error: any) {
      await writer.write(encoder.encode(
        'event: error\ndata: ' + JSON.stringify({
          error: 'Tool execution failed',
          tool: toolName,
          message: error.message || 'Unknown error',
          suggestion: 'Check tool name and parameters'
        }) + '\n\n'
      ));
      
      await writer.close();
    }
    
  } catch (error: any) {
    console.error('MCP processing error:', error);
    
    await writer.write(encoder.encode(
      'event: error\ndata: ' + JSON.stringify({
        error: 'Request processing failed',
        message: error.message || 'Internal error'
      }) + '\n\n'
    ));
    
    await writer.close();
  }
}

async function processTestSSE(
  request: NextRequest,
  writer: WritableStreamDefaultWriter,
  encoder: TextEncoder
) {
  try {
    // Send initial connection event
    await writer.write(encoder.encode(
      'event: connected\ndata: {"status": "connected", "message": "SSE test endpoint active", "timestamp": "' + 
      new Date().toISOString() + '"}\n\n'
    ));

    // Send system info
    await writer.write(encoder.encode(
      'event: info\ndata: ' + JSON.stringify({
        status: 'info',
        platform: 'GoHighLevel MCP Platform',
        version: '1.0.0',
        endpoints: {
          sse: '/api/sse/[tool_name]',
          stream: '/api/stream/[tool_name]',
          ai: '/api/ai/[tool_name]'
        },
        availableTools: [
          'search_contacts',
          'get_contact',
          'create_contact',
          'send_sms',
          'send_email',
          'create_appointment',
          'get_free_slots',
          'create_opportunity',
          'get_pipelines'
        ],
        documentation: 'https://github.com/Laithnsour11/dealflow-mcp-rl-platform/docs'
      }) + '\n\n'
    ));

    // Test authentication if API key provided
    const apiKey = request.headers.get('X-Tenant-API-Key') || 
                  request.headers.get('Authorization')?.replace('Bearer ', '');

    if (apiKey) {
      await writer.write(encoder.encode(
        'event: authenticating\ndata: {"status": "authenticating", "message": "Validating API key..."}\n\n'
      ));

      const authResult = await tenantAuth.authenticateRequest(request);
      
      if (authResult.success) {
        await writer.write(encoder.encode(
          'event: authenticated\ndata: ' + JSON.stringify({
            status: 'authenticated',
            success: true,
            tenantId: authResult.tenant?.tenantId,
            message: 'API key is valid! You can now use all endpoints.',
            exampleUrls: [
              '/api/sse/search_contacts',
              '/api/sse/send_sms',
              '/api/sse/create_appointment'
            ]
          }) + '\n\n'
        ));

        // Send example usage
        await writer.write(encoder.encode(
          'event: example\ndata: ' + JSON.stringify({
            status: 'example',
            message: 'Example tool usage',
            examples: {
              searchContacts: {
                url: '/api/sse/search_contacts?query=john',
                method: 'GET'
              },
              sendSMS: {
                url: '/api/sse/send_sms',
                method: 'POST',
                body: {
                  contactId: 'contact_123',
                  message: 'Hello from AI!'
                }
              }
            }
          }) + '\n\n'
        ));
      } else {
        await writer.write(encoder.encode(
          'event: auth_failed\ndata: ' + JSON.stringify({
            status: 'auth_failed',
            success: false,
            error: authResult.error,
            message: 'Invalid API key. Please check your credentials.'
          }) + '\n\n'
        ));
      }
    } else {
      await writer.write(encoder.encode(
        'event: no_auth\ndata: ' + JSON.stringify({
          status: 'no_auth',
          message: 'No API key provided. Add X-Tenant-API-Key header to authenticate.',
          example: 'X-Tenant-API-Key: ghl_mcp_xxxxxxxxxxxxx'
        }) + '\n\n'
      ));
    }

    // Send test data chunks to verify streaming
    await writer.write(encoder.encode(
      'event: test_chunk_1\ndata: {"chunk": 1, "message": "Testing streaming chunk 1/3"}\n\n'
    ));

    // Small delay to simulate streaming
    await new Promise(resolve => setTimeout(resolve, 500));

    await writer.write(encoder.encode(
      'event: test_chunk_2\ndata: {"chunk": 2, "message": "Testing streaming chunk 2/3"}\n\n'
    ));

    await new Promise(resolve => setTimeout(resolve, 500));

    await writer.write(encoder.encode(
      'event: test_chunk_3\ndata: {"chunk": 3, "message": "Testing streaming chunk 3/3"}\n\n'
    ));

    // Send completion event
    await writer.write(encoder.encode(
      'event: complete\ndata: ' + JSON.stringify({
        status: 'complete',
        success: true,
        message: 'SSE test completed successfully!',
        summary: {
          connectionEstablished: true,
          streamingVerified: true,
          authenticationTested: !!apiKey,
          readyForProduction: true
        }
      }) + '\n\n'
    ));

  } catch (error: any) {
    console.error('SSE test error:', error);
    
    await writer.write(encoder.encode(
      'event: error\ndata: ' + JSON.stringify({
        status: 'error',
        error: error.message || 'Test failed',
        suggestion: 'Check console logs for details'
      }) + '\n\n'
    ));
  } finally {
    // Close the stream
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