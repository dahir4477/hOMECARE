import { z } from 'zod'

// Patient schemas
export const createPatientSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  gender: z.enum(['male', 'female', 'other']).optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip_code: z.string().optional(),
  phone: z.string().optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
  medical_notes: z.string().optional(),
})

// Caregiver schemas
export const createCaregiverSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email').optional(),
  phone: z.string().min(1, 'Phone is required'),
  certification_number: z.string().optional(),
  certification_expiry: z.string().optional(),
  hourly_rate: z.number().positive('Hourly rate must be positive').optional(),
})

// Visit schemas
export const createVisitSchema = z.object({
  patient_id: z.string().uuid('Invalid patient ID'),
  caregiver_id: z.string().uuid('Invalid caregiver ID'),
  scheduled_start: z.string().datetime('Invalid datetime'),
  scheduled_end: z.string().datetime('Invalid datetime'),
  visit_type: z.enum(['routine', 'emergency', 'assessment', 'medication']).optional(),
  notes: z.string().optional(),
})

export const updateVisitSchema = z.object({
  actual_start: z.string().datetime().optional(),
  actual_end: z.string().datetime().optional(),
  status: z.enum(['scheduled', 'in_progress', 'completed', 'missed', 'cancelled']).optional(),
  notes: z.string().optional(),
})

// Incident schemas
export const createIncidentSchema = z.object({
  patient_id: z.string().uuid().optional(),
  caregiver_id: z.string().uuid().optional(),
  visit_id: z.string().uuid().optional(),
  incident_type: z.enum(['fall', 'medication_error', 'behavioral', 'injury', 'other']),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  description: z.string().min(1, 'Description is required'),
  action_taken: z.string().optional(),
})

// Webhook schemas
export const n8nWebhookSchema = z.object({
  secret: z.string().min(1, 'Secret is required'),
  event_type: z.string().min(1, 'Event type is required'),
  data: z.record(z.any()),
})

// Risk assessment schemas
export const riskAssessmentSchema = z.object({
  patient_id: z.string().uuid('Invalid patient ID'),
})

// Payroll schemas
export const generatePayrollSchema = z.object({
  period_start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  period_end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
})
