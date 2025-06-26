/**
 * RL System Integration Client
 * TypeScript client for the Sales RL Agent with multi-tenant support
 */

import { ConversationTurn, ConversationAnalysis, RLAnalysisRequest, RLAnalysisResponse } from '@/types'
import { tenantAuth } from '@/lib/auth/tenant-auth'

export interface RLConfig {
  apiUrl?: string
  internal?: boolean
  maxRetries?: number
  timeout?: number
}

export class RLClient {
  private config: RLConfig
  private apiUrl: string

  constructor(config: RLConfig = {}) {
    this.config = {
      apiUrl: config.apiUrl || process.env.RL_API_BASE_URL || 'http://localhost:5002',
      internal: config.internal || process.env.RL_API_INTERNAL === 'true',
      maxRetries: config.maxRetries || 3,
      timeout: config.timeout || 30000,
      ...config
    }
    
    this.apiUrl = this.config.apiUrl!
  }

  /**
   * Analyze a complete conversation with turn-by-turn tracking
   */
  async analyzeConversation(
    conversation: ConversationTurn[],
    tenantId: string,
    metadata?: Record<string, any>
  ): Promise<ConversationAnalysis> {
    try {
      const startTime = Date.now()
      
      // Anonymize tenant data for RL system
      const tenantHash = tenantAuth.createAnonymizedHash(tenantId, 'tenant')
      const conversationHash = tenantAuth.createAnonymizedHash(tenantId, JSON.stringify(conversation))

      const response = await this.makeRequest('/api/analyze', {
        conversation,
        tenantIdHash: tenantHash,
        conversationIdHash: conversationHash,
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString()
        }
      })

      const processingTime = Date.now() - startTime

      // Store analysis in database
      await this.storeAnalysis(tenantId, conversationHash, response, processingTime)

      return {
        conversationId: conversationHash,
        tenantId: tenantId,
        turns: response.turns || [],
        finalProbability: response.final_probability || 0,
        finalConfidence: response.final_confidence || 0,
        outcome: response.outcome || 'Unknown',
        keyTurningPoints: response.key_turning_points || [],
        recommendations: response.recommendations || [],
        createdAt: new Date()
      }
    } catch (error) {
      console.error('Error analyzing conversation:', error)
      throw error
    }
  }

  /**
   * Real-time conversation analysis and guidance
   */
  async analyzeRealTime(
    conversation: ConversationTurn[],
    sessionId: string,
    tenantId: string
  ): Promise<RLAnalysisResponse> {
    try {
      const tenantHash = tenantAuth.createAnonymizedHash(tenantId, 'tenant')
      
      const response = await this.makeRequest('/api/real-time', {
        conversation,
        session_id: sessionId,
        tenantIdHash: tenantHash
      })

      return {
        conversationId: sessionId,
        currentProbability: response.current_probability || 0,
        confidence: response.confidence || 0,
        status: response.status || 'Low',
        recommendations: response.recommendations || [],
        nextActions: response.next_actions || [],
        personalityIndicators: response.features?.personality_indicators || {
          red: 0, yellow: 0, green: 0, blue: 0
        },
        motivationIndicators: response.features?.motivation_indicators || {
          foreclosure: 0, divorce: 0, inheritance: 0, relocation: 0
        },
        objectionIndicators: response.features?.objection_indicators || {
          trust: 0, price: 0, timeline: 0
        }
      }
    } catch (error) {
      console.error('Error in real-time analysis:', error)
      throw error
    }
  }

  /**
   * Compare two conversation approaches (A/B testing)
   */
  async compareApproaches(
    approachA: ConversationTurn[],
    approachB: ConversationTurn[],
    tenantId: string
  ): Promise<{
    approachA: { probability: number; confidence: number; recommendations: string[] }
    approachB: { probability: number; confidence: number; recommendations: string[] }
    comparison: {
      winner: 'A' | 'B' | 'Tie'
      probabilityDifference: number
      improvementPercentage: number
      recommendation: string
    }
  }> {
    try {
      const tenantHash = tenantAuth.createAnonymizedHash(tenantId, 'tenant')
      
      const response = await this.makeRequest('/api/compare', {
        approach_a: approachA,
        approach_b: approachB,
        tenantIdHash: tenantHash
      })

      return {
        approachA: {
          probability: response.approach_a.probability || 0,
          confidence: response.approach_a.confidence || 0,
          recommendations: response.approach_a.recommendations || []
        },
        approachB: {
          probability: response.approach_b.probability || 0,
          confidence: response.approach_b.confidence || 0,
          recommendations: response.approach_b.recommendations || []
        },
        comparison: {
          winner: response.comparison.winner || 'Tie',
          probabilityDifference: response.comparison.probability_difference || 0,
          improvementPercentage: response.comparison.improvement_percentage || 0,
          recommendation: response.comparison.recommendation || 'No significant difference'
        }
      }
    } catch (error) {
      console.error('Error comparing approaches:', error)
      throw error
    }
  }

  /**
   * Analyze personality type from conversation
   */
  async analyzePersonality(
    conversation: ConversationTurn[],
    tenantId: string
  ): Promise<{
    primaryPersonality: 'Red' | 'Yellow' | 'Green' | 'Blue'
    personalityScores: Record<string, number>
    description: string
    communicationStrategies: string[]
    confidence: number
  }> {
    try {
      const tenantHash = tenantAuth.createAnonymizedHash(tenantId, 'tenant')
      
      const response = await this.makeRequest('/api/personality', {
        conversation,
        tenantIdHash: tenantHash
      })

      return {
        primaryPersonality: response.primary_personality || 'Blue',
        personalityScores: response.personality_scores || {},
        description: response.description || '',
        communicationStrategies: response.communication_strategies || [],
        confidence: response.confidence || 0
      }
    } catch (error) {
      console.error('Error analyzing personality:', error)
      throw error
    }
  }

  /**
   * Health check for RL system
   */
  async healthCheck(): Promise<{
    status: string
    modelLoaded: boolean
    version: string
    timestamp: string
  }> {
    try {
      const response = await this.makeRequest('/api/health', {}, 'GET')
      return response
    } catch (error) {
      console.error('RL health check failed:', error)
      return {
        status: 'unhealthy',
        modelLoaded: false,
        version: 'unknown',
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Make HTTP request to RL API
   */
  private async makeRequest(
    endpoint: string,
    data?: any,
    method: 'GET' | 'POST' = 'POST'
  ): Promise<any> {
    const url = `${this.apiUrl}${endpoint}`
    
    for (let attempt = 1; attempt <= this.config.maxRetries!; attempt++) {
      try {
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...(process.env.RL_API_KEY && { 'Authorization': `Bearer ${process.env.RL_API_KEY}` })
          },
          body: method === 'POST' ? JSON.stringify(data) : undefined,
          signal: AbortSignal.timeout(this.config.timeout!)
        })

        if (!response.ok) {
          throw new Error(`RL API error: ${response.status} ${response.statusText}`)
        }

        return await response.json()
      } catch (error) {
        console.error(`RL API request attempt ${attempt} failed:`, error)
        
        if (attempt === this.config.maxRetries) {
          throw error
        }
        
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
      }
    }
  }

  /**
   * Store RL analysis result in database
   */
  private async storeAnalysis(
    tenantId: string,
    conversationHash: string,
    analysisResult: any,
    processingTime: number
  ): Promise<void> {
    try {
      const { dbOperations } = await import('@/lib/db/neon-mcp-client')
      
      const tenantHash = tenantAuth.createAnonymizedHash(tenantId, 'tenant')
      
      const query = `
        INSERT INTO rl_analyses (
          tenant_id_hash, conversation_id_hash, conversation_data_hash,
          analysis_type, final_probability, final_confidence,
          personality_type, motivation_type, objection_category,
          outcome, key_turning_points, recommendations,
          processing_time, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      `

      const params = [
        tenantHash,
        conversationHash,
        conversationHash, // Using same hash for data
        'batch',
        analysisResult.final_probability || 0,
        analysisResult.final_confidence || 0,
        analysisResult.turns?.[analysisResult.turns.length - 1]?.personality_type,
        analysisResult.turns?.[analysisResult.turns.length - 1]?.motivation_type,
        analysisResult.turns?.[analysisResult.turns.length - 1]?.objection_category,
        analysisResult.outcome,
        analysisResult.key_turning_points || [],
        analysisResult.recommendations || [],
        processingTime,
        JSON.stringify({
          timestamp: new Date().toISOString(),
          version: '1.0.0'
        })
      ]

      await dbOperations.query(query, params)
    } catch (error) {
      console.error('Error storing RL analysis:', error)
      // Don't throw - storage failure shouldn't break analysis
    }
  }
}

