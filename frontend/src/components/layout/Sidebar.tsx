'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth.store';
import { cn } from '@/lib/utils/cn';
import { 
  LayoutDashboard, 
  Calendar, 
  BarChart3, 
  CreditCard, 
  Settings, 
  HelpCircle, 
  LogOut,
  Ticket,
  PlusCircle,
  Bell
} from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  const { user, clearAuth } = useAuthStore();
  const isCreator = user?.role === 'CREATOR';

  const creatorLinks = [
    { label: 'Dashboard', href: '/creator', icon: LayoutDashboard },
    { label: 'My Events', href: '/creator/events', icon: Calendar },
    { label: 'Analytics', href: '/creator/analytics', icon: BarChart3 },
    { label: 'Payments', href: '/creator/payments', icon: CreditCard },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  const eventeeLinks = [
    { label: 'My Tickets', href: '/eventee/tickets', icon: Ticket },
    { label: 'Explore', href: '/eventee/explore', icon: Calendar },
    { label: 'Notifications', href: '/eventee/notifications', icon: Bell },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  const links = isCreator ? creatorLinks : eventeeLinks;

  return (
    <aside className="w-64 h-screen border-r bg-white flex flex-col sticky top-0">
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-white font-black text-xl">
            E
          </div>
          <div>
            <h1 className="font-black text-sm tracking-tight">Creator Studio</h1>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Manage your events</p>
          </div>
        </div>
      </div>

      <div className="flex-1 py-6 px-4 space-y-8 overflow-y-auto">
        {isCreator && (
          <Link href="/creator/events/create">
            <button className="w-full h-11 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform mb-8">
              <PlusCircle className="h-5 w-5" />
              Create Event
            </button>
          </Link>
        )}

        <div className="space-y-1">
          {links.map((link) => (
            <Link 
              key={link.href} 
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors",
                pathname === link.href 
                  ? "bg-primary/5 text-primary shadow-sm" 
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              <link.icon className={cn("h-5 w-5", pathname === link.href ? "text-primary" : "text-muted-foreground")} />
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="p-4 border-t space-y-1">
        <Link 
          href="/help"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-muted-foreground hover:bg-muted/50 transition-colors"
        >
          <HelpCircle className="h-5 w-5" />
          Help Center
        </Link>
        <button 
          onClick={clearAuth}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-destructive hover:bg-destructive/5 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}
