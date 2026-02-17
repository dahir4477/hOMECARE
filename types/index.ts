export interface Organization {
  id: string
  name: string
  subscription_tier: 'free' | 'basic' | 'professional' | 'enterprise'
  subscription_status: 'active' | 'cancelled' | 'past_due' | 'trialing'
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  trial_ends_at: string | null
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  organization_id: string
  email: string
  full_name: string
  role: 'admin' | 'manager' | 'caregiver' | 'staff'
  phone: string | null
  avatar_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  organization?: Organization
}

export interface Patient {
  id: string
  organization_id: string
  first_name: string
  last_name: string
  date_of_birth: string
  gender: 'male' | 'female' | 'other' | null
  address: string | null
  city: string | null
  state: string | null
  zip_code: string | null
  phone: string | null
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
  medical_notes: string | null
  risk_score: number
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  last_risk_assessment: string | null
  status: 'active' | 'inactive' | 'discharged'
  created_at: string
  updated_at: string
}

export interface Caregiver {
  id: string
  organization_id: string
  user_id: string | null
  first_name: string
  last_name: string
  email: string | null
  phone: string
  certification_number: string | null
  certification_expiry: string | null
  hourly_rate: number | null
  performance_score: number
  total_visits: number
  missed_visits: number
  on_time_percentage: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Visit {
  id: string
  organization_id: string
  patient_id: string
  caregiver_id: string
  scheduled_start: string
  scheduled_end: string
  actual_start: string | null
  actual_end: string | null
  status: 'scheduled' | 'in_progress' | 'completed' | 'missed' | 'cancelled'
  visit_type: 'routine' | 'emergency' | 'assessment' | 'medication' | null
  notes: string | null
  fraud_flag: boolean
  fraud_reason: string | null
  created_at: string
  updated_at: string
  patient?: Patient
  caregiver?: Caregiver
}

export interface Incident {
  id: string
  organization_id: string
  patient_id: string | null
  caregiver_id: string | null
  visit_id: string | null
  incident_type: 'fall' | 'medication_error' | 'behavioral' | 'injury' | 'other'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  action_taken: string | null
  reported_by: string | null
  reported_at: string
  resolved: boolean
  resolved_at: string | null
  created_at: string
  patient?: Patient
  caregiver?: Caregiver
}

export interface Payroll {
  id: string
  organization_id: string
  caregiver_id: string
  period_start: string
  period_end: string
  total_hours: number
  hourly_rate: number
  gross_pay: number
  deductions: number
  net_pay: number
  status: 'draft' | 'approved' | 'paid'
  paid_at: string | null
  created_at: string
  updated_at: string
  caregiver?: Caregiver
}

export interface AuditLog {
  id: string
  organization_id: string
  user_id: string | null
  action: string
  resource_type: string
  resource_id: string | null
  details: Record<string, any> | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
  user?: User
}

export interface ComplianceDocument {
  id: string
  organization_id: string
  caregiver_id: string | null
  document_type: 'certification' | 'background_check' | 'training' | 'insurance' | 'other'
  document_name: string
  file_url: string | null
  expiry_date: string | null
  status: 'valid' | 'expiring_soon' | 'expired'
  created_at: string
  updated_at: string
  caregiver?: Caregiver
}

export interface KPIData {
  activePatients: number
  caregiversOnShift: number
  highRiskPatients: number
  monthlyRevenue: number
  revenueChange: number
  visitCompletionRate: number
  averageRiskScore: number
}

export interface DashboardAlert {
  id: string
  type: 'missed_visit' | 'certification_expiry' | 'fraud' | 'incident'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  message: string
  timestamp: string
  patientName?: string
  caregiverName?: string
}
