import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            GoHighLevel MCP + RL Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Multi-tenant Model Context Protocol server with Reinforcement Learning integration
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-12">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Documentation</h2>
            <p className="text-gray-600 mb-4">
              Access comprehensive documentation for the MCP API and integration guides.
            </p>
            <Link
              href="/docs"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              View Documentation
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">API Endpoints</h2>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• <code className="bg-gray-100 px-2 py-1 rounded">/api/health</code> - Health check</li>
              <li>• <code className="bg-gray-100 px-2 py-1 rounded">/api/tenant/register</code> - Register new tenant</li>
              <li>• <code className="bg-gray-100 px-2 py-1 rounded">/api/mcp/*</code> - MCP tool endpoints</li>
              <li>• <code className="bg-gray-100 px-2 py-1 rounded">/api/rl/*</code> - RL integration endpoints</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-900 mb-2">Getting Started</h3>
          <ol className="list-decimal list-inside space-y-2 text-yellow-800">
            <li>Register your tenant at <code className="bg-yellow-100 px-2 py-1 rounded">/api/tenant/register</code></li>
            <li>Store your API key securely (prefix: <code>ghl_mcp_</code>)</li>
            <li>Include <code>X-Tenant-API-Key</code> header in all MCP requests</li>
            <li>Check the documentation for available MCP tools and examples</li>
          </ol>
        </div>
      </div>
    </main>
  )
}
