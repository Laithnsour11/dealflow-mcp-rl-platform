'use client'

import { useState } from 'react'

export default function TestAuthPage() {
  const [apiKey, setApiKey] = useState('')
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testAuth = async () => {
    setLoading(true)
    try {
      // Test 1: Debug auth endpoint
      const debugResponse = await fetch('/api/debug/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ apiKey })
      })
      const debugData = await debugResponse.json()

      // Test 2: Try actual MCP endpoint
      const mcpResponse = await fetch('/api/mcp/get_location', {
        headers: {
          'X-Tenant-API-Key': apiKey
        }
      })
      const mcpData = await mcpResponse.json()

      setResults({
        debug: debugData,
        mcp: {
          status: mcpResponse.status,
          data: mcpData
        }
      })
    } catch (error: any) {
      setResults({
        error: error.message
      })
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Test Authentication</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            API Key
          </label>
          <input
            type="text"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="ghl_mcp_..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={testAuth}
            disabled={loading || !apiKey}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Authentication'}
          </button>
        </div>

        {results && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Results</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">How to get your API key:</h3>
          <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
            <li>Complete the OAuth flow at /onboarding</li>
            <li>Copy the API key from the success page</li>
            <li>Or check localStorage: open DevTools Console and type: <code className="bg-blue-100 px-1">localStorage.getItem('tenant_api_key')</code></li>
          </ol>
        </div>
      </div>
    </div>
  )
}