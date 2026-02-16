# 🔌 API Documentation

Complete API reference for AI Homecare Management System.

---

## Base URL

```
http://localhost:3006/api  (Development)
https://yourdomain.com/api  (Production)
```

---

## Authentication

All API routes (except webhooks) require authentication via Supabase session cookies.

**Headers Required:**
```http
Cookie: sb-access-token=<token>; sb-refresh-token=<token>
```

---

## 👥 Patients API

### List Patients

```http
GET /api/patients
```

**Authorization**: Required (All roles)

**Response 200 OK:**
```json
{
  "patients": [
    {
      "id": "uuid",
      "organization_id": "uuid",
      "first_name": "John",
      "last_name": "Doe",
      "date_of_birth": "1950-01-15",
      "gender": "male",
      "address": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zip_code": "10001",
      "phone": "555-0100",
      "emergency_contact_name": "Jane Doe",
      "emergency_contact_phone": "555-0101",
      "medical_notes": "Diabetes, hypertension",
      "risk_score": 45,
      "risk_level": "medium",
      "last_risk_assessment": "2024-02-15T10:30:00Z",
      "status": "active",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-02-15T10:30:00Z"
    }
  ]
}
```

---

### Create Patient

```http
POST /api/patients
```

**Authorization**: Required (All roles)

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "date_of_birth": "1950-01-15",
  "gender": "male",
  "address": "123 Main St",
  "city": "New York",
  "state": "NY",
  "zip_code": "10001",
  "phone": "555-0100",
  "emergency_contact_name": "Jane Doe",
  "emergency_contact_phone": "555-0101",
  "medical_notes": "Diabetes, hypertension"
}
```

**Validation Rules:**
- `first_name`: Required, string
- `last_name`: Required, string
- `date_of_birth`: Required, format YYYY-MM-DD
- `gender`: Optional, enum: "male", "female", "other"
- All other fields: Optional, string

**Response 201 Created:**
```json
{
  "patient": {
    "id": "uuid",
    "organization_id": "uuid",
    "first_name": "John",
    "last_name": "Doe",
    // ... all fields
  }
}
```

**Response 400 Bad Request:**
```json
{
  "error": "Validation failed",
  "details": [
    {
      "path": ["first_name"],
      "message": "First name is required"
    }
  ]
}
```

---

## 🤖 AI Features API

### Risk Assessment

```http
POST /api/ai/risk-assessment
```

**Authorization**: Required (Admin, Manager only)

**Request Body:**
```json
{
  "patient_id": "uuid"
}
```

**Response 200 OK:**
```json
{
  "assessment": {
    "riskScore": 72,
    "riskLevel": "high",
    "factors": [
      "Advanced age (>75)",
      "Multiple recent incidents",
      "Poor medication compliance"
    ],
    "recommendations": [
      "Increase visit frequency",
      "Implement medication management system"
    ]
  }
}
```

**How it works:**
1. Fetches patient data and history
2. Gathers recent incidents and missed visits
3. Calls OpenAI GPT-4 for AI-powered assessment
4. Falls back to rule-based calculation if AI fails
5. Updates patient record with new risk score
6. Creates audit log entry

---

### Caregiver Performance

```http
POST /api/ai/caregiver-performance
```

**Authorization**: Required (Admin, Manager only)

**Request Body:**
```json
{
  "caregiver_id": "uuid"
}
```

**Response 200 OK:**
```json
{
  "assessment": {
    "performanceScore": 92,
    "grade": "A",
    "strengths": [
      "Excellent visit completion rate",
      "High patient satisfaction"
    ],
    "areasForImprovement": [
      "Improve punctuality"
    ]
  }
}
```

**Metrics Analyzed:**
- Visit completion rate
- Missed visit percentage
- Punctuality (late visits)
- Average visit duration
- Patient satisfaction scores
- Incidents reported
- Compliance issues

---

## 💰 Payroll API

### List Payroll Records

```http
GET /api/payroll
```

**Authorization**: Required (Admin, Manager only)

**Response 200 OK:**
```json
{
  "payroll": [
    {
      "id": "uuid",
      "organization_id": "uuid",
      "caregiver_id": "uuid",
      "period_start": "2024-02-01",
      "period_end": "2024-02-15",
      "total_hours": 80.5,
      "hourly_rate": 25.00,
      "gross_pay": 2012.50,
      "deductions": 463.88,
      "net_pay": 1548.62,
      "status": "approved",
      "paid_at": "2024-02-16T10:00:00Z",
      "created_at": "2024-02-16T08:00:00Z",
      "caregiver": {
        "id": "uuid",
        "first_name": "Sarah",
        "last_name": "Smith"
      }
    }
  ]
}
```

---

### Generate Payroll

```http
POST /api/payroll
```

**Authorization**: Required (Admin, Manager only)

**Request Body:**
```json
{
  "period_start": "2024-02-01",
  "period_end": "2024-02-15"
}
```

**Response 200 OK:**
```json
{
  "success": true,
  "count": 32,
  "payroll": [
    {
      "id": "uuid",
      "caregiver_id": "uuid",
      "total_hours": 80.5,
      "gross_pay": 2012.50,
      "net_pay": 1548.62,
      // ... all fields
    }
  ]
}
```

**Process:**
1. Fetches all active caregivers in organization
2. For each caregiver:
   - Gets completed visits in period
   - Calculates total hours from actual visit times
   - Computes gross pay (hours × hourly_rate)
   - Calculates deductions (federal tax, state tax, FICA)
   - Computes net pay (gross - deductions)
3. Creates payroll records in "draft" status
4. Returns all generated payroll entries

---

## 🔗 Webhook API

### n8n Automation Webhook

```http
POST /api/webhooks/n8n
```

**Authorization**: Webhook secret required in body

**Request Body:**
```json
{
  "secret": "your_n8n_webhook_secret",
  "event_type": "daily_risk_scoring",
  "data": {}
}
```

**Event Types:**

#### 1. `daily_risk_scoring`
- Processes all active patients
- Runs AI risk assessment on each
- Updates patient risk scores
- **Data**: {} (empty)

#### 2. `weekly_performance_scoring`
- Processes all active caregivers
- Evaluates performance metrics
- Updates caregiver scores
- **Data**: {} (empty)

#### 3. `visit_fraud_detection`
- Analyzes specific visit for fraud
- **Data**: `{ "visit_id": "uuid" }`

#### 4. `compliance_report`
- Generates compliance report
- **Data**: {} (empty)

**Response 200 OK:**
```json
{
  "success": true,
  "processed": 247,
  "message": "Risk assessment completed for 247 patients"
}
```

**Response 401 Unauthorized:**
```json
{
  "error": "Invalid secret"
}
```

---

### Stripe Webhook

```http
POST /api/webhooks/stripe
```

**Authorization**: Stripe signature header required

**Headers:**
```http
stripe-signature: t=timestamp,v1=signature
```

**Handled Events:**
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

**Response 200 OK:**
```json
{
  "received": true
}
```

---

## 📋 Error Responses

### 400 Bad Request
```json
{
  "error": "Validation failed",
  "details": [
    {
      "path": ["field_name"],
      "message": "Error message"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "error": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "An unexpected error occurred"
}
```

---

## 🔐 Security

### Input Validation
All inputs are validated using Zod schemas before processing.

### Rate Limiting
Implement rate limiting in production (not included in development build).

### CORS
Configure CORS in production based on your frontend domain.

---

## 📊 Usage Examples

### cURL Examples

**Create Patient:**
```bash
curl -X POST http://localhost:3006/api/patients \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "date_of_birth": "1950-01-15",
    "phone": "555-0100"
  }'
```

**Risk Assessment:**
```bash
curl -X POST http://localhost:3006/api/ai/risk-assessment \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": "123e4567-e89b-12d3-a456-426614174000"
  }'
```

**Generate Payroll:**
```bash
curl -X POST http://localhost:3006/api/payroll \
  -H "Content-Type: application/json" \
  -d '{
    "period_start": "2024-02-01",
    "period_end": "2024-02-15"
  }'
```

---

### JavaScript Examples

**Fetch Patients:**
```javascript
const response = await fetch('/api/patients')
const { patients } = await response.json()
console.log(patients)
```

**Create Patient:**
```javascript
const response = await fetch('/api/patients', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    first_name: 'John',
    last_name: 'Doe',
    date_of_birth: '1950-01-15',
  })
})
const { patient } = await response.json()
```

---

## 🧪 Testing

### Test with Postman
1. Import endpoints
2. Set up environment variables
3. Include authentication cookies
4. Test each endpoint

### Test with Stripe CLI
```bash
stripe listen --forward-to localhost:3006/api/webhooks/stripe
stripe trigger customer.subscription.created
```

---

## 📖 Additional Resources

- **Supabase Docs**: https://supabase.com/docs
- **Stripe Webhooks**: https://stripe.com/docs/webhooks
- **OpenAI API**: https://platform.openai.com/docs
- **n8n Docs**: https://docs.n8n.io

---

For more information, see the main README.md file.
