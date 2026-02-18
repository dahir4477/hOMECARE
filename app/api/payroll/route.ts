import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { generatePayrollSchema } from '@/lib/validation'
import { generatePayrollForPeriod } from '@/lib/payroll'
import { checkRole } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const user = await checkRole(['admin', 'manager'])
    
    const body = await request.json()
    const { period_start, period_end } = generatePayrollSchema.parse(body)
    
    const startDate = new Date(period_start)
    const endDate = new Date(period_end)

    // Generate payroll for all caregivers
    const payrollResults = await generatePayrollForPeriod(startDate, endDate)

    // Create audit log
    const supabase = await createServerSupabaseClient()
    await supabase.from('audit_logs').insert({
      organization_id: user.organization_id,
      user_id: user.id,
      action: 'GENERATE_PAYROLL',
      resource_type: 'payroll',
      resource_id: null,
      details: { 
        period_start, 
        period_end, 
        count: payrollResults.length 
      },
    })

    return NextResponse.json({ 
      success: true, 
      count: payrollResults.length,
      payroll: payrollResults 
    })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET() {
  try {
    const user = await checkRole(['admin', 'manager'])
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from('payroll')
      .select('*, caregiver:caregivers(*)')
      .eq('organization_id', user.organization_id)
      .order('period_start', { ascending: false })
      .limit(50)

    if (error) throw error

    return NextResponse.json({ payroll: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 })
  }
}
