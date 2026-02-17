-- AI Homecare Management System Database Schema
-- Multi-tenant architecture with RLS

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- ORGANIZATIONS (Multi-tenant)
-- =====================================================
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  subscription_tier TEXT NOT NULL CHECK (subscription_tier IN ('free', 'basic', 'professional', 'enterprise')),
  subscription_status TEXT NOT NULL CHECK (subscription_status IN ('active', 'cancelled', 'past_due', 'trialing')) DEFAULT 'trialing',
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  trial_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- USERS
-- =====================================================
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'caregiver', 'staff')),
  phone TEXT,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PATIENTS
-- =====================================================
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  phone TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  medical_notes TEXT,
  risk_score INTEGER DEFAULT 0 CHECK (risk_score BETWEEN 0 AND 100),
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high', 'critical')) DEFAULT 'low',
  last_risk_assessment TIMESTAMPTZ,
  status TEXT CHECK (status IN ('active', 'inactive', 'discharged')) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- CAREGIVERS
-- =====================================================
CREATE TABLE caregivers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  certification_number TEXT,
  certification_expiry DATE,
  hourly_rate DECIMAL(10,2),
  performance_score INTEGER DEFAULT 100 CHECK (performance_score BETWEEN 0 AND 100),
  total_visits INTEGER DEFAULT 0,
  missed_visits INTEGER DEFAULT 0,
  on_time_percentage DECIMAL(5,2) DEFAULT 100.00,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- VISITS
-- =====================================================
CREATE TABLE visits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  caregiver_id UUID NOT NULL REFERENCES caregivers(id) ON DELETE CASCADE,
  scheduled_start TIMESTAMPTZ NOT NULL,
  scheduled_end TIMESTAMPTZ NOT NULL,
  actual_start TIMESTAMPTZ,
  actual_end TIMESTAMPTZ,
  status TEXT CHECK (status IN ('scheduled', 'in_progress', 'completed', 'missed', 'cancelled')) DEFAULT 'scheduled',
  visit_type TEXT CHECK (visit_type IN ('routine', 'emergency', 'assessment', 'medication')),
  notes TEXT,
  fraud_flag BOOLEAN DEFAULT FALSE,
  fraud_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INCIDENTS
-- =====================================================
CREATE TABLE incidents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
  caregiver_id UUID REFERENCES caregivers(id) ON DELETE SET NULL,
  visit_id UUID REFERENCES visits(id) ON DELETE SET NULL,
  incident_type TEXT NOT NULL CHECK (incident_type IN ('fall', 'medication_error', 'behavioral', 'injury', 'other')),
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  description TEXT NOT NULL,
  action_taken TEXT,
  reported_by UUID REFERENCES users(id),
  reported_at TIMESTAMPTZ DEFAULT NOW(),
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PAYROLL
-- =====================================================
CREATE TABLE payroll (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  caregiver_id UUID NOT NULL REFERENCES caregivers(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_hours DECIMAL(10,2) NOT NULL,
  hourly_rate DECIMAL(10,2) NOT NULL,
  gross_pay DECIMAL(10,2) NOT NULL,
  deductions DECIMAL(10,2) DEFAULT 0,
  net_pay DECIMAL(10,2) NOT NULL,
  status TEXT CHECK (status IN ('draft', 'approved', 'paid')) DEFAULT 'draft',
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- AUDIT LOGS
-- =====================================================
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- COMPLIANCE DOCUMENTS
-- =====================================================
CREATE TABLE compliance_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  caregiver_id UUID REFERENCES caregivers(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('certification', 'background_check', 'training', 'insurance', 'other')),
  document_name TEXT NOT NULL,
  file_url TEXT,
  expiry_date DATE,
  status TEXT CHECK (status IN ('valid', 'expiring_soon', 'expired')) DEFAULT 'valid',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX idx_users_org ON users(organization_id);
CREATE INDEX idx_patients_org ON patients(organization_id);
CREATE INDEX idx_patients_risk ON patients(risk_level, organization_id);
CREATE INDEX idx_caregivers_org ON caregivers(organization_id);
CREATE INDEX idx_visits_org ON visits(organization_id);
CREATE INDEX idx_visits_patient ON visits(patient_id);
CREATE INDEX idx_visits_caregiver ON visits(caregiver_id);
CREATE INDEX idx_visits_status ON visits(status, organization_id);
CREATE INDEX idx_visits_scheduled ON visits(scheduled_start, organization_id);
CREATE INDEX idx_incidents_org ON incidents(organization_id);
CREATE INDEX idx_payroll_org ON payroll(organization_id);
CREATE INDEX idx_payroll_caregiver ON payroll(caregiver_id);
CREATE INDEX idx_audit_logs_org ON audit_logs(organization_id);
CREATE INDEX idx_compliance_org ON compliance_documents(organization_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE caregivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_documents ENABLE ROW LEVEL SECURITY;

-- Helper function to get user's organization
CREATE OR REPLACE FUNCTION auth.user_organization_id()
RETURNS UUID AS $$
  SELECT organization_id FROM users WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;

-- Organizations: Users can only see their own organization
CREATE POLICY "Users can view own organization"
  ON organizations FOR SELECT
  USING (id = auth.user_organization_id());

-- Users: Can only see users in their organization
CREATE POLICY "Users can view org users"
  ON users FOR SELECT
  USING (organization_id = auth.user_organization_id());

-- Patients: Organization-scoped
CREATE POLICY "Users can view org patients"
  ON patients FOR SELECT
  USING (organization_id = auth.user_organization_id());

CREATE POLICY "Users can insert org patients"
  ON patients FOR INSERT
  WITH CHECK (organization_id = auth.user_organization_id());

CREATE POLICY "Users can update org patients"
  ON patients FOR UPDATE
  USING (organization_id = auth.user_organization_id());

-- Caregivers: Organization-scoped
CREATE POLICY "Users can view org caregivers"
  ON caregivers FOR SELECT
  USING (organization_id = auth.user_organization_id());

CREATE POLICY "Users can manage org caregivers"
  ON caregivers FOR ALL
  USING (organization_id = auth.user_organization_id());

-- Visits: Organization-scoped
CREATE POLICY "Users can view org visits"
  ON visits FOR SELECT
  USING (organization_id = auth.user_organization_id());

CREATE POLICY "Users can manage org visits"
  ON visits FOR ALL
  USING (organization_id = auth.user_organization_id());

-- Incidents: Organization-scoped
CREATE POLICY "Users can view org incidents"
  ON incidents FOR SELECT
  USING (organization_id = auth.user_organization_id());

CREATE POLICY "Users can create org incidents"
  ON incidents FOR INSERT
  WITH CHECK (organization_id = auth.user_organization_id());

-- Payroll: Organization-scoped, restricted to admins
CREATE POLICY "Admins can view org payroll"
  ON payroll FOR SELECT
  USING (
    organization_id = auth.user_organization_id()
    AND EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'manager')
    )
  );

-- Audit Logs: Organization-scoped, read-only
CREATE POLICY "Users can view org audit logs"
  ON audit_logs FOR SELECT
  USING (organization_id = auth.user_organization_id());

-- Compliance: Organization-scoped
CREATE POLICY "Users can view org compliance"
  ON compliance_documents FOR SELECT
  USING (organization_id = auth.user_organization_id());

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_caregivers_updated_at BEFORE UPDATE ON caregivers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_visits_updated_at BEFORE UPDATE ON visits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
