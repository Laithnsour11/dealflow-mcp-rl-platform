/**
 * Main Platform Landing Page
 * Shows platform status, API endpoints, and testing interface
 */
'use client'

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          🚀 GHL MCP + RL Platform
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Multi-tenant GoHighLevel MCP Server with 96.7% accuracy Reinforcement Learning integration.
          Transform your GHL CRM with AI-powered conversation analysis and lead routing.
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="analytics-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Platform Status</h3>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Database</span>
              <span className="text-green-600 font-semibold">Ready</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">MCP Server</span>
              <span className="text-green-600 font-semibold">Running</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">RL System</span>
              <span className="text-green-600 font-semibold">Active</span>
            </div>
          </div>
        </div>

        <div className="analytics-card">
          <h3 className="text-lg font-semibold mb-4">API Endpoints</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="font-mono text-blue-600">/api/mcp/*</span>
              <span className="text-gray-500">GHL Tools</span>
            </div>
            <div className="flex justify-between">
              <span className="font-mono text-purple-600">/api/rl/*</span>
              <span className="text-gray-500">RL Analysis</span>
            </div>
            <div className="flex justify-between">
              <span className="font-mono text-green-600">/api/tenant/*</span>
              <span className="text-gray-500">Management</span>
            </div>
          </div>
        </div>

        <div className="analytics-card">
          <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">MCP Tools</span>
              <span className="font-semibold">269+</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">RL Accuracy</span>
              <span className="font-semibold text-green-600">96.7%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Categories</span>
              <span className="font-semibold">19+</span>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800">🎯 Core Features</h2>
          
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold text-lg">Multi-Tenant Architecture</h3>
              <p className="text-gray-600">Complete tenant isolation with API key authentication, usage tracking, and encrypted GHL credentials.</p>
            </div>
            
            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="font-semibold text-lg">RL-Powered Analysis</h3>
              <p className="text-gray-600">96.7% accuracy conversation analysis with personality detection, motivation analysis, and real-time guidance.</p>
            </div>
            
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-semibold text-lg">GHL Integration</h3>
              <p className="text-gray-600">269+ GHL tools across contacts, conversations, opportunities, calendars, and automation workflows.</p>
            </div>
            
            <div className="border-l-4 border-orange-500 pl-4">
              <h3 className="font-semibold text-lg">A/B Testing</h3>
              <p className="text-gray-600">Automated comparison of conversation approaches with statistical significance testing.</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800">🔬 Testing Interface</h2>
          
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold mb-4">Quick Test Options</h3>
            <div className="space-y-3">
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                Test Database Connection
              </button>
              <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors">
                Test RL Analysis
              </button>
              <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                Test MCP Tools
              </button>
              <button className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors">
                Create Test Tenant
              </button>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="font-semibold mb-2 text-blue-800">💡 Getting Started</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700">
              <li>Initialize the database schema</li>
              <li>Create your first tenant</li>
              <li>Test MCP endpoints with tenant API key</li>
              <li>Try RL conversation analysis</li>
              <li>Set up GHL integration</li>
            </ol>
          </div>
        </div>
      </div>

      {/* API Documentation Preview */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">📚 API Documentation</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h3 className="font-semibold text-lg mb-3">MCP Endpoints</h3>
            <div className="space-y-2 font-mono text-sm">
              <div className="bg-gray-50 p-2 rounded">
                <span className="text-blue-600">GET</span> /api/mcp/search_contacts
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <span className="text-green-600">POST</span> /api/mcp/create_contact
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <span className="text-blue-600">GET</span> /api/mcp/get_conversation_transcripts
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <span className="text-green-600">POST</span> /api/mcp/send_sms
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-3">RL Endpoints</h3>
            <div className="space-y-2 font-mono text-sm">
              <div className="bg-gray-50 p-2 rounded">
                <span className="text-purple-600">POST</span> /api/rl/analyze
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <span className="text-purple-600">POST</span> /api/rl/real-time
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <span className="text-purple-600">POST</span> /api/rl/compare
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <span className="text-blue-600">GET</span> /api/rl/health
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-yellow-800">
            <strong>🔑 Authentication:</strong> All API calls require a tenant API key in the 
            <code className="bg-yellow-100 px-1 rounded">X-Tenant-API-Key</code> header.
          </p>
        </div>
      </div>
    </div>
  )
}