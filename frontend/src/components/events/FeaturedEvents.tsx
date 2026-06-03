'use client';

import { useEvents } from '@/lib/hooks/useEvents';
import { EventCard } from './EventCard';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Event } from '@/types/event';

export function FeaturedEvents() {
  const { data: events } = useEvents({ limit: 3 });

  // Fallback mock data if API fails or empty for now (matching Figma)
  const mockEvents = [
    {
      id: '1',
      title: 'Neon Nights Festival',
      description: 'Experience the premier electronic music gathering featuring top international artists.',
      bannerImage: '/images/music-festival.png',
      venue: 'Downtown Arena',
      startDate: '2024-10-12T20:00:00Z',
      category: 'Music',
      shareableSlug: 'neon-nights-festival',
      ticketTiers: [{ price: 45 }]
    },
    {
      id: '2',
      title: 'Global Innovators Summit',
      description: 'Join industry leaders discussing the future of AI and sustainable technology solutions.',
      bannerImage: '/images/tech-conference.png',
      venue: 'Convention Center',
      startDate: '2024-11-05T09:00:00Z',
      category: 'Tech',
      shareableSlug: 'global-innovators-summit',
      ticketTiers: [{ price: 0 }]
    },
    {
      id: '3',
      title: 'Modern Canvas Exhibition',
      description: 'A curated collection of contemporary abstract works from emerging local artists.',
      bannerImage: '/images/art-exhibition.png',
      venue: 'Metro Gallery',
      startDate: '2024-12-15T10:00:00Z',
      category: 'Arts',
      shareableSlug: 'modern-canvas-exhibition',
      ticketTiers: [{ price: 25 }]
    }
  ];

  const displayEvents = events?.data?.length > 0 ? events.data : mockEvents;

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl font-black text-[#0f172a] tracking-tight">Featured Events</h2>
            <p className="text-muted-foreground mt-2">Handpicked experiences you don&apos;t want to miss.</p>
          </div>
          <Link href="/eventee/explore">
            <Button variant="ghost" className="font-bold text-primary hover:text-primary hover:bg-primary/5">
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayEvents.map((event: Event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    </section>
  );
}
