import { createServerSupabaseClient } from './supabase/server'

export interface FraudDetectionInput {
  visitId: string
  scheduledStart: Date
  scheduledEnd: Date
  actualStart: Date | null
  actualEnd: Date | null
  caregiverId: string
  patientId: string
  patientLocation: { lat: number; lng: number }
  checkInLocation?: { lat: number; lng: number }
}

export interface FraudDetectionResult {
  isSuspicious: boolean
  confidence: number // 0-100
  reasons: string[]
}

export async function detectVisitFraud(input: FraudDetectionInput): Promise<FraudDetectionResult> {
  const reasons: string[] = []
  let suspicionScore = 0

  // Check if visit was marked complete without actual times
  if (!input.actualStart || !input.actualEnd) {
    suspicionScore += 30
    reasons.push('Visit marked complete without recorded times')
  }

  // Check for unrealistic visit duration
  if (input.actualStart && input.actualEnd) {
    const duration = (input.actualEnd.getTime() - input.actualStart.getTime()) / 1000 / 60 // minutes
    
    if (duration < 15) {
      suspicionScore += 40
      reasons.push('Visit duration suspiciously short (<15 minutes)')
    }
    
    if (duration > 480) {
      // 8 hours
      suspicionScore += 30
      reasons.push('Visit duration suspiciously long (>8 hours)')
    }
  }

  // Check location mismatch
  if (input.checkInLocation && input.patientLocation) {
    const distance = calculateDistance(input.checkInLocation, input.patientLocation)
    
    if (distance > 0.5) {
      // More than 0.5 miles away
      suspicionScore += 50
      reasons.push(`Check-in location ${distance.toFixed(2)} miles from patient address`)
    }
  }

  // Check for pattern anomalies (requires historical data)
  const supabase = await createServerSupabaseClient()
  
  // Check caregiver's recent visit pattern
  const { data: recentVisits } = await supabase
    .from('visits')
    .select('actual_start, actual_end, scheduled_start, scheduled_end')
    .eq('caregiver_id', input.caregiverId)
    .eq('status', 'completed')
    .order('scheduled_start', { ascending: false })
    .limit(10)

  if (recentVisits && recentVisits.length > 0) {
    const durations = recentVisits
      .filter((v) => v.actual_start && v.actual_end)
      .map((v) => {
        const start = new Date(v.actual_start!)
        const end = new Date(v.actual_end!)
        return (end.getTime() - start.getTime()) / 1000 / 60
      })

    if (durations.length > 0) {
      const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length
      const currentDuration = input.actualStart && input.actualEnd
        ? (input.actualEnd.getTime() - input.actualStart.getTime()) / 1000 / 60
        : 0

      // If current visit is significantly shorter than average
      if (currentDuration > 0 && currentDuration < avgDuration * 0.5) {
        suspicionScore += 20
        reasons.push('Visit duration significantly shorter than caregiver average')
      }
    }
  }

  // Check for overlapping visits
  if (input.actualStart && input.actualEnd) {
    const { data: overlappingVisits } = await supabase
      .from('visits')
      .select('id, patient_id')
      .eq('caregiver_id', input.caregiverId)
      .neq('id', input.visitId)
      .gte('actual_start', input.actualStart.toISOString())
      .lte('actual_end', input.actualEnd.toISOString())

    if (overlappingVisits && overlappingVisits.length > 0) {
      suspicionScore += 60
      reasons.push('Overlapping visits detected for same caregiver')
    }
  }

  return {
    isSuspicious: suspicionScore >= 40,
    confidence: Math.min(100, suspicionScore),
    reasons,
  }
}

function calculateDistance(
  point1: { lat: number; lng: number },
  point2: { lat: number; lng: number }
): number {
  const R = 3959 // Earth's radius in miles
  const dLat = toRad(point2.lat - point1.lat)
  const dLon = toRad(point2.lng - point1.lng)
  const lat1 = toRad(point1.lat)
  const lat2 = toRad(point2.lat)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(value: number): number {
  return (value * Math.PI) / 180
}
