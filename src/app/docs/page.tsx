'use client'

import { useState } from 'react'
import Link from 'next/link'
// Simple SVG icon components
const ChevronRightIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
)

const BookOpenIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
)

const RocketLaunchIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
  </svg>
)

const CogIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const ShieldCheckIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
)

const CubeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
)

// Define the structure of our documentation
const docSections = [
  {
    id: 'overview',
    title: '🎯 What is This Platform?',
    icon: BookOpenIcon,
    content: {
      intro: 'The GoHighLevel MCP Platform is an enterprise-grade integration system that provides:',
      features: [
        'Complete access to all 269 GoHighLevel tools through a unified API',
        'AI-powered conversation analysis with 96.7% accuracy',
        'Multi-tenant architecture for agency/SaaS deployments',
        'OAuth 2.0 support for marketplace distribution'
      ],
      summary: 'Think of it as a "supercharged bridge" between GoHighLevel and your applications, with built-in AI intelligence.'
    }
  },
  {
    id: 'quickstart',
    title: '🏃‍♂️ Quick Start',
    icon: RocketLaunchIcon,
    subsections: [
      {
        title: 'For Agency Owners',
        steps: [
          'Visit /onboarding on your deployed platform',
          'Choose OAuth for marketplace app or Private key for internal use',
          'Access all 269 GHL tools immediately',
          'Monitor API calls and costs in dashboard'
        ]
      },
      {
        title: 'For Developers',
        steps: [
          'Clone the repository',
          'Configure environment variables in .env.local',
          'Deploy to Vercel with one click',
          'Start building with the comprehensive API'
        ]
      },
      {
        title: 'For End Users',
        steps: [
          'Connect account via OAuth or API key',
          'Access platform features',
          'View analytics and RL insights'
        ]
      }
    ]
  },
  {
    id: 'concepts',
    title: '🔑 Key Concepts',
    icon: CubeIcon,
    concepts: [
      {
        name: 'MCP (Model Context Protocol)',
        what: 'A standardized way to interact with GoHighLevel\'s API',
        why: 'Provides consistent interface across all 269 tools',
        how: 'Maps tool names to actual API endpoints'
      },
      {
        name: 'Multi-Tenancy',
        what: 'Multiple isolated accounts in one platform',
        why: 'Agencies can serve multiple clients securely',
        how: 'Each tenant has encrypted credentials and isolated data'
      },
      {
        name: 'RL (Reinforcement Learning) Integration',
        what: 'AI that analyzes sales conversations',
        why: 'Improves lead qualification by 96.7%',
        how: 'Detects personality types, motivations, and optimal responses'
      }
    ]
  },
  {
    id: 'capabilities',
    title: '🛠️ Platform Capabilities',
    icon: CogIcon,
    categories: [
      {
        name: 'Contact Management',
        tools: 31,
        features: ['Search, create, update contacts', 'Manage tags and custom fields', 'Add notes and tasks', 'Track contact timeline'],
        examples: ['Import leads from forms', 'Bulk tag contacts', 'Create follow-up tasks']
      },
      {
        name: 'Messaging & Communication',
        tools: 20,
        features: ['Send SMS, Email, WhatsApp', 'Manage conversations', 'Upload attachments', 'Schedule messages'],
        examples: ['Automated follow-ups', 'Bulk messaging campaigns', 'Multi-channel outreach']
      },
      {
        name: 'Invoicing & Billing',
        tools: 39,
        features: ['Create/send invoices', 'Manage payment schedules', 'Track payments', 'Generate estimates'],
        examples: ['Automated billing', 'Recurring invoices', 'Payment reminders']
      },
      {
        name: 'Social Media Management',
        tools: 17,
        features: ['Schedule posts', 'Manage multiple accounts', 'Track engagement', 'Bulk operations'],
        examples: ['Content calendar', 'Cross-platform posting', 'Performance analytics']
      },
      {
        name: 'User & Team Management',
        tools: 15,
        features: ['Create/manage users', 'Set permissions', 'Manage teams', 'Assign roles'],
        examples: ['Onboard team members', 'Control access levels', 'Team organization']
      }
    ]
  },
  {
    id: 'authentication',
    title: '🔐 Authentication Options',
    icon: ShieldCheckIcon,
    methods: [
      {
        name: 'OAuth 2.0 (Marketplace Apps)',
        bestFor: 'Apps you want to distribute',
        benefits: ['User-friendly authorization', 'Automatic token refresh', 'Marketplace compliance'],
        setup: ['Create app in GHL', 'Add OAuth credentials', 'Users click "Connect"', 'Done!']
      },
      {
        name: 'Private Integration Keys',
        bestFor: 'Internal tools',
        benefits: ['Quick setup', 'Direct access', 'No OAuth complexity'],
        setup: ['Generate key in GHL', 'Enter in platform', 'Start using immediately']
      }
    ]
  },
  {
    id: 'troubleshooting',
    title: '🚨 Common Issues',
    icon: ShieldCheckIcon,
    issues: [
      {
        problem: 'Invalid API Key',
        cause: 'Key expired or incorrect',
        solutions: ['Check for typos', 'Regenerate if needed', 'Ensure no extra spaces']
      },
      {
        problem: 'Rate Limit Exceeded',
        cause: 'Too many requests',
        solutions: ['Implement rate limiting', 'Use webhooks instead of polling', 'Upgrade plan if needed']
      },
      {
        problem: 'OAuth Error',
        cause: 'Misconfigured app',
        solutions: ['Verify redirect URI', 'Check all scopes selected', 'Clear cookies and retry']
      },
      {
        problem: 'Subdomain parameter required',
        cause: 'OAuth flow issue',
        solutions: ['Platform now handles this automatically', 'Use /onboarding page', 'OAuth creates tenant after authorization']
      }
    ]
  }
]

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredSections = docSections.filter(section => {
    const searchLower = searchQuery.toLowerCase()
    return section.title.toLowerCase().includes(searchLower) ||
           JSON.stringify(section).toLowerCase().includes(searchLower)
  })

  const currentSection = filteredSections.find(s => s.id === activeSection) || filteredSections[0]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <BookOpenIcon className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">
                GoHighLevel MCP Platform - Knowledge Base
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/onboarding"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Get Started
              </Link>
              <Link
                href="/api-reference"
                className="text-gray-600 hover:text-gray-900"
              >
                API Reference
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar Navigation */}
          <aside className="w-64 flex-shrink-0">
            <div className="sticky top-8">
              {/* Search */}
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Search documentation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Navigation */}
              <nav className="space-y-1">
                {filteredSections.map((section) => {
                  const Icon = section.icon
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        activeSection === section.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      {section.title}
                    </button>
                  )
                })}
              </nav>

              {/* Quick Links */}
              <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Links</h3>
                <div className="space-y-2">
                  <Link href="/onboarding" className="block text-sm text-blue-600 hover:text-blue-800">
                    → Start Onboarding
                  </Link>
                  <Link href="/playground" className="block text-sm text-blue-600 hover:text-blue-800">
                    → API Playground
                  </Link>
                  <Link href="/dashboard" className="block text-sm text-blue-600 hover:text-blue-800">
                    → Dashboard
                  </Link>
                  <a href="https://github.com/yourusername/ghl-mcp" className="block text-sm text-blue-600 hover:text-blue-800">
                    → GitHub Repo
                  </a>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <div className="bg-white rounded-lg shadow-md p-8">
              {/* Overview Section */}
              {currentSection.id === 'overview' && currentSection.content && (
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">{currentSection.title}</h2>
                  <p className="text-lg text-gray-700 mb-6">{currentSection.content.intro}</p>
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    {currentSection.content.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start">
                        <ChevronRightIcon className="h-5 w-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-gray-800">{currentSection.content.summary}</p>
                  </div>
                </div>
              )}

              {/* Quick Start Section */}
              {currentSection.id === 'quickstart' && currentSection.subsections && (
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">{currentSection.title}</h2>
                  <div className="space-y-8">
                    {currentSection.subsections.map((subsection, idx) => (
                      <div key={idx} className="border-l-4 border-blue-500 pl-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">{subsection.title}</h3>
                        <ol className="space-y-3">
                          {subsection.steps.map((step, stepIdx) => (
                            <li key={stepIdx} className="flex items-start">
                              <span className="flex-shrink-0 w-7 h-7 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                                {stepIdx + 1}
                              </span>
                              <span className="text-gray-700">{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Concepts Section */}
              {currentSection.id === 'concepts' && currentSection.concepts && (
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">{currentSection.title}</h2>
                  <div className="space-y-6">
                    {currentSection.concepts.map((concept, idx) => (
                      <div key={idx} className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">{concept.name}</h3>
                        <dl className="space-y-3">
                          <div>
                            <dt className="font-medium text-gray-700">What:</dt>
                            <dd className="text-gray-600 ml-4">{concept.what}</dd>
                          </div>
                          <div>
                            <dt className="font-medium text-gray-700">Why:</dt>
                            <dd className="text-gray-600 ml-4">{concept.why}</dd>
                          </div>
                          <div>
                            <dt className="font-medium text-gray-700">How:</dt>
                            <dd className="text-gray-600 ml-4">{concept.how}</dd>
                          </div>
                        </dl>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Capabilities Section */}
              {currentSection.id === 'capabilities' && currentSection.categories && (
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">{currentSection.title}</h2>
                  <div className="grid gap-6">
                    {currentSection.categories.map((category, idx) => (
                      <div key={idx} className="border rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl font-semibold text-gray-900">{category.name}</h3>
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                            {category.tools} tools
                          </span>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium text-gray-700 mb-2">What You Can Do:</h4>
                            <ul className="space-y-1">
                              {category.features.map((feature, fIdx) => (
                                <li key={fIdx} className="text-gray-600 text-sm flex items-start">
                                  <span className="text-blue-600 mr-2">•</span>
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-700 mb-2">Example Use Cases:</h4>
                            <ul className="space-y-1">
                              {category.examples.map((example, eIdx) => (
                                <li key={eIdx} className="text-gray-600 text-sm flex items-start">
                                  <span className="text-green-600 mr-2">→</span>
                                  {example}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Authentication Section */}
              {currentSection.id === 'authentication' && currentSection.methods && (
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">{currentSection.title}</h2>
                  <div className="space-y-6">
                    {currentSection.methods.map((method, idx) => (
                      <div key={idx} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{method.name}</h3>
                        <p className="text-gray-700 mb-4">
                          <span className="font-medium">Best For:</span> {method.bestFor}
                        </p>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium text-gray-700 mb-2">Benefits:</h4>
                            <ul className="space-y-1">
                              {method.benefits.map((benefit, bIdx) => (
                                <li key={bIdx} className="text-gray-600 text-sm">
                                  ✓ {benefit}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-700 mb-2">Setup Process:</h4>
                            <ol className="space-y-1">
                              {method.setup.map((step, sIdx) => (
                                <li key={sIdx} className="text-gray-600 text-sm">
                                  {sIdx + 1}. {step}
                                </li>
                              ))}
                            </ol>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Troubleshooting Section */}
              {currentSection.id === 'troubleshooting' && currentSection.issues && (
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">{currentSection.title}</h2>
                  <div className="space-y-4">
                    {currentSection.issues.map((issue, idx) => (
                      <div key={idx} className="border border-red-200 rounded-lg p-5 bg-red-50">
                        <h3 className="font-semibold text-red-900 mb-2">{issue.problem}</h3>
                        <p className="text-red-700 text-sm mb-3">
                          <span className="font-medium">Cause:</span> {issue.cause}
                        </p>
                        <div>
                          <p className="font-medium text-red-800 text-sm mb-2">Solutions:</p>
                          <ul className="space-y-1">
                            {issue.solutions.map((solution, sIdx) => (
                              <li key={sIdx} className="text-red-700 text-sm ml-4">
                                • {solution}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Call to Action */}
              <div className="mt-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
                <p className="text-lg mb-6">
                  Connect your GoHighLevel account and unlock the power of 269+ automation tools with AI intelligence.
                </p>
                <div className="flex space-x-4">
                  <Link
                    href="/onboarding"
                    className="inline-flex items-center px-6 py-3 border-2 border-white text-white font-medium rounded-lg hover:bg-white hover:text-blue-600 transition-colors"
                  >
                    Start Onboarding →
                  </Link>
                  <Link
                    href="/docs/TROUBLESHOOTING.md"
                    className="inline-flex items-center px-6 py-3 text-white font-medium hover:text-blue-100"
                  >
                    View Full Documentation
                  </Link>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-semibold text-white mb-3">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/docs" className="hover:text-white">Documentation</Link></li>
                <li><Link href="/api-reference" className="hover:text-white">API Reference</Link></li>
                <li><Link href="/playground" className="hover:text-white">Playground</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="https://github.com" className="hover:text-white">GitHub</a></li>
                <li><a href="/docs/TROUBLESHOOTING.md" className="hover:text-white">Troubleshooting</a></li>
                <li><a href="/docs/V2-RELEASE-NOTES.md" className="hover:text-white">Release Notes</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="mailto:support@your-domain.com" className="hover:text-white">Email Support</a></li>
                <li><a href="https://discord.gg/ghl" className="hover:text-white">Discord Community</a></li>
                <li><a href="https://status.your-domain.com" className="hover:text-white">System Status</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/privacy" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="/terms" className="hover:text-white">Terms of Service</a></li>
                <li><a href="/security" className="hover:text-white">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2025 GoHighLevel MCP Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}