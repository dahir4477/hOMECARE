import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
  typescript: true,
})

export const PRICING_PLANS = {
  free: {
    name: 'Free',
    price: 0,
    patients: 10,
    caregivers: 3,
    features: ['Basic scheduling', 'Patient records', 'Visit tracking'],
  },
  basic: {
    name: 'Basic',
    price: 99,
    priceId: 'price_basic', // Replace with actual Stripe price ID
    patients: 50,
    caregivers: 15,
    features: [
      'All Free features',
      'AI risk scoring',
      'Compliance tracking',
      'Basic analytics',
    ],
  },
  professional: {
    name: 'Professional',
    price: 299,
    priceId: 'price_professional', // Replace with actual Stripe price ID
    patients: 200,
    caregivers: 50,
    features: [
      'All Basic features',
      'Fraud detection',
      'Payroll automation',
      'Advanced analytics',
      'Priority support',
    ],
  },
  enterprise: {
    name: 'Enterprise',
    price: 999,
    priceId: 'price_enterprise', // Replace with actual Stripe price ID
    patients: -1, // Unlimited
    caregivers: -1, // Unlimited
    features: [
      'All Professional features',
      'Custom integrations',
      'Dedicated support',
      'SLA guarantee',
      'White-label options',
    ],
  },
}
