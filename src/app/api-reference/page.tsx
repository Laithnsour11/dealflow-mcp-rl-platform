'use client'

import { useState } from 'react'
import Link from 'next/link'
import { DocumentDuplicateIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

// API Reference data
const apiCategories = [
  {
    name: 'Contact Management',
    description: 'Manage contacts, tags, notes, and tasks',
    endpoints: [
      {
        tool: 'search_contacts',
        method: 'POST',
        description: 'Search for contacts',
        params: {
          query: 'string',
          limit: 'number',
          offset: 'number'
        },
        example: {
          query: 'john',
          limit: 10
        }
      },
      {
        tool: 'get_contact',
        method: 'POST',
        description: 'Get contact by ID',
        params: {
          contactId: 'string'
        },
        example: {
          contactId: 'contact_123'
        }
      },
      {
        tool: 'create_contact',
        method: 'POST',
        description: 'Create new contact',
        params: {
          firstName: 'string',
          lastName: 'string',
          email: 'string',
          phone: 'string'
        },
        example: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '+1234567890'
        }
      }
    ]
  },
  {
    name: 'Messaging',
    description: 'Send messages across multiple channels',
    endpoints: [
      {
        tool: 'send_sms',
        method: 'POST',
        description: 'Send SMS message',
        params: {
          contactId: 'string',
          message: 'string',
          templateId: 'string (optional)'
        },
        example: {
          contactId: 'contact_123',
          message: 'Hello from GoHighLevel!'
        }
      },
      {
        tool: 'send_email',
        method: 'POST',
        description: 'Send email',
        params: {
          contactId: 'string',
          subject: 'string',
          body: 'string',
          attachments: 'array (optional)'
        },
        example: {
          contactId: 'contact_123',
          subject: 'Welcome!',
          body: '<p>Welcome to our platform</p>'
        }
      }
    ]
  },
  {
    name: 'Invoices & Billing',
    description: 'Create and manage invoices',
    endpoints: [
      {
        tool: 'create_invoice',
        method: 'POST',
        description: 'Create new invoice',
        params: {
          contactId: 'string',
          items: 'array',
          dueDate: 'string',
          terms: 'string (optional)'
        },
        example: {
          contactId: 'contact_123',
          items: [{
            name: 'Service',
            price: 100.00,
            quantity: 1
          }],
          dueDate: '2025-01-31'
        }
      }
    ]
  },
  {
    name: 'RL Analysis',
    description: 'AI-powered conversation analysis',
    endpoints: [
      {
        tool: 'analyze_conversation',
        method: 'POST',
        baseUrl: '/api/rl/analyze',
        description: 'Analyze conversation with RL',
        params: {
          conversation: 'array',
          metadata: 'object (optional)'
        },
        example: {
          conversation: [
            { speaker: 'customer', message: 'I need to sell quickly' },
            { speaker: 'agent', message: 'I can help with that' }
          ]
        }
      }
    ]
  }
]

