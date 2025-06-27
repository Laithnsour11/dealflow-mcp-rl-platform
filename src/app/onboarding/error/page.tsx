'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function OnboardingErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const description = searchParams.get('description')

  const getErrorMessage = () => {
    switch (error) {
      case 'access_denied':
        return {
          title: 'Access Denied',
          message: 'You declined the authorization request. Please approve all permissions to use the MCP integration.',
          action: 'Try Again'
        }
      case 'invalid_state':
        return {
          title: 'Security Error',
          message: 'The authorization state was invalid. This might be due to an expired session. Please try again.',
          action: 'Start Over'
        }
      case 'missing_parameters':
        return {
          title: 'Invalid Request',
          message: 'Required parameters were missing from the authorization response.',
          action: 'Start Over'
        }
      case 'callback_failed':
        return {
          title: 'Connection Failed',
          message: 'Failed to complete the authorization process. Please check your GoHighLevel account and try again.',
          action: 'Try Again'
        }
      default:
        return {
          title: 'Authorization Error',
          message: description || 'An unexpected error occurred during the authorization process.',
          action: 'Try Again'
        }
    }
  }

  const errorInfo = getErrorMessage()

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Error Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
            <svg className="h-10 w-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          {/* Error Content */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {errorInfo.title}
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              {errorInfo.message}
            </p>

            {/* Error Details */}
            {error && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-500">
                  Error code: <span className="font-mono text-gray-700">{error}</span>
                </p>
              </div>
            )}

            {/* Common Issues */}
            <div className="text-left bg-blue-50 rounded-lg p-6 mb-8">
              <h2 className="text-lg font-medium text-gray-900 mb-3">
                Common Solutions:
              </h2>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-blue-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 1.414L10.586 9.5H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                  </svg>
                  <span>Make sure you're logged into the correct GoHighLevel account</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-blue-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 1.414L10.586 9.5H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                  </svg>
                  <span>Approve all requested permissions (all 22 scopes are required)</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-blue-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 1.414L10.586 9.5H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                  </svg>
                  <span>Clear your browser cookies and try again</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-blue-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 1.414L10.586 9.5H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                  </svg>
                  <span>Check if your GoHighLevel sub-account has API access enabled</span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4">
              <Link
                href="/onboarding"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {errorInfo.action}
              </Link>
              <Link
                href="/support"
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>

        {/* Alternative Option */}
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Having trouble with OAuth?{' '}
            <Link href="/onboarding/private-key" className="text-blue-600 hover:text-blue-700 font-medium">
              Use a Private Integration Key instead
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}