import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { assessCaregiverPerformance } from '@/lib/ai-engine'
import { requireAuth, checkRole } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const user = await checkRole(['admin', 'manager'])
    
    const body = await request.json()
    const { caregiver_id } = body
    
    if (!caregiver_id) {
      return NextResponse.json({ error: 'caregiver_id is required' }, { status: 400 })
    }
    
    const supabase = await createServerSupabaseClient()

    // Get caregiver data
    const { data: caregiver, error: caregiverError } = await supabase
      .from('caregivers')
      .select('*')
      .eq('id', caregiver_id)
      .eq('organization_id', user.organization_id)
      .single()

    if (caregiverError || !caregiver) {
      return NextResponse.json({ error: 'Caregiver not found' }, { status: 404 })
    }

    // Get visit statistics
    const { data: visits } = await supabase
      .from('visits')
      .select('*')
      .eq('caregiver_id', caregiver_id)
      .gte('scheduled_start', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())

    const totalVisits = visits?.length || 0
    const completedVisits = visits?.filter(v => v.status === 'completed').length || 0
    const missedVisits = visits?.filter(v => v.status === 'missed').length || 0
    const lateVisits = 0 // Would need actual late tracking

    // Calculate average visit duration
    const completedWithTimes = visits?.filter(v => v.actual_start && v.actual_end) || []
    const durations = completedWithTimes.map(v => {
      const start = new Date(v.actual_start!)
      const end = new Date(v.actual_end!)
      return (end.getTime() - start.getTime()) / 1000 / 60
    })
    const averageVisitDuration = durations.length > 0 
      ? durations.reduce((a, b) => a + b, 0) / durations.length 
      : 0

    // Get incidents
    const { data: incidents } = await supabase
      .from('incidents')
      .select('*')
      .eq('caregiver_id', caregiver_id)
      .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())

    // Perform performance assessment
    const assessment = await assessCaregiverPerformance({
      caregiverId: caregiver_id,
      totalVisits,
      completedVisits,
      missedVisits,
      lateVisits,
      averageVisitDuration,
      patientSatisfactionScores: [4.5, 4.8, 4.3], // Mock data - would come from actual surveys
      incidentsReported: incidents?.length || 0,
      complianceIssues: 0, // Would come from actual compliance tracking
    })

    // Update caregiver record
    const { error: updateError } = await supabase
      .from('caregivers')
      .update({
        performance_score: assessment.performanceScore,
        total_visits: totalVisits,
        missed_visits: missedVisits,
        on_time_percentage: totalVisits > 0 ? ((totalVisits - lateVisits) / totalVisits) * 100 : 100,
      })
      .eq('id', caregiver_id)

    if (updateError) throw updateError

    // Create audit log
    await supabase.from('audit_logs').insert({
      organization_id: user.organization_id,
      user_id: user.id,
      action: 'PERFORMANCE_ASSESSMENT',
      resource_type: 'caregiver',
      resource_id: caregiver_id,
      details: { performance_score: assessment.performanceScore, grade: assessment.grade },
    })

    return NextResponse.json({ assessment })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
