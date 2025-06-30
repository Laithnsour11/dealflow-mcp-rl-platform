/**
 * Simple SSE test endpoint - always works
 * Use this to verify SSE connectivity
 */

import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  return createSSEResponse('GET', request);
}

export async function POST(request: NextRequest) {
  return createSSEResponse('POST', request);
}

function createSSEResponse(method: string, request: NextRequest) {
  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  // Create response with SSE headers
  const response = new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
      'Access-Control-Allow-Origin': '*',
    },
  });

  // Send events
  (async () => {
    try {
      // Event 1: Connection established
      await writer.write(encoder.encode(
        `event: connected\ndata: {"status": "connected", "method": "${method}", "timestamp": "${new Date().toISOString()}"}\n\n`
      ));

      // Event 2: Echo request info
      let requestInfo: any = {
        method,
        url: request.url,
        headers: {}
      };

      // Add select headers
      ['content-type', 'x-tenant-api-key', 'authorization'].forEach(key => {
        const value = request.headers.get(key);
        if (value) requestInfo.headers[key] = value;
      });

      // Try to get body if POST
      if (method === 'POST') {
        try {
          const body = await request.json();
          requestInfo.body = body;
        } catch (e) {
          requestInfo.body = 'Unable to parse body';
        }
      }

      await writer.write(encoder.encode(
        `event: request_info\ndata: ${JSON.stringify(requestInfo)}\n\n`
      ));

      // Event 3: Success
      await writer.write(encoder.encode(
        `event: success\ndata: {"status": "success", "message": "SSE is working correctly!"}\n\n`
      ));

      // Event 4: Complete
      await writer.write(encoder.encode(
        `event: complete\ndata: {"status": "complete", "message": "Test completed"}\n\n`
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