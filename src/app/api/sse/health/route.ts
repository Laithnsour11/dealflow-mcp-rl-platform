/**
 * SSE Health Check Endpoint
 * Simple endpoint to verify SSE is working
 */

import { NextRequest } from 'next/server';

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

  // Simple health check
  (async () => {
    try {
      await writer.write(encoder.encode(
        'event: health\ndata: {"status": "healthy", "service": "SSE", "timestamp": "' + 
        new Date().toISOString() + '"}\n\n'
      ));
      
      await writer.write(encoder.encode(
        'event: complete\ndata: {"message": "Health check complete"}\n\n'
      ));
    } catch (error) {
      await writer.write(encoder.encode(
        'event: error\ndata: {"status": "unhealthy", "error": "' + error + '"}\n\n'
      ));
    } finally {
      await writer.close();
    }
  })();

  return response;
}