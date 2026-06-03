'use client';

import { useCreatorAnalytics } from "@/lib/hooks/useAnalytics";
import { useMyEvents } from "@/lib/hooks/useEvents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  TrendingUp, 
  Users, 
  Scan, 
  DollarSign, 
  MoreVertical
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { Event, TicketTier } from "@/types/event";

export default function CreatorDashboard() {
  const { data: analytics, isLoading: isAnalyticsLoading } = useCreatorAnalytics();
  const { data: eventsData, isLoading: isEventsLoading } = useMyEvents(1, 5);
  const events = eventsData?.data || [];

  const stats = [
    { label: 'Total Events', value: analytics?.totalEvents || '24', icon: Calendar, change: '+12%', color: 'text-blue-600', bg: 'bg-blue-50', loading: isAnalyticsLoading },
    { label: 'Total Revenue', value: formatCurrency(analytics?.totalRevenue || 4200000), icon: DollarSign, change: '+8%', color: 'text-green-600', bg: 'bg-green-50', loading: isAnalyticsLoading },
    { label: 'Tickets Sold', value: analytics?.totalTicketsSold || '1,842', icon: Users, change: '+24%', color: 'text-purple-600', bg: 'bg-purple-50', loading: isAnalyticsLoading },
    { label: 'Scan Rate', value: analytics?.scanRate || '86%', icon: Scan, change: '0%', color: 'text-orange-600', bg: 'bg-orange-50', loading: isAnalyticsLoading },
  ];

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#0f172a] tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1 font-medium">Welcome back. Here&apos;s what&apos;s happening with your events today.</p>
        </div>
        <Button className="h-11 font-bold gap-2 rounded-xl">
          <TrendingUp className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.bg} ${stat.color} p-3 rounded-xl`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  <TrendingUp className="h-3 w-3" />
                  {stat.change}
                </div>
              </div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{stat.label}</p>
              {stat.loading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <h3 className="text-2xl font-black text-[#0f172a]">{stat.value}</h3>
              )}
              <div className="mt-4 h-1 w-full bg-muted rounded-full overflow-hidden">
                <div className={`h-full ${stat.color.replace('text', 'bg')} opacity-40`} style={{ width: '60%' }} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-none shadow-sm bg-white overflow-hidden">
        <CardHeader className="p-8 pb-0 flex flex-row items-center justify-between border-none">
          <CardTitle className="text-xl font-black">Upcoming Events</CardTitle>
          <Link href="/creator/events" className="text-sm font-bold text-primary hover:underline">
            View All
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-none bg-muted/30">
                <TableHead className="px-8 font-black text-[10px] uppercase tracking-widest">Event Name</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-widest">Date</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-widest">Status</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-widest">Tickets Sold</TableHead>
                <TableHead className="px-8 text-right font-black text-[10px] uppercase tracking-widest">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isEventsLoading ? (
                Array(3).fill(null).map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={5} className="p-8"><Skeleton className="h-10 w-full" /></TableCell></TableRow>
                ))
              ) : events.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="p-20 text-center">
                    <p className="text-muted-foreground font-bold">No upcoming events. Start by creating one!</p>
                  </TableCell>
                </TableRow>
              ) : (
                events.map((event: Event) => (
                  <TableRow key={event.id} className="border-b border-muted/50 last:border-none group hover:bg-muted/20">
                    <TableCell className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg overflow-hidden bg-muted flex-shrink-0 relative">
                          <Image 
                            src={event.bannerImage || '/images/neon-nights.png'} 
                            fill
                            className="object-cover" 
                            alt={event.title} 
                          />
                        </div>
                        <span className="font-bold text-[#0f172a]">{event.title}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-muted-foreground">{formatDate(event.startDate, 'MMM dd, yyyy')}</TableCell>
                    <TableCell>
                      <Badge variant={event.status === 'PUBLISHED' ? 'default' : 'secondary'} className="font-bold">
                        {event.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1.5">
                        <p className="text-xs font-bold">{event.ticketTiers.reduce((acc: number, t: TicketTier) => acc + t.soldQuantity, 0)} / {event.ticketTiers.reduce((acc: number, t: TicketTier) => acc + t.totalQuantity, 0)}</p>
                        <div className="h-1 w-24 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: '40%' }} />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-8 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/creator/events/${event.id}/scan`}>
                          <Button variant="outline" size="sm" className="h-8 rounded-lg font-bold gap-2">
                            <Scan className="h-3.5 w-3.5" />
                            Scan
                          </Button>
                        </Link>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
