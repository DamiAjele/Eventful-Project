'use client';

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { EventFilters } from "@/components/events/EventFilters";
import { EventCard } from "@/components/events/EventCard";
import { useEvents } from "@/lib/hooks/useEvents";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Event } from "@/types/event";

export default function ExplorePage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useEvents({ page, limit: 9 });

  const mockEvents = Array(6).fill(null).map((_, i) => ({
    id: String(i),
    title: i % 2 === 0 ? 'Global Tech Summit 2024' : 'Sunset Valley Music Festival',
    description: 'A premium experience featuring industry leaders and unforgettable performances.',
    bannerImage: i % 2 === 0 ? '/images/explore-tech.png' : '/images/explore-music.png',
    venue: i % 2 === 0 ? 'Moscone Center, SF' : 'Valley Park, Austin',
    startDate: '2024-10-15T09:00:00Z',
    category: i % 2 === 0 ? 'Tech' : 'Music',
    shareableSlug: 'event-' + i,
    ticketTiers: [{ price: i % 2 === 0 ? 299 : 150 }]
  }));

  const events = data?.data?.length > 0 ? data.data : mockEvents;

  return (
    <main className="min-h-screen flex flex-col bg-[#f8f9ff]">
      <Navbar />
      <div className="flex-1 max-w-7xl mx-auto px-4 py-12 w-full">
        <div className="flex flex-col lg:flex-row gap-12">
          <EventFilters />
          
          <div className="flex-1 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-black text-[#0f172a] tracking-tight">Discover Events</h1>
                <p className="text-muted-foreground mt-1">Showing 1-9 of 42 results</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              {isLoading ? (
                Array(6).fill(null).map((_, i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="aspect-[4/3] rounded-2xl" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))
              ) : (
                events.map((event: Event) => (
                  <EventCard key={event.id} event={event} />
                ))
              )}
            </div>

            <div className="flex items-center justify-center gap-2 pt-12">
              <Button variant="outline" size="icon" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {[1, 2, 3, '...', 10].map((p, i) => (
                <Button 
                  key={i} 
                  variant={p === page ? "default" : "ghost"} 
                  size="sm"
                  className={typeof p === 'number' ? "w-10 font-bold" : "pointer-events-none"}
                  onClick={() => typeof p === 'number' && setPage(p)}
                >
                  {p}
                </Button>
              ))}
              <Button variant="outline" size="icon" onClick={() => setPage(p => p + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