export default function ApiReferencePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(apiCategories[0].name)
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null)

  const filteredCategories = apiCategories.filter(category => 
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.endpoints.some(ep => ep.tool.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const selectedCategoryData = filteredCategories.find(c => c.name === selectedCategory) || filteredCategories[0]

  const copyToClipboard = (text: string, endpoint: string) => {
    navigator.clipboard.writeText(text)
    setCopiedEndpoint(endpoint)
    setTimeout(() => setCopiedEndpoint(null), 2000)
  }

  const formatExample = (endpoint: any) => {
    const baseUrl = endpoint.baseUrl || '/api/mcp/' + endpoint.tool
    return `curl -X POST ${process.env.NEXT_PUBLIC_APP_URL || 'https://your-app.vercel.app'}${baseUrl} \\
  -H "X-Tenant-API-Key: your-api-key" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(endpoint.example, null, 2)}'`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">API Reference</h1>
            <div className="flex items-center space-x-4">
              <Link
                href="/docs"
                className="text-gray-600 hover:text-gray-900"
              >
                Knowledge Base
              </Link>
              <Link
                href="/onboarding"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-64 flex-shrink-0">
            <div className="sticky top-24">
              {/* Search */}
              <div className="mb-6">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search endpoints..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Categories */}
              <nav className="space-y-1">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Categories
                </h3>
                {filteredCategories.map((category) => (
                  <button
                    key={category.name}
                    onClick={() => setSelectedCategory(category.name)}
                    className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      selectedCategory === category.name
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <div>
                      <div>{category.name}</div>
                      <div className="text-xs text-gray-500">
                        {category.endpoints.length} endpoints
                      </div>
                    </div>
                  </button>
                ))}
              </nav>

              {/* Stats */}
              <div className="mt-8 p-4 bg-gray-100 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">API Stats</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Tools</span>
                    <span className="font-medium">269</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Categories</span>
                    <span className="font-medium">19</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Version</span>
                    <span className="font-medium">v2.0</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {selectedCategoryData && (
              <div>
                {/* Category Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedCategoryData.name}
                  </h2>
                  <p className="text-gray-600">{selectedCategoryData.description}</p>
                </div>

                {/* Endpoints */}
                <div className="space-y-6">
                  {selectedCategoryData.endpoints.map((endpoint) => (
                    <div key={endpoint.tool} className="bg-white rounded-lg shadow-sm overflow-hidden">
                      {/* Endpoint Header */}
                      <div className="px-6 py-4 bg-gray-50 border-b">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded">
                              {endpoint.method}
                            </span>
                            <code className="text-sm font-mono text-gray-800">
                              {endpoint.baseUrl || '/api/mcp/' + endpoint.tool}
                            </code>
                          </div>
                          <button
                            onClick={() => copyToClipboard(formatExample(endpoint), endpoint.tool)}
                            className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900"
                          >
                            <DocumentDuplicateIcon className="h-4 w-4" />
                            <span>{copiedEndpoint === endpoint.tool ? 'Copied!' : 'Copy'}</span>
                          </button>
                        </div>
                        <p className="mt-2 text-sm text-gray-600">{endpoint.description}</p>
                      </div>

                      {/* Parameters */}
                      <div className="px-6 py-4">
                        <h4 className="text-sm font-semibold text-gray-900 mb-3">Parameters</h4>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="text-left text-gray-600">
                                <th className="pb-2">Name</th>
                                <th className="pb-2">Type</th>
                                <th className="pb-2">Description</th>
                              </tr>
                            </thead>
                            <tbody className="font-mono">
                              {Object.entries(endpoint.params).map(([key, type]) => (
                                <tr key={key} className="border-t border-gray-200">
                                  <td className="py-2 text-gray-900">{key}</td>
                                  <td className="py-2 text-gray-600">{type as string}</td>
                                  <td className="py-2 text-gray-600 font-sans">
                                    {key.includes('optional') ? 'Optional' : 'Required'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Example */}
                      <div className="px-6 py-4 bg-gray-900 text-gray-100">
                        <h4 className="text-sm font-semibold mb-3">Example Request</h4>
                        <pre className="text-xs overflow-x-auto">
                          <code>{formatExample(endpoint)}</code>
                        </pre>
                      </div>

                      {/* Example Response */}
                      <div className="px-6 py-4 border-t">
                        <h4 className="text-sm font-semibold text-gray-900 mb-3">Example Response</h4>
                        <pre className="bg-gray-50 rounded-lg p-4 text-xs overflow-x-auto">
                          <code>{JSON.stringify({
                            success: true,
                            data: endpoint.tool === 'search_contacts' 
                              ? [{ id: 'contact_123', firstName: 'John', lastName: 'Doe' }]
                              : { id: 'result_123', status: 'success' }
                          }, null, 2)}</code>
                        </pre>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Authentication Section */}
            <div className="mt-12 bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Authentication</h3>
              <p className="text-gray-700 mb-4">
                All API requests require authentication using the X-Tenant-API-Key header:
              </p>
              <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 text-sm overflow-x-auto">
                <code>X-Tenant-API-Key: tk_your_api_key_here</code>
              </pre>
              <p className="mt-4 text-sm text-gray-600">
                Get your API key by connecting your GoHighLevel account at{' '}
                <Link href="/onboarding" className="text-blue-600 hover:text-blue-800">
                  /onboarding
                </Link>
              </p>
            </div>

            {/* Rate Limits */}
            <div className="mt-6 bg-yellow-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Rate Limits</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Default: 100 requests per minute</li>
                <li>• Enterprise: 1000 requests per minute</li>
                <li>• Webhooks recommended for real-time updates</li>
              </ul>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}