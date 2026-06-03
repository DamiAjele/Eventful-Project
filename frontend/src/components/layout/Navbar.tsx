'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/store/auth.store';
import { Search, Bell, User as UserIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';

export function Navbar() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-2xl font-black text-primary tracking-tight">
            Eventful
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link href="/eventee/explore" className="text-sm font-medium hover:text-primary transition-colors">
              Explore
            </Link>
            <Link href="/categories" className="text-sm font-medium hover:text-primary transition-colors">
              Categories
            </Link>
            <Link href="/support" className="text-sm font-medium hover:text-primary transition-colors">
              Support
            </Link>
          </div>
        </div>

        <div className="flex-1 max-w-md mx-8 hidden lg:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search events..." 
              className="pl-10 bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          {!isAuthenticated ? (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="font-semibold">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="font-bold shadow-md shadow-primary/20">Get Tickets</Button>
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-2 right-2 h-2 w-2 bg-destructive rounded-full" />
              </Button>
              <Link href={user?.role === 'CREATOR' ? '/creator' : '/eventee'}>
                <Button variant="ghost" size="sm" className="gap-2 font-semibold">
                  <UserIcon className="h-4 w-4" />
                  {user?.firstName}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
