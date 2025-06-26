/**
 * RL Real-time Analysis API Endpoint
 * Provides real-time conversation guidance for human agents
 */

import { NextRequest, NextResponse } from 'next/server'
import { tenantAuth } from '@/lib/auth/tenant-auth'
import { rlClient } from '@/lib/rl-integration/rl-client'
import { ConversationTurn } from '@/types'

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // Authenticate tenant
    const authResult = await tenantAuth.authenticateRequest(request)
    if (!authResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: authResult.error 
        },
        { status: authResult.statusCode || 401 }
      )
    }

    const { tenant } = authResult
    if (!tenant) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Tenant information not found' 
        },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { conversation, sessionId } = body

    if (!conversation || !Array.isArray(conversation)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Conversation array is required' 
        },
        { status: 400 }
      )
    }

    if (!sessionId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Session ID is required for real-time analysis' 
        },
        { status: 400 }
      )
    }

    // Validate conversation format
    const isValidConversation = conversation.every(turn => 
      typeof turn === 'object' &&
      typeof turn.speaker === 'string' &&
      typeof turn.message === 'string' &&
      ['customer', 'sales_rep'].includes(turn.speaker)
    )

    if (!isValidConversation) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid conversation format. Each turn must have speaker and message.' 
        },
        { status: 400 }
      )
    }

    // Perform real-time analysis
    const analysis = await rlClient.analyzeRealTime(
      conversation as ConversationTurn[],
      sessionId,
      tenant.tenantId
    )

    const responseTime = Date.now() - startTime

    // Record usage
    await tenantAuth.recordUsage(
      tenant.tenantId,
      'rl/real-time',
      'POST',
      responseTime,
      200,
      calculateRLTokensCost('real-time', analysis),
      {
        conversationLength: conversation.length,
        sessionId,
        currentProbability: analysis.currentProbability
      }
    )

    return NextResponse.json({
      success: true,
      data: {
        sessionId: analysis.conversationId,
        currentProbability: analysis.currentProbability,
        confidence: analysis.confidence,
        status: analysis.status,
        recommendations: analysis.recommendations,
        nextActions: analysis.nextActions,
        insights: {
          personalityIndicators: analysis.personalityIndicators,
          motivationIndicators: analysis.motivationIndicators,
          objectionIndicators: analysis.objectionIndicators,
          primaryPersonality: Object.entries(analysis.personalityIndicators)
            .reduce((a, b) => a[1] > b[1] ? a : b)[0],
          primaryMotivation: Object.entries(analysis.motivationIndicators)
            .reduce((a, b) => a[1] > b[1] ? a : b)[0],
          primaryObjection: Object.entries(analysis.objectionIndicators)
            .reduce((a, b) => a[1] > b[1] ? a : b)[0]
        },
        guidance: {
          probabilityTrend: analysis.currentProbability > 0.7 ? 'improving' : 
                          analysis.currentProbability > 0.4 ? 'stable' : 'declining',
          urgency: analysis.currentProbability < 0.3 ? 'high' : 
                  analysis.currentProbability < 0.6 ? 'medium' : 'low',
          focusArea: determineFocusArea(analysis)
        }
      },
      metadata: {
        processingTime: `${responseTime}ms`,
        tenantId: tenant.tenantId,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    const responseTime = Date.now() - startTime
    console.error('RL real-time analysis error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Real-time analysis failed',
        metadata: {
          processingTime: `${responseTime}ms`,
          timestamp: new Date().toISOString()
        }
      },
      { status: 500 }
    )
  }
}

function calculateRLTokensCost(operation: string, result: any): number {
  const baseCost = 0.001 // Lower cost for real-time operations
  const complexityMultiplier = operation === 'real-time' ? 1.5 : 1.0
  const dataMultiplier = JSON.stringify(result).length * 0.000001
  
  return (baseCost * complexityMultiplier) + dataMultiplier
}

function determineFocusArea(analysis: any): string {
  const { personalityIndicators, motivationIndicators, objectionIndicators } = analysis
  
  // Determine what the agent should focus on
  const maxObjection = Math.max(...Object.values(objectionIndicators))
  if (maxObjection > 0.5) {
    return 'objection_handling'
  }
  
  const maxPersonality = Math.max(...Object.values(personalityIndicators))
  if (maxPersonality > 0.3) {
    return 'personality_adaptation'
  }
  
  const maxMotivation = Math.max(...Object.values(motivationIndicators))
  if (maxMotivation > 0.3) {
    return 'motivation_alignment'
  }
  
  return 'rapport_building'
}