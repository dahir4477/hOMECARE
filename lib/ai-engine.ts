import OpenAI from 'openai'

// Initialize OpenAI only if API key is provided
const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null

export interface RiskAssessmentInput {
  patientId: string
  age: number
  medicalHistory: string[]
  recentIncidents: number
  missedVisits: number
  medicationCompliance: number // 0-100
  mobilityLevel: string // 'independent', 'assisted', 'dependent'
  cognitiveStatus: string // 'alert', 'confused', 'impaired'
  livingAlone: boolean
}

export interface RiskAssessmentResult {
  riskScore: number // 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  factors: string[]
  recommendations: string[]
}

export async function assessPatientRisk(input: RiskAssessmentInput): Promise<RiskAssessmentResult> {
  // If OpenAI is not configured, use rule-based assessment
  if (!openai) {
    return calculateRuleBasedRisk(input)
  }

  try {
    const prompt = `You are a healthcare risk assessment AI. Analyze the following patient data and provide a risk score (0-100) with factors and recommendations.

Patient Data:
- Age: ${input.age}
- Medical History: ${input.medicalHistory.join(', ')}
- Recent Incidents: ${input.recentIncidents}
- Missed Visits: ${input.missedVisits}
- Medication Compliance: ${input.medicationCompliance}%
- Mobility Level: ${input.mobilityLevel}
- Cognitive Status: ${input.cognitiveStatus}
- Living Alone: ${input.livingAlone}

Respond in JSON format:
{
  "riskScore": number (0-100),
  "riskLevel": "low" | "medium" | "high" | "critical",
  "factors": ["factor1", "factor2", ...],
  "recommendations": ["recommendation1", "recommendation2", ...]
}`

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are a healthcare risk assessment expert. Provide accurate, evidence-based risk assessments.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    })

    const result = JSON.parse(response.choices[0].message.content || '{}')
    return result as RiskAssessmentResult
  } catch (error) {
    console.error('Risk assessment error:', error)
    
    // Fallback to rule-based assessment
    return calculateRuleBasedRisk(input)
  }
}

function calculateRuleBasedRisk(input: RiskAssessmentInput): RiskAssessmentResult {
  let score = 0
  const factors: string[] = []
  const recommendations: string[] = []

  // Age factor
  if (input.age > 75) {
    score += 15
    factors.push('Advanced age (>75)')
  } else if (input.age > 65) {
    score += 10
  }

  // Recent incidents
  if (input.recentIncidents > 2) {
    score += 20
    factors.push('Multiple recent incidents')
    recommendations.push('Increase visit frequency')
  } else if (input.recentIncidents > 0) {
    score += 10
  }

  // Missed visits
  if (input.missedVisits > 3) {
    score += 15
    factors.push('Frequent missed visits')
    recommendations.push('Contact patient and emergency contact')
  } else if (input.missedVisits > 0) {
    score += 8
  }

  // Medication compliance
  if (input.medicationCompliance < 60) {
    score += 20
    factors.push('Poor medication compliance')
    recommendations.push('Implement medication management system')
  } else if (input.medicationCompliance < 80) {
    score += 10
  }

  // Mobility
  if (input.mobilityLevel === 'dependent') {
    score += 15
    factors.push('Dependent mobility')
  } else if (input.mobilityLevel === 'assisted') {
    score += 8
  }

  // Cognitive status
  if (input.cognitiveStatus === 'impaired') {
    score += 20
    factors.push('Cognitive impairment')
    recommendations.push('Consider memory care services')
  } else if (input.cognitiveStatus === 'confused') {
    score += 12
  }

  // Living alone
  if (input.livingAlone) {
    score += 10
    factors.push('Living alone')
    recommendations.push('Daily check-in calls recommended')
  }

  // Determine risk level
  let riskLevel: 'low' | 'medium' | 'high' | 'critical'
  if (score >= 70) {
    riskLevel = 'critical'
  } else if (score >= 50) {
    riskLevel = 'high'
  } else if (score >= 30) {
    riskLevel = 'medium'
  } else {
    riskLevel = 'low'
  }

  if (recommendations.length === 0) {
    recommendations.push('Continue standard care protocol')
  }

  return {
    riskScore: Math.min(score, 100),
    riskLevel,
    factors,
    recommendations,
  }
}

export interface CaregiverPerformanceInput {
  caregiverId: string
  totalVisits: number
  completedVisits: number
  missedVisits: number
  lateVisits: number
  averageVisitDuration: number // minutes
  patientSatisfactionScores: number[] // 1-5 scale
  incidentsReported: number
  complianceIssues: number
}

export interface CaregiverPerformanceResult {
  performanceScore: number // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  strengths: string[]
  areasForImprovement: string[]
}

export async function assessCaregiverPerformance(
  input: CaregiverPerformanceInput
): Promise<CaregiverPerformanceResult> {
  let score = 100
  const strengths: string[] = []
  const areasForImprovement: string[] = []

  // Visit completion rate
  const completionRate = (input.completedVisits / input.totalVisits) * 100
  if (completionRate >= 95) {
    strengths.push('Excellent visit completion rate')
  } else if (completionRate < 85) {
    score -= 15
    areasForImprovement.push('Improve visit completion rate')
  } else {
    score -= 5
  }

  // Missed visits penalty
  const missedRate = (input.missedVisits / input.totalVisits) * 100
  if (missedRate > 5) {
    score -= 20
    areasForImprovement.push('Reduce missed visits')
  }

  // Late visits
  const lateRate = (input.lateVisits / input.totalVisits) * 100
  if (lateRate < 5) {
    strengths.push('Excellent punctuality')
  } else if (lateRate > 15) {
    score -= 15
    areasForImprovement.push('Improve punctuality')
  } else {
    score -= 5
  }

  // Patient satisfaction
  if (input.patientSatisfactionScores.length > 0) {
    const avgSatisfaction =
      input.patientSatisfactionScores.reduce((a, b) => a + b, 0) /
      input.patientSatisfactionScores.length
    if (avgSatisfaction >= 4.5) {
      strengths.push('High patient satisfaction')
    } else if (avgSatisfaction < 3.5) {
      score -= 20
      areasForImprovement.push('Improve patient satisfaction')
    } else if (avgSatisfaction < 4.0) {
      score -= 10
    }
  }

  // Incidents and compliance
  if (input.incidentsReported > 3) {
    score -= 15
    areasForImprovement.push('Focus on safety protocols')
  }

  if (input.complianceIssues > 0) {
    score -= 10 * input.complianceIssues
    areasForImprovement.push('Address compliance issues')
  }

  // Visit duration consistency
  if (input.averageVisitDuration < 30) {
    score -= 10
    areasForImprovement.push('Ensure adequate visit duration')
  }

  // Determine grade
  let grade: 'A' | 'B' | 'C' | 'D' | 'F'
  if (score >= 90) {
    grade = 'A'
  } else if (score >= 80) {
    grade = 'B'
  } else if (score >= 70) {
    grade = 'C'
  } else if (score >= 60) {
    grade = 'D'
  } else {
    grade = 'F'
  }

  if (strengths.length === 0) {
    strengths.push('Meets basic requirements')
  }

  return {
    performanceScore: Math.max(0, Math.min(100, score)),
    grade,
    strengths,
    areasForImprovement,
  }
}
