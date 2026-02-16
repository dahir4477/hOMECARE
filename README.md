# AI Homecare Management System

A production-grade SaaS platform for home healthcare management with AI-powered features.

## Features

- **Multi-tenant Architecture**: Secure isolation between organizations
- **AI Risk Scoring**: Automated patient risk assessment using OpenAI
- **Fraud Detection**: Advanced algorithms to detect suspicious visit patterns
- **Caregiver Performance Tracking**: Automated scoring and evaluation
- **Payroll Automation**: Automatic calculation based on completed visits
- **Compliance Dashboard**: Track certifications, training, and documentation
- **Subscription Management**: Stripe integration with tiered pricing
- **n8n Integration**: Webhook-based automation for daily tasks
- **Audit Logging**: Complete audit trail of all actions
- **Role-Based Access Control**: Admin, Manager, Caregiver, and Staff roles

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Supabase (PostgreSQL with RLS)
- **Authentication**: Supabase Auth
- **Payments**: Stripe
- **AI**: OpenAI GPT-4
- **Automation**: n8n webhooks
- **Charts**: Recharts
- **Validation**: Zod

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Stripe account
- OpenAI API key
- n8n instance (optional)

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# n8n
N8N_WEBHOOK_SECRET=your_n8n_webhook_secret
N8N_WEBHOOK_URL=your_n8n_webhook_url

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Installation

1. **Install dependencies**:
```bash
npm install
```

2. **Set up Supabase database**:

Run the SQL schema in `supabase/schema.sql` in your Supabase SQL editor. This will create:
- All tables with proper relationships
- Row Level Security (RLS) policies
- Indexes for performance
- Triggers for updated_at columns

3. **Create Stripe products** (if using subscriptions):

Create products in your Stripe dashboard and update the price IDs in `lib/stripe.ts`.

4. **Run the development server**:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── ai/               # AI endpoints (risk, performance)
│   │   ├── patients/         # Patient CRUD
│   │   ├── payroll/          # Payroll generation
│   │   └── webhooks/         # n8n and Stripe webhooks
│   ├── dashboard/            # Main dashboard
│   ├── compliance/           # Compliance tracking
│   ├── login/                # Authentication
│   └── layout.tsx            # Root layout
├── components/
│   ├── ui/                   # shadcn/ui components
│   ├── modals/               # Modal dialogs
│   ├── sidebar.tsx           # Navigation sidebar
│   └── header.tsx            # Top header
├── lib/
│   ├── supabase/             # Supabase clients
│   ├── ai-engine.ts          # AI risk & performance logic
│   ├── fraud-detection.ts    # Fraud detection algorithms
│   ├── payroll.ts            # Payroll calculation
│   ├── stripe.ts             # Stripe integration
│   ├── validation.ts         # Zod schemas
│   └── utils.ts              # Utility functions
├── types/
│   └── index.ts              # TypeScript types
├── middleware.ts             # Route protection
└── supabase/
    └── schema.sql            # Database schema
```

## Key Features Explained

### Multi-Tenancy

All data is scoped to organizations using RLS policies. Users can only access data from their own organization.

### AI Risk Scoring

Patients are automatically scored based on:
- Age
- Medical history
- Recent incidents
- Missed visits
- Medication compliance
- Mobility and cognitive status

### Fraud Detection

Visits are analyzed for:
- Unrealistic durations
- Location mismatches
- Overlapping visits
- Pattern anomalies

### Payroll Automation

Automatically calculates:
- Total hours from completed visits
- Gross pay based on hourly rates
- Deductions (taxes, FICA)
- Net pay

### n8n Automation

Webhook endpoints for:
- Daily risk scoring (all patients)
- Weekly performance scoring (all caregivers)
- Visit fraud detection
- Payroll calculation
- Compliance report generation

## API Routes

### Patients
- `GET /api/patients` - List all patients
- `POST /api/patients` - Create new patient

### AI Endpoints
- `POST /api/ai/risk-assessment` - Assess patient risk
- `POST /api/ai/caregiver-performance` - Evaluate caregiver

### Payroll
- `GET /api/payroll` - List payroll records
- `POST /api/payroll` - Generate payroll for period

### Webhooks
- `POST /api/webhooks/n8n` - n8n automation webhook
- `POST /api/webhooks/stripe` - Stripe subscription webhook

## Security

- ✅ Row Level Security (RLS) on all tables
- ✅ Server-side authentication checks
- ✅ Input validation with Zod
- ✅ HTTP-only cookies for sessions
- ✅ Middleware route protection
- ✅ Subscription enforcement
- ✅ Audit logging for all actions

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Self-Hosted

1. Build the application:
```bash
npm run build
```

2. Start production server:
```bash
npm start
```

3. Set up reverse proxy (Nginx/Apache)
4. Configure SSL certificate
5. Set up process manager (PM2)

## n8n Automation Setup

1. Create workflow in n8n
2. Add webhook trigger
3. Set webhook URL to: `https://yourdomain.com/api/webhooks/n8n`
4. Include secret in body: `{ "secret": "your_secret", "event_type": "...", "data": {...} }`
5. Schedule workflow (e.g., daily at midnight)

### Example n8n Workflow

```json
{
  "nodes": [
    {
      "name": "Schedule Trigger",
      "type": "n8n-nodes-base.cron",
      "position": [250, 300],
      "parameters": {
        "rule": {
          "hour": 0,
          "minute": 0
        }
      }
    },
    {
      "name": "HTTP Request",
      "type": "n8n-nodes-base.httpRequest",
      "position": [450, 300],
      "parameters": {
        "url": "https://yourdomain.com/api/webhooks/n8n",
        "method": "POST",
        "bodyParameters": {
          "secret": "your_secret",
          "event_type": "daily_risk_scoring",
          "data": {}
        }
      }
    }
  ]
}
```

## Testing

Create a test organization and user:

1. Sign up at `/signup`
2. Create patients via dashboard
3. Create caregivers
4. Schedule visits
5. Test AI features via API

## Support

For issues or questions, please contact support or create an issue in the repository.

## License

Proprietary - All rights reserved
