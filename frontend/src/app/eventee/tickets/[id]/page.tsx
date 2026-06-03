'use client';

import { useParams } from "next/navigation";
import { useTicket } from "@/lib/hooks/useTickets";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Download, Share2, MapPin, Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils/format";
import Link from "next/link";
import QRCode from "react-qr-code";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

export default function TicketDetailPage() {
  const { id } = useParams();
  const { data: ticket, isLoading } = useTicket(id as string);

  if (isLoading) return <div className="min-h-screen flex flex-col"><Navbar /><div className="flex-1 max-w-lg mx-auto p-12 space-y-8"><Skeleton className="h-[500px] w-full" /></div></div>;
  if (!ticket) return <div>Ticket not found</div>;

  return (
    <main className="min-h-screen flex flex-col bg-[#f8f9ff]">
      <Navbar />
      <div className="flex-1 max-w-2xl mx-auto px-4 py-12 w-full">
        <Link href="/eventee/tickets" className="inline-flex items-center text-sm font-bold text-muted-foreground hover:text-primary mb-8 transition-colors">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to My Tickets
        </Link>

        <div className="relative group">
          {/* Ticket Bento Box (Figma node n_3cc14) */}
          <div className="bg-white rounded-[32px] overflow-hidden shadow-2xl border border-white/50">
            {/* Header Image */}
            <div className="relative h-48 md:h-56">
              <Image 
                src={ticket.event.bannerImage || '/images/neon-nights.png'} 
                alt={ticket.event.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              <div className="absolute bottom-6 left-8">
                <span className="bg-primary text-white px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                  {ticket.event.category}
                </span>
                <h2 className="text-2xl md:text-3xl font-black text-white mt-2 tracking-tight">
                  {ticket.event.title}
                </h2>
              </div>
            </div>

            <div className="p-8 space-y-8">
              <div className="grid gap-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-2.5 rounded-xl">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">{formatDate(ticket.event.startDate, 'EEEE, MMMM dd, yyyy')}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Doors {formatDate(ticket.event.startDate, 'h:mm a')}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-2.5 rounded-xl">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">{ticket.event.venue}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{ticket.event.address || 'Event location'}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 py-6 border-y border-dashed border-muted-foreground/20">
                <div className="flex-1">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">Type</p>
                  <p className="font-black text-primary">{ticket.ticketTier.name}</p>
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">Order Ref</p>
                  <p className="font-black text-sm">{ticket.ticketCode}</p>
                </div>
              </div>

              <div className="text-center pt-4">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-6">Ready to scan at gate</p>
                <div className="inline-block p-6 bg-white border-2 border-primary/10 rounded-[32px] shadow-inner mb-6">
                  <QRCode value={ticket.ticketCode} size={180} />
                </div>
                <div>
                  <p className="text-xl font-black text-[#0f172a]">{ticket.event.creator.fullName}</p>
                  <p className="text-xs text-muted-foreground font-bold mt-1 uppercase tracking-widest">1x Adult Ticket</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Decorative ticket cutouts */}
          <div className="absolute top-[184px] md:top-[216px] -left-3 h-6 w-6 bg-[#f8f9ff] rounded-full border-r border-white/50" />
          <div className="absolute top-[184px] md:top-[216px] -right-3 h-6 w-6 bg-[#f8f9ff] rounded-full border-l border-white/50" />
        </div>

        <div className="grid grid-cols-2 gap-4 mt-8">
          <Button variant="outline" className="h-12 font-bold rounded-2xl gap-2 border-2 hover:bg-primary/5 transition-colors">
            <Download className="h-4 w-4" />
            PDF Ticket
          </Button>
          <Button variant="outline" className="h-12 font-bold rounded-2xl gap-2 border-2 hover:bg-primary/5 transition-colors">
            <Share2 className="h-4 w-4" />
            Share Event
          </Button>
        </div>
      </div>
      <Footer />
    </main>
  );
}
