'use client'

import { useState, useEffect } from 'react'

export default function DocsPage() {
  const [activeDoc, setActiveDoc] = useState<'api' | 'context'>('api')
  const [apiDoc, setApiDoc] = useState('')
  const [contextDoc, setContextDoc] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/docs/api').then(r => r.text()),
      fetch('/api/docs/context').then(r => r.text())
    ]).then(([api, context]) => {
      setApiDoc(api)
      setContextDoc(context)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading documentation...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">GoHighLevel MCP Documentation</h1>
        
        <div className="mb-6">
          <nav className="flex space-x-4">
            <button
              onClick={() => setActiveDoc('api')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                activeDoc === 'api'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              API Documentation
            </button>
            <button
              onClick={() => setActiveDoc('context')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                activeDoc === 'context'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              LLM Context Guide
            </button>
          </nav>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 overflow-auto">
          <pre className="whitespace-pre-wrap font-mono text-sm">
            {activeDoc === 'api' ? apiDoc : contextDoc}
          </pre>
        </div>
      </div>
    </div>
  )
}