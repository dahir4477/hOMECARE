import { createServerSupabaseClient } from './supabase/server'

export async function getUser() {
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }

  // Get user profile with organization
  const { data: profile } = await supabase
    .from('users')
    .select('*, organization:organizations(*)')
    .eq('id', user.id)
    .single()

  return profile
}

export async function getSession() {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function requireAuth() {
  const user = await getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
}

export async function requireSubscription() {
  const user = await requireAuth()
  
  if (user.organization.subscription_status !== 'active' && user.organization.subscription_status !== 'trialing') {
    throw new Error('Subscription required')
  }
  
  return user
}

export async function checkRole(allowedRoles: string[]) {
  const user = await requireAuth()
  
  if (!allowedRoles.includes(user.role)) {
    throw new Error('Insufficient permissions')
  }
  
  return user
}
