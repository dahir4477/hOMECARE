import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createPatientSchema } from '@/lib/validation'
import { requireAuth } from '@/lib/auth'

export async function GET() {
  try {
    const user = await requireAuth()
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('organization_id', user.organization_id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ patients: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    
    // Validate input
    const validatedData = createPatientSchema.parse(body)
    
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from('patients')
      .insert({
        ...validatedData,
        organization_id: user.organization_id,
        status: 'active',
        risk_level: 'low',
      })
      .select()
      .single()

    if (error) throw error

    // Create audit log
    await supabase.from('audit_logs').insert({
      organization_id: user.organization_id,
      user_id: user.id,
      action: 'CREATE_PATIENT',
      resource_type: 'patient',
      resource_id: data.id,
      details: { patient_name: `${data.first_name} ${data.last_name}` },
    })

    return NextResponse.json({ patient: data }, { status: 201 })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
