/**
 * Debug endpoint to see exactly what AI platforms send
 */

import { NextRequest } from 'next/server';

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

  // Debug the request
  (async () => {
    try {
      // Send connected event
      await writer.write(encoder.encode(
        'event: connected\ndata: {"status": "connected", "endpoint": "debug"}\n\n'
      ));

      // Get headers
      const headers: Record<string, string> = {};
      request.headers.forEach((value, key) => {
        headers[key] = value;
      });

      // Send headers info
      await writer.write(encoder.encode(
        `event: headers\ndata: ${JSON.stringify({ headers }, null, 2)}\n\n`
      ));

      // Get URL info
      const urlInfo = {
        url: request.url,
        method: request.method,
        pathname: new URL(request.url).pathname,
        search: new URL(request.url).search,
        searchParams: Object.fromEntries(new URL(request.url).searchParams)
      };

      await writer.write(encoder.encode(
        `event: url_info\ndata: ${JSON.stringify(urlInfo, null, 2)}\n\n`
      ));

      // Try to get body
      let bodyInfo: any = { type: 'no-body' };
      
      try {
        const text = await request.text();
        bodyInfo = {
          type: 'text',
          length: text.length,
          content: text,
          preview: text.substring(0, 500)
        };

        // Try to parse as JSON
        try {
          const json = JSON.parse(text);
          bodyInfo.parsed = json;
          bodyInfo.type = 'json';
        } catch (e) {
          // Not JSON
        }

        // Try to parse as URL encoded
        if (bodyInfo.type === 'text') {
          try {
            const params = new URLSearchParams(text);
            const obj: Record<string, string> = {};
            params.forEach((value, key) => {
              obj[key] = value;
            });
            if (Object.keys(obj).length > 0) {
              bodyInfo.parsed = obj;
              bodyInfo.type = 'urlencoded';
            }
          } catch (e) {
            // Not URL encoded
          }
        }
      } catch (e) {
        bodyInfo = {
          type: 'error',
          error: e instanceof Error ? e.message : 'Unknown error'
        };
      }

      // Send body info
      await writer.write(encoder.encode(
        `event: body\ndata: ${JSON.stringify(bodyInfo, null, 2)}\n\n`
      ));

      // Send summary
      const summary = {
        contentType: headers['content-type'] || 'not-specified',
        hasApiKey: !!headers['x-tenant-api-key'] || !!headers['authorization'],
        bodyType: bodyInfo.type,
        possibleTool: extractPossibleTool(bodyInfo, urlInfo.searchParams)
      };

      await writer.write(encoder.encode(
        `event: summary\ndata: ${JSON.stringify(summary, null, 2)}\n\n`
      ));

      // Complete
      await writer.write(encoder.encode(
        'event: complete\ndata: {"status": "complete", "message": "Debug info collected"}\n\n'
      ));

    } catch (error: any) {
      await writer.write(encoder.encode(
        `event: error\ndata: {"error": "${error.message || 'Unknown error'}"}\n\n`
      ));
    } finally {
      await writer.close();
    }
  })();

  return response;
}

function extractPossibleTool(bodyInfo: any, searchParams: any): string | null {
  // Check URL params
  if (searchParams.tool) return searchParams.tool;
  if (searchParams.action) return searchParams.action;
  if (searchParams.command) return searchParams.command;

  // Check parsed body
  if (bodyInfo.parsed) {
    const fields = [
      'tool', 'action', 'command', 'function', 'operation',
      'mcp_tool', 'tool_name', 'toolName', 'method', 'endpoint',
      'intent', 'skill', 'capability', 'task'
    ];
    
    for (const field of fields) {
      if (bodyInfo.parsed[field]) {
        return bodyInfo.parsed[field];
      }
    }

    // Check nested
    if (bodyInfo.parsed.request?.tool) return bodyInfo.parsed.request.tool;
    if (bodyInfo.parsed.data?.tool) return bodyInfo.parsed.data.tool;
    if (bodyInfo.parsed.payload?.tool) return bodyInfo.parsed.payload.tool;
  }

  return null;
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
      'event: info\ndata: {"message": "Debug endpoint - Use POST to see request details"}\n\n'
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