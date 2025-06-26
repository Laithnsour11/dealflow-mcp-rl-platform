/**
 * RL Analysis API Endpoint
 * Handles conversation analysis requests with tenant authentication
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
    const { conversation, metadata } = body

    if (!conversation || !Array.isArray(conversation)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Conversation array is required' 
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

    // Analyze conversation using RL system
    const analysis = await rlClient.analyzeConversation(
      conversation as ConversationTurn[],
      tenant.tenantId,
      metadata
    )

    const responseTime = Date.now() - startTime

    // Record usage
    await tenantAuth.recordUsage(
      tenant.tenantId,
      'rl/analyze',
      'POST',
      responseTime,
      200,
      calculateRLTokensCost('analyze', analysis),
      {
        conversationLength: conversation.length,
        finalProbability: analysis.finalProbability
      }
    )

    return NextResponse.json({
      success: true,
      data: {
        conversationId: analysis.conversationId,
        finalProbability: analysis.finalProbability,
        finalConfidence: analysis.finalConfidence,
        outcome: analysis.outcome,
        keyTurningPoints: analysis.keyTurningPoints,
        recommendations: analysis.recommendations,
        turns: analysis.turns.map(turn => ({
          turnNumber: turn.turnNumber,
          speaker: turn.speaker,
          message: turn.message,
          conversionProbability: turn.conversionProbability,
          confidence: turn.confidence,
          personalityType: turn.personalityType,
          motivationType: turn.motivationType,
          objectionCategory: turn.objectionCategory,
          rapportLevel: turn.rapportLevel,
          engagementScore: turn.engagementScore,
          salesEffectiveness: turn.salesEffectiveness
        }))
      },
      metadata: {
        processingTime: `${responseTime}ms`,
        tenantId: tenant.tenantId,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    const responseTime = Date.now() - startTime
    console.error('RL analysis error:', error)

    // Record error usage
    if (request.headers.get('X-Tenant-API-Key')) {
      try {
        const apiKey = request.headers.get('X-Tenant-API-Key')!
        const tenant = await tenantAuth.authenticateTenant(apiKey)
        if (tenant) {
          await tenantAuth.recordUsage(
            tenant.tenantId,
            'rl/analyze',
            'POST',
            responseTime,
            500,
            0,
            { error: error instanceof Error ? error.message : 'Unknown error' }
          )
        }
      } catch (recordError) {
        console.error('Error recording usage:', recordError)
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Analysis failed',
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
  const baseCost = 0.002 // Base cost for RL operations
  const complexityMultiplier = operation === 'analyze' ? 2.0 : 1.0
  const dataMultiplier = JSON.stringify(result).length * 0.000002
  
  return (baseCost * complexityMultiplier) + dataMultiplier
}