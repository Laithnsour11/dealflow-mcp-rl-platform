// Core tenant types
export interface Tenant {
  id: string
  name: string
  apiKey: string
  ghlApiKey: string
  ghlLocationId: string
  plan: 'starter' | 'professional' | 'enterprise'
  status: 'active' | 'suspended' | 'trial'
  createdAt: Date
  updatedAt: Date
  usageQuota: number
  currentUsage: number
}

export interface TenantAuth {
  tenantId: string
  apiKey: string
  permissions: string[]
}

// GHL Integration types
export interface GHLConfig {
  accessToken: string
  baseUrl: string
  version: string
  locationId: string
}

export interface GHLContact {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  tags: string[]
  customFields: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface GHLConversation {
  id: string
  contactId: string
  type: 'sms' | 'email' | 'call' | 'chat'
  messages: GHLMessage[]
  createdAt: string
  updatedAt: string
}

export interface GHLMessage {
  id: string
  conversationId: string
  type: 'inbound' | 'outbound'
  body: string
  from: string
  to: string
  timestamp: string
  attachments?: string[]
}

export interface GHLOpportunity {
  id: string
  contactId: string
  pipelineId: string
  stageId: string
  title: string
  value: number
  status: string
  createdAt: string
  updatedAt: string
}

// RL System types
export interface ConversationState {
  turnNumber: number
  conversationHistory: ConversationTurn[]
  speaker: 'customer' | 'sales_rep'
  message: string
  conversionProbability: number
  confidence: number
  personalityType: 'Red' | 'Yellow' | 'Green' | 'Blue'
  motivationType: 'Foreclosure' | 'Divorce' | 'Inheritance' | 'Relocation' | 'Financial Distress' | 'Tired Landlord' | 'General'
  objectionCategory?: 'Trust' | 'Timeline' | 'Condition' | 'Price' | 'Process'
  rapportLevel: 'High' | 'Medium' | 'Low'
  engagementScore: number
  salesEffectiveness: number
  features: Record<string, any>
}

export interface ConversationTurn {
  speaker: 'customer' | 'sales_rep'
  message: string
  timestamp?: string
}

export interface ConversationAnalysis {
  conversationId: string
  tenantId: string
  turns: ConversationState[]
  finalProbability: number
  finalConfidence: number
  outcome: 'High Probability' | 'Medium Probability' | 'Low Probability'
  keyTurningPoints: number[]
  recommendations: string[]
  createdAt: Date
}

export interface RLAnalysisRequest {
  conversation: ConversationTurn[]
  sessionId?: string
  tenantId: string
  metadata?: Record<string, any>
}

export interface RLAnalysisResponse {
  conversationId: string
  currentProbability: number
  confidence: number
  status: 'High' | 'Medium' | 'Low'
  recommendations: string[]
  nextActions: string[]
  personalityIndicators: {
    red: number
    yellow: number
    green: number
    blue: number
  }
  motivationIndicators: {
    foreclosure: number
    divorce: number
    inheritance: number
    relocation: number
  }
  objectionIndicators: {
    trust: number
    price: number
    timeline: number
  }
}

// AI Agent Integration types
export interface AIAgentConfig {
  id: string
  tenantId: string
  name: string
  type: 'voice' | 'text' | 'chat'
  platform: 'vapi' | 'elevenlabs' | 'custom'
  specialization: 'appointment_setter' | 'lead_qualifier' | 'objection_handler' | 'closer'
  personalityTargets: ('Red' | 'Yellow' | 'Green' | 'Blue')[]
  motivationTargets: string[]
  settings: Record<string, any>
  active: boolean
}

export interface LeadRoutingRule {
  id: string
  tenantId: string
  name: string
  conditions: {
    personalityType?: string[]
    motivationType?: string[]
    conversionProbability?: { min: number; max: number }
    leadSource?: string[]
  }
  targetAgent: string
  priority: number
  active: boolean
}

// Webhook types
export interface WebhookEvent {
  id: string
  tenantId: string
  type: 'ghl.opportunity.stage_change' | 'ghl.contact.created' | 'vapi.call.completed' | 'rl.analysis.completed'
  payload: Record<string, any>
  timestamp: Date
  processed: boolean
}

export interface GHLWebhookPayload {
  type: string
  locationId: string
  objectId: string
  eventType: string
  data: Record<string, any>
}

// Usage tracking types
export interface UsageRecord {
  id: string
  tenantId: string
  endpoint: string
  method: string
  timestamp: Date
  responseTime: number
  status: number
  tokensCost?: number
  metadata?: Record<string, any>
}

export interface UsageStats {
  tenantId: string
  period: 'hour' | 'day' | 'week' | 'month'
  totalRequests: number
  totalCost: number
  averageResponseTime: number
  errorRate: number
  breakdown: {
    mcp: number
    rl: number
    webhooks: number
  }
}

// Analytics types
export interface AnalyticsMetric {
  id: string
  tenantId: string
  metric: string
  value: number
  timestamp: Date
  dimensions?: Record<string, string>
}

export interface ConversionOutcome {
  id: string
  tenantId: string
  conversationId: string
  contactId: string
  opportunityId?: string
  stage: 'discovery' | 'qualified' | 'offer_made' | 'contract_signed' | 'closed_won' | 'closed_lost'
  rlProbabilityAtStage: number
  actualOutcome: boolean
  revenue?: number
  timestamp: Date
}

// API Response types
export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  metadata?: {
    timestamp: string
    requestId: string
    tenantId?: string
  }
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Error types
export interface APIError extends Error {
  statusCode: number
  code: string
  tenantId?: string
  context?: Record<string, any>
}

// Dashboard types
export interface DashboardStats {
  totalConversations: number
  averageConversionProbability: number
  totalDealsWon: number
  totalRevenue: number
  rlAccuracy: number
  topPerformingAgents: Array<{
    agentId: string
    name: string
    conversions: number
    revenue: number
  }>
  recentActivity: Array<{
    type: string
    description: string
    timestamp: Date
  }>
}

export interface PersonalityBreakdown {
  red: { count: number; avgConversion: number }
  yellow: { count: number; avgConversion: number }
  green: { count: number; avgConversion: number }
  blue: { count: number; avgConversion: number }
}

// A/B Testing types
export interface ABTest {
  id: string
  tenantId: string
  name: string
  description: string
  variants: ABTestVariant[]
  status: 'draft' | 'running' | 'completed' | 'paused'
  startDate: Date
  endDate?: Date
  results?: ABTestResults
}

export interface ABTestVariant {
  id: string
  name: string
  description: string
  configuration: Record<string, any>
  trafficAllocation: number
  conversions: number
  totalInteractions: number
}

export interface ABTestResults {
  winner?: string
  confidence: number
  improvement: number
  significance: boolean
  detailedMetrics: Record<string, number>
}