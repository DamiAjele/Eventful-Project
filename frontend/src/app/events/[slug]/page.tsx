'use client';

import { useParams } from "next/navigation";
import { useEventBySlug } from "@/lib/hooks/useEvents";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, MapPin, Share2, Ticket, Info } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils/format";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

export default function EventDetailPage() {
  const { slug } = useParams();
  const { data: event, isLoading } = useEventBySlug(slug as string);

  if (isLoading) return <div className="min-h-screen flex flex-col"><Navbar /><div className="flex-1 max-w-5xl mx-auto p-4 space-y-8"><Skeleton className="h-[400px] w-full" /><Skeleton className="h-12 w-3/4" /><Skeleton className="h-40 w-full" /></div></div>;
  if (!event) return <div>Event not found</div>;

  return (
    <main className="min-h-screen flex flex-col bg-[#f8f9ff]">
      <Navbar />
      <div className="flex-1">
        <div className="relative h-[40vh] md:h-[500px]">
          <Image 
            src={event.bannerImage || '/images/neon-nights.png'} 
            alt={event.title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 w-full p-8 md:p-12">
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="bg-primary text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  {event.category}
                </span>
                <span className="bg-white/20 backdrop-blur text-white px-3 py-1 rounded-full text-xs font-medium">
                  {event.status}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 tracking-tight">
                {event.title}
              </h1>
              <div className="flex flex-col md:flex-row md:items-center gap-6 text-white/90">
                <div className="flex items-center gap-2 font-semibold">
                  <Calendar className="h-5 w-5 text-primary" />
                  {formatDate(event.startDate, 'EEEE, MMMM dd, yyyy')}
                </div>
                <div className="flex items-center gap-2 font-semibold">
                  <MapPin className="h-5 w-5 text-primary" />
                  {event.venue}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-12">
              <section>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Info className="h-6 w-6 text-primary" />
                  About This Event
                </h2>
                <p className="text-muted-foreground leading-relaxed text-lg whitespace-pre-wrap">
                  {event.description}
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <MapPin className="h-6 w-6 text-primary" />
                  Location
                </h2>
                <Card className="overflow-hidden border-none shadow-sm bg-white p-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-xl">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{event.venue}</h3>
                      <p className="text-muted-foreground">{event.address || 'Location details will be shared with ticket holders.'}</p>
                    </div>
                  </div>
                </Card>
              </section>
            </div>

            <div className="space-y-6">
              <div className="sticky top-24 space-y-6">
                <Card className="border-none shadow-xl bg-white overflow-hidden">
                  <div className="p-6 bg-primary text-white flex items-center justify-between">
                    <h3 className="font-bold text-lg">Tickets</h3>
                    <Ticket className="h-5 w-5" />
                  </div>
                  <CardContent className="p-6 space-y-6">
                    {event.ticketTiers.map((tier) => (
                      <div key={tier.id} className="flex items-center justify-between gap-4 group">
                        <div className="flex-1">
                          <p className="font-bold group-hover:text-primary transition-colors">{tier.name}</p>
                          <p className="text-xs text-muted-foreground">{tier.availableQuantity} remaining</p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-lg">{formatCurrency(tier.price)}</p>
                          <Link href={`/payment/checkout?eventId=${event.id}&tierId=${tier.id}`}>
                            <Button size="sm" className="mt-2 font-bold h-8 rounded-full px-4">
                              Buy
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                    
                    <Button variant="outline" className="w-full gap-2 font-bold rounded-xl h-11">
                      <Share2 className="h-4 w-4" />
                      Share with Friends
                    </Button>
                  </CardContent>
                </Card>
                
                <div className="p-6 bg-secondary/10 rounded-2xl border border-secondary/20">
                  <p className="text-sm font-bold text-secondary mb-2 uppercase tracking-wider flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Need Help?
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Have questions about this event? Contact the organizer through our support center.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
