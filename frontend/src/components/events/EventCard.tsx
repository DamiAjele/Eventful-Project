import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import Link from 'next/link';
import { Event } from '@/types/event';

export function EventCard({ event }: { event: Event }) {
  const lowestPrice = event.ticketTiers?.reduce((min, t) => t.price < min ? t.price : min, event.ticketTiers[0]?.price || 0);

  return (
    <Card className="group overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300 bg-white">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image 
          src={event.bannerImage || '/images/placeholder-event.png'} 
          alt={event.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-4 left-4">
          <Badge className="bg-white/90 backdrop-blur text-primary hover:bg-white font-bold border-none px-3 py-1">
            {event.category || 'Featured'}
          </Badge>
        </div>
        <div className="absolute bottom-4 left-4 bg-primary/90 backdrop-blur text-white px-3 py-1 rounded-lg text-sm font-bold shadow-lg">
          {lowestPrice > 0 ? `From ${formatCurrency(lowestPrice)}` : 'Free'}
        </div>
      </div>
      <CardContent className="p-5">
        <div className="flex items-center gap-2 text-primary font-bold text-xs mb-2">
          <Calendar className="h-3.5 w-3.5" />
          {formatDate(event.startDate, 'MMM dd • h:mm a')}
        </div>
        <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-1">
          {event.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 h-10">
          {event.description}
        </p>
        <div className="pt-4 border-t flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            {event.venue}
          </div>
          <Link href={`/events/${event.shareableSlug}`} className="text-primary font-bold text-sm flex items-center gap-1 group/link">
            Details
            <ArrowRight className="h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
