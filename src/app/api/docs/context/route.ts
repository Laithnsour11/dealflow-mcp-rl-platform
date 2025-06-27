import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

export async function GET() {
  try {
    const docPath = path.join(process.cwd(), 'docs', 'MCP-LLM-CONTEXT.md')
    const content = await fs.readFile(docPath, 'utf-8')
    return new NextResponse(content, {
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'public, max-age=3600'
      }
    })
  } catch (error) {
    return NextResponse.json({ error: 'Documentation not found' }, { status: 404 })
  }
}