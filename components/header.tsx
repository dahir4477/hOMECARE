'use client'

import { Bell, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function Header() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
      <div className="flex-1">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search patients, caregivers..."
            className="pl-10"
          />
        </div>
      </div>
      <Button variant="ghost" size="icon" className="relative">
        <Bell className="h-5 w-5" />
        <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
      </Button>
      <div className="flex items-center gap-2">
        <div className="text-right">
          <p className="text-sm font-medium">Admin User</p>
          <p className="text-xs text-muted-foreground">admin@example.com</p>
        </div>
        <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
          AU
        </div>
      </div>
    </header>
  )
}
