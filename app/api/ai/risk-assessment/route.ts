import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { riskAssessmentSchema } from '@/lib/validation'
import { assessPatientRisk } from '@/lib/ai-engine'
import { requireAuth, checkRole } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Only admins and managers can trigger risk assessments
    const user = await checkRole(['admin', 'manager'])
    
    const body = await request.json()
    const { patient_id } = riskAssessmentSchema.parse(body)
    
    const supabase = await createServerSupabaseClient()

    // Get patient data
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('*')
      .eq('id', patient_id)
      .eq('organization_id', user.organization_id)
      .single()

    if (patientError || !patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }

    // Get recent incidents
    const { data: incidents } = await supabase
      .from('incidents')
      .select('*')
      .eq('patient_id', patient_id)
      .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())

    // Get missed visits
    const { data: missedVisits } = await supabase
      .from('visits')
      .select('*')
      .eq('patient_id', patient_id)
      .eq('status', 'missed')
      .gte('scheduled_start', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())

    // Calculate age
    const age = new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear()

    // Perform AI risk assessment
    const assessment = await assessPatientRisk({
      patientId: patient_id,
      age,
      medicalHistory: patient.medical_notes ? [patient.medical_notes] : [],
      recentIncidents: incidents?.length || 0,
      missedVisits: missedVisits?.length || 0,
      medicationCompliance: 80, // This would come from actual data
      mobilityLevel: 'independent', // This would come from actual data
      cognitiveStatus: 'alert', // This would come from actual data
      livingAlone: false, // This would come from actual data
    })

    // Update patient record
    const { error: updateError } = await supabase
      .from('patients')
      .update({
        risk_score: assessment.riskScore,
        risk_level: assessment.riskLevel,
        last_risk_assessment: new Date().toISOString(),
      })
      .eq('id', patient_id)

    if (updateError) throw updateError

    // Create audit log
    await supabase.from('audit_logs').insert({
      organization_id: user.organization_id,
      user_id: user.id,
      action: 'RISK_ASSESSMENT',
      resource_type: 'patient',
      resource_id: patient_id,
      details: { risk_score: assessment.riskScore, risk_level: assessment.riskLevel },
    })

    return NextResponse.json({ assessment })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
