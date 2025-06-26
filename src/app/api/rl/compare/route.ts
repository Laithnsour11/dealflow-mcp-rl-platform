/**
 * RL A/B Testing Comparison API Endpoint
 * Compares different conversation approaches for optimization
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
    const { approachA, approachB, testName, description } = body

    if (!approachA || !Array.isArray(approachA)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Approach A conversation array is required' 
        },
        { status: 400 }
      )
    }

    if (!approachB || !Array.isArray(approachB)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Approach B conversation array is required' 
        },
        { status: 400 }
      )
    }

    // Validate conversation formats
    const validateConversation = (conversation: any[]) => 
      conversation.every(turn => 
        typeof turn === 'object' &&
        typeof turn.speaker === 'string' &&
        typeof turn.message === 'string' &&
        ['customer', 'sales_rep'].includes(turn.speaker)
      )

    if (!validateConversation(approachA) || !validateConversation(approachB)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid conversation format. Each turn must have speaker and message.' 
        },
        { status: 400 }
      )
    }

    // Perform A/B comparison
    const comparison = await rlClient.compareApproaches(
      approachA as ConversationTurn[],
      approachB as ConversationTurn[],
      tenant.tenantId
    )

    const responseTime = Date.now() - startTime

    // Store A/B test result in database
    if (testName) {
      await storeABTestResult(
        tenant.tenantId,
        testName,
        description || '',
        comparison,
        { approachA, approachB }
      )
    }

    // Record usage
    await tenantAuth.recordUsage(
      tenant.tenantId,
      'rl/compare',
      'POST',
      responseTime,
      200,
      calculateRLTokensCost('compare', comparison),
      {
        approachALength: approachA.length,
        approachBLength: approachB.length,
        winner: comparison.comparison.winner,
        testName
      }
    )

    return NextResponse.json({
      success: true,
      data: {
        testName: testName || `comparison_${Date.now()}`,
        approachA: {
          probability: comparison.approachA.probability,
          confidence: comparison.approachA.confidence,
          recommendations: comparison.approachA.recommendations,
          performance: getPerformanceLabel(comparison.approachA.probability)
        },
        approachB: {
          probability: comparison.approachB.probability,
          confidence: comparison.approachB.confidence,
          recommendations: comparison.approachB.recommendations,
          performance: getPerformanceLabel(comparison.approachB.probability)
        },
        comparison: {
          winner: comparison.comparison.winner,
          probabilityDifference: comparison.comparison.probabilityDifference,
          improvementPercentage: comparison.comparison.improvementPercentage,
          recommendation: comparison.comparison.recommendation,
          significance: Math.abs(comparison.comparison.probabilityDifference) > 0.1 ? 'significant' : 'marginal',
          confidenceLevel: calculateConfidenceLevel(comparison)
        },
        insights: {
          bestApproach: comparison.comparison.winner !== 'Tie' ? 
            comparison.comparison.winner : 'No clear winner',
          keyDifference: analyzeKeyDifferences(comparison),
          nextSteps: generateNextSteps(comparison)
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
    console.error('RL comparison error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Comparison failed',
        metadata: {
          processingTime: `${responseTime}ms`,
          timestamp: new Date().toISOString()
        }
      },
      { status: 500 }
    )
  }
}

async function storeABTestResult(
  tenantId: string,
  testName: string,
  description: string,
  comparison: any,
  data: any
): Promise<void> {
  try {
    const { dbOperations } = await import('@/lib/db/neon-mcp-client')
    
    const query = `
      INSERT INTO ab_tests (
        tenant_id, name, description, variants, status, results, start_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (tenant_id, name) 
      DO UPDATE SET 
        results = $6,
        updated_at = NOW()
    `

    const variants = [
      {
        id: 'approach_a',
        name: 'Approach A',
        configuration: { conversation: data.approachA },
        probability: comparison.approachA.probability,
        confidence: comparison.approachA.confidence
      },
      {
        id: 'approach_b',
        name: 'Approach B',
        configuration: { conversation: data.approachB },
        probability: comparison.approachB.probability,
        confidence: comparison.approachB.confidence
      }
    ]

    const results = {
      winner: comparison.comparison.winner,
      probabilityDifference: comparison.comparison.probabilityDifference,
      improvementPercentage: comparison.comparison.improvementPercentage,
      completedAt: new Date().toISOString()
    }

    const params = [
      tenantId,
      testName,
      description,
      JSON.stringify(variants),
      'completed',
      JSON.stringify(results),
      new Date()
    ]

    await dbOperations.query(query, params)
  } catch (error) {
    console.error('Error storing A/B test result:', error)
  }
}

function calculateRLTokensCost(operation: string, result: any): number {
  const baseCost = 0.003 // Higher cost for comparison operations
  const complexityMultiplier = operation === 'compare' ? 2.5 : 1.0
  const dataMultiplier = JSON.stringify(result).length * 0.000002
  
  return (baseCost * complexityMultiplier) + dataMultiplier
}

function getPerformanceLabel(probability: number): string {
  if (probability > 0.7) return 'High'
  if (probability > 0.4) return 'Medium' 
  return 'Low'
}

function calculateConfidenceLevel(comparison: any): string {
  const avgConfidence = (comparison.approachA.confidence + comparison.approachB.confidence) / 2
  const probabilityGap = Math.abs(comparison.comparison.probabilityDifference)
  
  if (avgConfidence > 0.8 && probabilityGap > 0.15) return 'Very High'
  if (avgConfidence > 0.6 && probabilityGap > 0.1) return 'High'
  if (avgConfidence > 0.4 && probabilityGap > 0.05) return 'Medium'
  return 'Low'
}

function analyzeKeyDifferences(comparison: any): string {
  const probDiff = comparison.comparison.probabilityDifference
  const winner = comparison.comparison.winner
  
  if (Math.abs(probDiff) < 0.05) {
    return 'Both approaches perform similarly'
  }
  
  if (winner === 'A') {
    return `Approach A shows ${(probDiff * 100).toFixed(1)}% higher conversion probability`
  } else if (winner === 'B') {
    return `Approach B shows ${(Math.abs(probDiff) * 100).toFixed(1)}% higher conversion probability`
  }
  
  return 'No significant difference detected'
}

function generateNextSteps(comparison: any): string[] {
  const steps = []
  const winner = comparison.comparison.winner
  const improvement = comparison.comparison.improvementPercentage
  
  if (winner !== 'Tie' && improvement > 10) {
    steps.push(`Implement winning approach (${winner}) as the new standard`)
    steps.push('Monitor performance in production for validation')
  } else if (winner !== 'Tie' && improvement > 5) {
    steps.push(`Consider testing approach ${winner} with larger sample size`)
    steps.push('Analyze specific elements that contributed to better performance')
  } else {
    steps.push('Both approaches show similar performance')
    steps.push('Consider testing different conversation elements')
    steps.push('Look for other optimization opportunities')
  }
  
  return steps
}