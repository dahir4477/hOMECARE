# Setup Instructions

## Initial Setup

Follow these steps to get the AI Homecare Management System up and running.

### Step 1: Install Dependencies

```bash
npm install
```

This will install all required packages including Next.js, Supabase, Stripe, OpenAI, and UI components.

### Step 2: Set Up Supabase

1. Create a Supabase account at [supabase.com](https://supabase.com)

2. Create a new project

3. Go to Project Settings → API and copy:
   - Project URL (NEXT_PUBLIC_SUPABASE_URL)
   - Anon/Public key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
   - Service Role key (SUPABASE_SERVICE_ROLE_KEY)

4. Go to SQL Editor and run the entire `supabase/schema.sql` file

5. Verify tables were created in Table Editor

### Step 3: Set Up Stripe

1. Create a Stripe account at [stripe.com](https://stripe.com)

2. Go to Developers → API keys and copy:
   - Publishable key (NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
   - Secret key (STRIPE_SECRET_KEY)

3. Create products and prices for subscription tiers

4. Update price IDs in `lib/stripe.ts`

5. Set up webhook:
   - Endpoint: `http://localhost:3000/api/webhooks/stripe` (for testing)
   - Events: `customer.subscription.*`, `invoice.*`
   - Copy webhook secret (STRIPE_WEBHOOK_SECRET)

### Step 4: Get OpenAI API Key

1. Create account at [platform.openai.com](https://platform.openai.com)

2. Go to API keys and create new key

3. Copy the key (OPENAI_API_KEY)

### Step 5: Create Environment File

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in all values with your actual credentials

### Step 6: Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Step 7: Create First User

Since the database is empty, you need to create the first user manually:

1. Go to Supabase → Authentication → Users
2. Click "Add user"
3. Enter email and password
4. Copy the user UUID

Then run this SQL in Supabase SQL Editor:

```sql
-- Create first organization
INSERT INTO organizations (name, subscription_tier, subscription_status)
VALUES ('My Organization', 'professional', 'active')
RETURNING id;

-- Create user profile (replace UUIDs with actual values)
INSERT INTO users (id, organization_id, email, full_name, role, is_active)
VALUES (
  'user-uuid-from-auth',
  'organization-id-from-above',
  'admin@example.com',
  'Admin User',
  'admin',
  true
);
```

### Step 8: Test the Application

1. Log in with your created user
2. Create a test patient using the "New Patient Registration" button
3. Verify the patient appears in the database
4. Test other features

---

## Optional: Set Up n8n Automation

1. Install n8n:
   ```bash
   npm install -g n8n
   ```

2. Run n8n:
   ```bash
   n8n start
   ```

3. Open [http://localhost:5678](http://localhost:5678)

4. Create workflow with HTTP Request node

5. Configure webhook:
   - URL: `http://localhost:3000/api/webhooks/n8n`
   - Method: POST
   - Body:
     ```json
     {
       "secret": "your_n8n_webhook_secret",
       "event_type": "daily_risk_scoring",
       "data": {}
     }
     ```

6. Schedule workflow to run daily

---

## Troubleshooting

### "Module not found" errors
```bash
rm -rf node_modules package-lock.json
npm install
```

### Database connection fails
- Verify Supabase credentials in `.env.local`
- Check if Supabase project is active
- Verify RLS policies are in place

### Login not working
- Check if user exists in Supabase Auth
- Verify user profile exists in `users` table
- Check browser console for errors

### Stripe webhooks not receiving events
- Use Stripe CLI for local testing:
  ```bash
  stripe listen --forward-to localhost:3000/api/webhooks/stripe
  ```

---

## Next Steps

1. Customize branding (logo, colors, etc.)
2. Add additional caregivers and patients
3. Configure email notifications
4. Set up production deployment
5. Configure monitoring and analytics
6. Train staff on the system

---

## Getting Help

- Check `README.md` for detailed documentation
- Review `DEPLOYMENT.md` for production setup
- Check API documentation for endpoint details
- Review Supabase logs for database errors
- Check browser console for frontend errors
