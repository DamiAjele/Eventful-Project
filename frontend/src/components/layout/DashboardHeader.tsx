'use client';

import { Bell, Search, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/lib/store/auth.store';
import Image from 'next/image';

export function DashboardHeader() {
  const { user } = useAuthStore();

  return (
    <header className="h-20 border-b bg-white/80 backdrop-blur-md sticky top-0 z-40 px-8 flex items-center justify-between">
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search events, orders, or attendees..." 
            className="pl-10 h-11 bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary rounded-xl"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 ml-8">
        <Button variant="ghost" size="icon" className="relative h-11 w-11 rounded-xl hover:bg-primary/5">
          <Bell className="h-5 w-5" />
          <span className="absolute top-3 right-3 h-2 w-2 bg-destructive rounded-full" />
        </Button>
        
        <div className="h-10 w-[1px] bg-border mx-2" />

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold">{user?.fullName}</p>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">{user?.role}</p>
          </div>
          <div className="h-11 w-11 bg-muted rounded-xl flex items-center justify-center border-2 border-white shadow-sm overflow-hidden relative">
            {user?.avatar ? (
              <Image 
                src={user.avatar} 
                alt={user.fullName} 
                fill
                className="object-cover" 
              />
            ) : (
              <UserIcon className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
