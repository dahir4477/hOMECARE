import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )

    const supabase = await createServerSupabaseClient()

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        const subscription = event.data.object as any
        
        await supabase
          .from('organizations')
          .update({
            stripe_subscription_id: subscription.id,
            subscription_status: subscription.status === 'active' ? 'active' : subscription.status,
            subscription_tier: subscription.metadata.tier || 'basic',
          })
          .eq('stripe_customer_id', subscription.customer)

        break

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as any
        
        await supabase
          .from('organizations')
          .update({
            subscription_status: 'cancelled',
          })
          .eq('stripe_customer_id', deletedSubscription.customer)

        break

      case 'invoice.payment_succeeded':
        const invoice = event.data.object as any
        
        // Update subscription status
        await supabase
          .from('organizations')
          .update({
            subscription_status: 'active',
          })
          .eq('stripe_customer_id', invoice.customer)

        break

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object as any
        
        await supabase
          .from('organizations')
          .update({
            subscription_status: 'past_due',
          })
          .eq('stripe_customer_id', failedInvoice.customer)

        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