// Create singleton instance
export const rlClient = new RLClient()

// Helper functions for common RL operations
export const rlOperations = {
  /**
   * Analyze conversation and get recommendations
   */
  async getConversationInsights(
    conversation: ConversationTurn[],
    tenantId: string
  ): Promise<{
    analysis: ConversationAnalysis
    personality: any
    recommendations: string[]
  }> {
    const [analysis, personality] = await Promise.all([
      rlClient.analyzeConversation(conversation, tenantId),
      rlClient.analyzePersonality(conversation, tenantId)
    ])

    const combinedRecommendations = [
      ...analysis.recommendations,
      ...personality.communicationStrategies.map(strategy => `💡 ${strategy}`)
    ]

    return {
      analysis,
      personality,
      recommendations: combinedRecommendations
    }
  },

  /**
   * Determine lead routing based on RL analysis
   */
  async determineLeadRouting(
    conversation: ConversationTurn[],
    tenantId: string
  ): Promise<{
    recommendedAgent: string
    reasoning: string
    confidence: number
    personalityType: string
    motivationType: string
  }> {
    const [realTimeAnalysis, personality] = await Promise.all([
      rlClient.analyzeRealTime(conversation, `routing_${Date.now()}`, tenantId),
      rlClient.analyzePersonality(conversation, tenantId)
    ])

    // Simple routing logic based on RL insights
    let recommendedAgent = 'general_agent'
    let reasoning = 'Default routing'

    if (realTimeAnalysis.currentProbability > 0.7) {
      recommendedAgent = 'closer_agent'
      reasoning = 'High conversion probability - route to closer'
    } else if (realTimeAnalysis.objectionIndicators.trust > 0.5) {
      recommendedAgent = 'trust_building_agent'
      reasoning = 'Trust objections detected - route to trust building specialist'
    } else if (personality.primaryPersonality === 'Red') {
      recommendedAgent = 'results_focused_agent'
      reasoning = 'Red personality type - route to results-focused agent'
    }

    return {
      recommendedAgent,
      reasoning,
      confidence: Math.min(realTimeAnalysis.confidence, personality.confidence),
      personalityType: personality.primaryPersonality,
      motivationType: Object.entries(realTimeAnalysis.motivationIndicators)
        .reduce((a, b) => a[1] > b[1] ? a : b)[0]
    }
  }
}