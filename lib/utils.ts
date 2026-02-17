import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function formatDate(date: Date | string | null): string {
  if (!date) return 'N/A'
  return format(new Date(date), 'MMM dd, yyyy')
}

export function formatDateTime(date: Date | string | null): string {
  if (!date) return 'N/A'
  return format(new Date(date), 'MMM dd, yyyy HH:mm')
}

export function getRiskColor(riskLevel: string): string {
  switch (riskLevel) {
    case 'low':
      return 'text-green-600 bg-green-50 border-green-200'
    case 'medium':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    case 'high':
      return 'text-orange-600 bg-orange-50 border-orange-200'
    case 'critical':
      return 'text-red-600 bg-red-50 border-red-200'
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200'
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'active':
    case 'completed':
    case 'approved':
    case 'paid':
      return 'text-green-600 bg-green-50 border-green-200'
    case 'scheduled':
    case 'in_progress':
    case 'draft':
      return 'text-blue-600 bg-blue-50 border-blue-200'
    case 'missed':
    case 'cancelled':
    case 'expired':
      return 'text-red-600 bg-red-50 border-red-200'
    case 'inactive':
      return 'text-gray-600 bg-gray-50 border-gray-200'
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200'
  }
}
