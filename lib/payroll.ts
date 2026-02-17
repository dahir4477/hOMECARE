import { createServerSupabaseClient } from './supabase/server'

export interface PayrollCalculation {
  caregiverId: string
  periodStart: Date
  periodEnd: Date
  totalHours: number
  hourlyRate: number
  grossPay: number
  deductions: number
  netPay: number
  visits: {
    visitId: string
    date: Date
    hours: number
  }[]
}

export async function calculatePayroll(
  caregiverId: string,
  periodStart: Date,
  periodEnd: Date
): Promise<PayrollCalculation> {
  const supabase = await createServerSupabaseClient()

  // Get caregiver hourly rate
  const { data: caregiver } = await supabase
    .from('caregivers')
    .select('hourly_rate')
    .eq('id', caregiverId)
    .single()

  if (!caregiver || !caregiver.hourly_rate) {
    throw new Error('Caregiver not found or hourly rate not set')
  }

  // Get all completed visits in the period
  const { data: visits } = await supabase
    .from('visits')
    .select('id, actual_start, actual_end, scheduled_start')
    .eq('caregiver_id', caregiverId)
    .eq('status', 'completed')
    .gte('scheduled_start', periodStart.toISOString())
    .lte('scheduled_start', periodEnd.toISOString())
    .not('actual_start', 'is', null)
    .not('actual_end', 'is', null)

  if (!visits) {
    throw new Error('Failed to fetch visits')
  }

  // Calculate hours for each visit
  const visitHours = visits.map((visit) => {
    const start = new Date(visit.actual_start!)
    const end = new Date(visit.actual_end!)
    const hours = (end.getTime() - start.getTime()) / 1000 / 60 / 60

    return {
      visitId: visit.id,
      date: new Date(visit.scheduled_start),
      hours: Math.round(hours * 100) / 100, // Round to 2 decimals
    }
  })

  const totalHours = visitHours.reduce((sum, v) => sum + v.hours, 0)
  const grossPay = totalHours * caregiver.hourly_rate

  // Calculate deductions (simplified - in production, use actual tax rules)
  const federalTax = grossPay * 0.12 // 12% federal
  const stateTax = grossPay * 0.05 // 5% state (example)
  const fica = grossPay * 0.0765 // 7.65% FICA
  const deductions = federalTax + stateTax + fica

  const netPay = grossPay - deductions

  return {
    caregiverId,
    periodStart,
    periodEnd,
    totalHours: Math.round(totalHours * 100) / 100,
    hourlyRate: caregiver.hourly_rate,
    grossPay: Math.round(grossPay * 100) / 100,
    deductions: Math.round(deductions * 100) / 100,
    netPay: Math.round(netPay * 100) / 100,
    visits: visitHours,
  }
}

export async function generatePayrollForPeriod(periodStart: Date, periodEnd: Date) {
  const supabase = await createServerSupabaseClient()

  // Get user's organization
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: userProfile } = await supabase
    .from('users')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  if (!userProfile) throw new Error('User profile not found')

  // Get all active caregivers
  const { data: caregivers } = await supabase
    .from('caregivers')
    .select('id')
    .eq('organization_id', userProfile.organization_id)
    .eq('is_active', true)

  if (!caregivers) return []

  const payrollResults = []

  for (const caregiver of caregivers) {
    try {
      const calculation = await calculatePayroll(caregiver.id, periodStart, periodEnd)
      
      // Only create payroll entry if there are hours worked
      if (calculation.totalHours > 0) {
        const { data, error } = await supabase.from('payroll').insert({
          organization_id: userProfile.organization_id,
          caregiver_id: caregiver.id,
          period_start: periodStart.toISOString(),
          period_end: periodEnd.toISOString(),
          total_hours: calculation.totalHours,
          hourly_rate: calculation.hourlyRate,
          gross_pay: calculation.grossPay,
          deductions: calculation.deductions,
          net_pay: calculation.netPay,
          status: 'draft',
        }).select().single()

        if (!error && data) {
          payrollResults.push(data)
        }
      }
    } catch (error) {
      console.error(`Failed to calculate payroll for caregiver ${caregiver.id}:`, error)
    }
  }

  return payrollResults
}
