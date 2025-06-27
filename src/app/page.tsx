import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            GoHighLevel MCP Platform v2.0
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Enterprise-grade integration platform with all 269 GoHighLevel tools, 
            OAuth 2.0 authentication, and AI-powered conversation analysis
          </p>
          
          {/* CTA Buttons */}
          <div className="flex justify-center space-x-4 mb-12">
            <Link
              href="/onboarding"
              className="inline-flex items-center px-6 py-3 text-lg font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg transform transition hover:scale-105"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Get Started
            </Link>
            <Link
              href="/docs"
              className="inline-flex items-center px-6 py-3 text-lg font-medium rounded-lg text-gray-700 bg-white border-2 border-gray-300 hover:border-gray-400 shadow-lg"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Documentation
            </Link>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-3xl font-bold text-blue-600">269</div>
              <div className="text-gray-600">Total Tools</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-3xl font-bold text-green-600">96.7%</div>
              <div className="text-gray-600">RL Accuracy</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-3xl font-bold text-purple-600">19</div>
              <div className="text-gray-600">Categories</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-3xl font-bold text-indigo-600">v2.0</div>
              <div className="text-gray-600">Latest Version</div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-blue-100 text-blue-600 mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Complete API Coverage</h2>
            <p className="text-gray-600">
              Access all 269 GoHighLevel tools through a unified MCP interface. From contacts to invoices, everything is covered.
            </p>
            <Link href="/api-reference" className="inline-flex items-center mt-4 text-blue-600 hover:text-blue-700">
              View API Reference
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-green-100 text-green-600 mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">OAuth 2.0 Security</h2>
            <p className="text-gray-600">
              Enterprise-grade security with OAuth 2.0 for marketplace apps and encrypted credential storage.
            </p>
            <Link href="/docs#authentication" className="inline-flex items-center mt-4 text-green-600 hover:text-green-700">
              Learn About Security
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-purple-100 text-purple-600 mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">AI-Powered Insights</h2>
            <p className="text-gray-600">
              96.7% accurate conversation analysis with personality detection and lead qualification scoring.
            </p>
            <Link href="/docs#concepts" className="inline-flex items-center mt-4 text-purple-600 hover:text-purple-700">
              Explore RL Features
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Quick Start Section */}
        <div className="mt-16 bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-6">Quick Start Guide</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-semibold mb-3 text-blue-300">OAuth Authentication (Recommended)</h4>
              <ol className="space-y-2 text-gray-300">
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm mr-2">1</span>
                  Visit <Link href="/onboarding" className="text-blue-400 hover:text-blue-300">/onboarding</Link>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm mr-2">2</span>
                  Click "Connect GoHighLevel Account"
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm mr-2">3</span>
                  Authorize the required permissions
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm mr-2">4</span>
                  Save your API key (prefix: tk_)
                </li>
              </ol>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-3 text-green-300">Make Your First API Call</h4>
              <pre className="bg-gray-900 rounded-lg p-4 text-sm overflow-x-auto">
                <code>{`curl -X POST https://your-app.vercel.app/api/mcp/search_contacts \\
  -H "X-Tenant-API-Key: tk_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{"query": "john", "limit": 10}'`}</code>
              </pre>
            </div>
          </div>
        </div>

        {/* Resources Section */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Resources & Support</h3>
          <div className="grid md:grid-cols-4 gap-6">
            <Link href="/docs" className="group">
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all group-hover:scale-105">
                <h4 className="font-semibold text-gray-900 mb-2">Knowledge Base</h4>
                <p className="text-sm text-gray-600">Comprehensive guides and tutorials</p>
              </div>
            </Link>
            <Link href="/api-reference" className="group">
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all group-hover:scale-105">
                <h4 className="font-semibold text-gray-900 mb-2">API Reference</h4>
                <p className="text-sm text-gray-600">Detailed endpoint documentation</p>
              </div>
            </Link>
            <Link href="/docs/TROUBLESHOOTING.md" className="group">
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all group-hover:scale-105">
                <h4 className="font-semibold text-gray-900 mb-2">Troubleshooting</h4>
                <p className="text-sm text-gray-600">Common issues and solutions</p>
              </div>
            </Link>
            <a href="https://github.com/yourusername/ghl-mcp" className="group">
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all group-hover:scale-105">
                <h4 className="font-semibold text-gray-900 mb-2">GitHub</h4>
                <p className="text-sm text-gray-600">Source code and issues</p>
              </div>
            </a>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="mt-16 text-center">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to supercharge your GoHighLevel integration?
          </h3>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join hundreds of agencies and developers using our platform to build powerful automations.
          </p>
          <Link
            href="/onboarding"
            className="inline-flex items-center px-8 py-4 text-lg font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-xl transform transition hover:scale-105"
          >
            Start Your Free Integration
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </main>
  )
}