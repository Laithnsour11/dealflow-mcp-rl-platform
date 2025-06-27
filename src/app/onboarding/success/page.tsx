'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function OnboardingSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [installation, setInstallation] = useState<any>(null)
  const [testing, setTesting] = useState(false)
  const [testResults, setTestResults] = useState<any[]>([])

  const installationId = searchParams.get('installation')

  useEffect(() => {
    if (installationId) {
      // Fetch installation details
      fetchInstallationDetails(installationId)
    }
  }, [installationId])

  const fetchInstallationDetails = async (id: string) => {
    try {
      // TODO: Fetch from API
      setInstallation({
        id,
        locationId: 'loc_xxxxx',
        scopes: 22,
        status: 'active'
      })
    } catch (error) {
      console.error('Failed to fetch installation:', error)
    }
  }

  const runConnectionTest = async () => {
    setTesting(true)
    setTestResults([])

    const tests = [
      { name: 'OAuth Token Validation', endpoint: '/api/mcp/get_location' },
      { name: 'Contact Management', endpoint: '/api/mcp/search_contacts' },
      { name: 'Conversation Access', endpoint: '/api/mcp/search_conversations' },
      { name: 'Opportunity Pipeline', endpoint: '/api/mcp/get_pipelines' },
      { name: 'Calendar Integration', endpoint: '/api/mcp/get_calendars' }
    ]

    for (const test of tests) {
      try {
        const response = await fetch(test.endpoint, {
          headers: {
            'X-Tenant-API-Key': localStorage.getItem('tenant_api_key') || ''
          }
        })
        
        setTestResults(prev => [...prev, {
          name: test.name,
          success: response.ok,
          message: response.ok ? 'Connected successfully' : 'Connection failed'
        }])
      } catch (error) {
        setTestResults(prev => [...prev, {
          name: test.name,
          success: false,
          message: 'Connection error'
        }])
      }
    }

    setTesting(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Message */}
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Successfully Connected!
          </h1>
          <p className="text-xl text-gray-600">
            Your GoHighLevel account has been connected and all 269 MCP tools are now available.
          </p>
        </div>

        {/* Installation Details */}
        {installation && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Installation Details
            </h2>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Installation ID</dt>
                <dd className="mt-1 text-sm text-gray-900 font-mono">{installation.id}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Location ID</dt>
                <dd className="mt-1 text-sm text-gray-900 font-mono">{installation.locationId}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Authorized Scopes</dt>
                <dd className="mt-1 text-sm text-gray-900">{installation.scopes} permissions</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {installation.status}
                  </span>
                </dd>
              </div>
            </dl>
          </div>
        )}

        {/* Connection Test */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Test Your Connection
            </h2>
            <button
              onClick={runConnectionTest}
              disabled={testing}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {testing ? 'Testing...' : 'Run Test'}
            </button>
          </div>

          {testResults.length > 0 && (
            <div className="space-y-2">
              {testResults.map((result, index) => (
                <div key={index} className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-700">{result.name}</span>
                  <div className="flex items-center">
                    <span className={`text-sm ${result.success ? 'text-green-600' : 'text-red-600'} mr-2`}>
                      {result.message}
                    </span>
                    {result.success ? (
                      <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            What's Next?
          </h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-900">Read the Documentation</h3>
                <p className="mt-1 text-sm text-gray-600">
                  Learn about all 269 MCP tools and how to use them effectively.
                </p>
                <Link href="/docs" className="mt-1 text-sm text-blue-600 hover:text-blue-700">
                  View documentation →
                </Link>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-900">Get Your API Endpoint</h3>
                <p className="mt-1 text-sm text-gray-600">
                  Use this endpoint to access all MCP tools:
                </p>
                <code className="mt-1 block text-sm bg-gray-100 rounded px-2 py-1 font-mono">
                  {process.env.NEXT_PUBLIC_APP_URL}/api/mcp/[tool_name]
                </code>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-900">Try Example Requests</h3>
                <p className="mt-1 text-sm text-gray-600">
                  Test the API with our interactive playground.
                </p>
                <Link href="/playground" className="mt-1 text-sm text-blue-600 hover:text-blue-700">
                  Open playground →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/docs"
            className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            View Documentation
          </Link>
        </div>
      </div>
    </div>
  )
}