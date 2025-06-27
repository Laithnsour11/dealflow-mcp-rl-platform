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
              <div classNa