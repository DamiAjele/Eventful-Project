'use client';

import { useMyEvents } from "@/lib/hooks/useEvents";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Users, 
  Eye, 
  Edit3, 
  Scan,
  MoreHorizontal
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Event, TicketTier } from "@/types/event";

export default function MyEventsPage() {
  const { data, isLoading } = useMyEvents();
  const events = data?.data || [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-[#0f172a] tracking-tight">My Events</h1>
          <p className="text-muted-foreground mt-1 font-medium">Manage and monitor all your events.</p>
        </div>
        <Link href="/creator/events/create">
          <Button className="h-11 font-bold gap-2 rounded-xl shadow-lg shadow-primary/20">
            <Plus className="h-4 w-4" />
            Create Event
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search your events..." 
            className="pl-10 h-11 bg-white rounded-xl"
          />
        </div>
        <Button variant="outline" className="h-11 font-bold gap-2 rounded-xl border-2">
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-6">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
      ) : events.length === 0 ? (
        <Card className="border-none shadow-sm bg-white py-20 text-center">
          <div className="bg-muted p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
            <Calendar className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold mb-2">No events found</h3>
          <p className="text-muted-foreground mb-8">You haven&apos;t created any events yet.</p>
          <Link href="/creator/events/create">
            <Button className="font-bold rounded-xl px-8">Create your first event</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-6">
          {events.map((event: Event) => (
            <Card key={event.id} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all group bg-white">
              <div className="flex flex-col lg:flex-row">
                <div className="relative w-full lg:w-64 aspect-video lg:aspect-auto shrink-0 overflow-hidden">
                  <Image 
                    src={event.bannerImage || '/images/neon-nights.png'} 
                    alt={event.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute top-4 left-4">
                    <Badge variant={event.status === 'PUBLISHED' ? 'default' : 'secondary'} className="font-black border-none shadow-lg">
                      {event.status}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex-1 p-6 lg:p-8 flex flex-col justify-between min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="text-2xl font-black text-[#0f172a] truncate mb-2 group-hover:text-primary transition-colors">{event.title}</h3>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground font-medium">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4 text-primary" />
                          {formatDate(event.startDate, 'MMM dd, yyyy')}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Users className="h-4 w-4 text-primary" />
                          {event.ticketTiers.reduce((acc: number, t: TicketTier) => acc + t.soldQuantity, 0)} Attendees
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground rounded-xl">
                      <MoreHorizontal className="h-5 w-5" />
                    </Button>
                  </div>

                  <div className="mt-8 flex flex-wrap items-center justify-between gap-6 pt-6 border-t">
                    <div className="flex gap-4">
                      <div className="text-center px-4 border-r last:border-none">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Tickets</p>
                        <p className="font-black text-lg">
                          {event.ticketTiers.reduce((acc: number, t: TicketTier) => acc + t.soldQuantity, 0)}
                          <span className="text-xs text-muted-foreground font-bold"> / {event.ticketTiers.reduce((acc: number, t: TicketTier) => acc + t.totalQuantity, 0)}</span>
                        </p>
                      </div>
                      <div className="text-center px-4">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Revenue</p>
                        <p className="font-black text-lg text-green-600">{formatCurrency(event.ticketTiers.reduce((acc: number, t: TicketTier) => acc + (t.soldQuantity * t.price), 0))}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link href={`/events/${event.shareableSlug}`} target="_blank">
                        <Button variant="outline" size="sm" className="h-10 px-4 font-bold gap-2 rounded-xl">
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                      </Link>
                      <Link href={`/creator/events/${event.id}/edit`}>
                        <Button variant="outline" size="sm" className="h-10 px-4 font-bold gap-2 rounded-xl">
                          <Edit3 className="h-4 w-4" />
                          Edit
                        </Button>
                      </Link>
                      <Link href={`/creator/events/${event.id}/scan`}>
                        <Button size="sm" className="h-10 px-4 font-bold gap-2 rounded-xl">
                          <Scan className="h-4 w-4" />
                          Scan
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
