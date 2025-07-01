/**
 * MCP SSE Wrapper - Handles tool extraction for AI platforms
 * Use this endpoint when your AI platform sends tool info in the request body
 */

import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Read the request body
    const body = await request.json();
    
    // Extract tool name from various possible fields
    const toolName = body.tool || body.action || body.command || body.function || 
                     body.mcp_tool || body.tool_name || body.toolName || 
                     body.method || body.operation || body.intent || body.skill ||
                     body.request?.tool || body.data?.tool || body.payload?.tool;
    
    if (!toolName) {
      // Return error as SSE
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
          'event: error\ndata: {"error": "No tool specified", "availableTools": ["search_contacts", "send_sms", "create_contact", "get_contact", "create_appointment"]}\n\n'
        ));
        await writer.close();
      })();
      
      return response;
    }
    
    // Extract parameters
    let params = body.parameters || body.params || body.args || body.input || {};
    
    // If no separate params, use the whole body minus tool fields
    if (Object.keys(params).length === 0) {
      params = { ...body };
      // Remove tool-related fields
      ['tool', 'action', 'command', 'function', 'mcp_tool', 'tool_name', 
       'toolName', 'method', 'operation', 'intent', 'skill', 'request', 
       'data', 'payload'].forEach(field => delete params[field]);
    }
    
    // Build the target URL
    const targetUrl = new URL(request.url);
    targetUrl.pathname = `/api/sse/${toolName}`;
    
    // Create new request with the tool in the path
    const toolRequest = new Request(targetUrl.toString(), {
      method: 'POST',
      headers: request.headers,
      body: JSON.stringify(params)
    });
    
    // Forward to the SSE tool endpoint
    const response = await fetch(toolRequest);
    return response;
    
  } catch (error: any) {
    // Return error as SSE
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
        `event: error\ndata: ${JSON.stringify({
          error: 'Request processing failed',
          message: error.message || 'Unknown error'
        })}\n\n`
      ));
      await writer.close();
    })();
    
    return response;
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
      'event: info\ndata: {"message": "MCP SSE Wrapper - Use POST with tool in body", "example": {"tool": "search_contacts", "query": "john"}}\n\n'
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
      'Access-Control-Allow-Headers': 'Content-Type, X-Tenant-API-Key, Authorization',
    },
  });
}