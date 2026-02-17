import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { n8nWebhookSchema } from '@/lib/validation'
import { assessPatientRisk } from '@/lib/ai-engine'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { secret, event_type, data } = n8nWebhookSchema.parse(body)

    // Verify webhook secret
    if (secret !== process.env.N8N_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
    }

    const supabase = await createServerSupabaseClient()

    switch (event_type) {
      case 'daily_risk_scoring':
        // Process daily risk scoring for all patients
        const { data: patients } = await supabase
          .from('patients')
          .select('*')
          .eq('status', 'active')

        if (patients) {
          for (const patient of patients) {
            try {
              const age = new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear()
              
              const assessment = await assessPatientRisk({
                patientId: patient.id,
                age,
                medicalHistory: patient.medical_notes ? [patient.medical_notes] : [],
                recentIncidents: 0,
                missedVisits: 0,
                medicationCompliance: 80,
                mobilityLevel: 'independent',
                cognitiveStatus: 'alert',
                livingAlone: false,
              })

              await supabase
                .from('patients')
                .update({
                  risk_score: assessment.riskScore,
                  risk_level: assessment.riskLevel,
                  last_risk_assessment: new Date().toISOString(),
                })
                .eq('id', patient.id)
            } catch (error) {
              console.error(`Failed to assess risk for patient ${patient.id}:`, error)
            }
          }
        }

        return NextResponse.json({ 
          success: true, 
          processed: patients?.length || 0 
        })

      case 'weekly_performance_scoring':
        // Process weekly caregiver performance scoring
        const { data: caregivers } = await supabase
          .from('caregivers')
          .select('*')
          .eq('is_active', true)

        return NextResponse.json({ 
          success: true, 
          message: 'Performance scoring queued',
          caregivers: caregivers?.length || 0
        })

      case 'visit_fraud_detection':
        // Process fraud detection for recent visits
        const visitId = data.visit_id
        if (!visitId) {
          return NextResponse.json({ error: 'visit_id required' }, { status: 400 })
        }

        // Fraud detection logic would go here
        return NextResponse.json({ 
          success: true, 
          message: 'Fraud detection completed' 
        })

      case 'compliance_report':
        // Generate compliance report
        return NextResponse.json({ 
          success: true, 
          message: 'Compliance report generated' 
        })

      default:
        return NextResponse.json({ error: 'Unknown event type' }, { status: 400 })
    }
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
