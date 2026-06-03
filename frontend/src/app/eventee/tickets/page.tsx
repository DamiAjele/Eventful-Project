'use client';

import { useMyTickets } from "@/lib/hooks/useTickets";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, ChevronRight, Ticket as TicketIcon } from "lucide-react";
import { formatDate } from "@/lib/utils/format";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { Ticket } from "@/types/ticket";

export default function MyTicketsPage() {
  const { data, isLoading } = useMyTickets();
  const tickets = data?.data || [];

  return (
    <main className="min-h-screen flex flex-col bg-[#f8f9ff]">
      <Navbar />
      <div className="flex-1 max-w-5xl mx-auto px-4 py-12 w-full">
        <div className="mb-12">
          <h1 className="text-4xl font-black text-[#0f172a] tracking-tight">My Tickets</h1>
          <p className="text-muted-foreground mt-2">All your upcoming and past event tickets.</p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed">
            <div className="bg-muted p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
              <TicketIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2">No tickets yet</h3>
            <p className="text-muted-foreground mb-8">When you buy tickets, they will appear here.</p>
            <Link href="/eventee/explore">
              <button className="h-11 px-8 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20">
                Explore Events
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {tickets.map((ticket: Ticket) => (
              <Link key={ticket.id} href={`/eventee/tickets/${ticket.id}`}>
                <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all group bg-white">
                  <div className="flex flex-col sm:flex-row">
                    <div className="relative w-full sm:w-48 aspect-video sm:aspect-square">
                      <Image 
                        src={ticket.event.bannerImage || '/images/neon-nights.png'} 
                        alt={ticket.event.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 p-6 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-4 mb-2">
                          <Badge variant={ticket.status === 'ACTIVE' ? 'default' : 'secondary'} className="font-bold">
                            {ticket.status}
                          </Badge>
                          <span className="text-xs font-mono text-muted-foreground">{ticket.ticketCode}</span>
                        </div>
                        <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{ticket.event.title}</h3>
                        <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground font-medium">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4 text-primary" />
                            {formatDate(ticket.event.startDate, 'MMM dd, yyyy')}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-4 w-4 text-primary" />
                            {ticket.event.venue}
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between border-t pt-4">
                        <span className="text-sm font-bold text-primary">{ticket.ticketTier.name}</span>
                        <div className="flex items-center text-primary font-bold text-sm">
                          View Ticket <ChevronRight className="h-4 w-4 ml-1" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
