import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function Hero() {
  return (
    <section className="relative pt-20 pb-12 overflow-hidden bg-[#f8f9ff]">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h1 className="text-5xl md:text-6xl font-black text-[#0f172a] mb-6 tracking-tight">
          Experience Every Moment
        </h1>
        <p className="text-lg md:text-xl text-[#475569] max-w-2xl mx-auto mb-10 leading-relaxed">
          Discover curated live experiences, from intimate tech meetups to massive music
          festivals. Secure your tickets in seconds.
        </p>
        <Link href="/eventee/explore">
          <Button size="lg" className="h-14 px-10 text-lg font-bold shadow-xl shadow-primary/25 rounded-full">
            Discover Events
          </Button>
        </Link>
        
        <div className="mt-16 relative w-full max-w-5xl mx-auto aspect-[16/7] rounded-3xl overflow-hidden shadow-2xl">
          <Image 
            src="/images/hero-visual.svg" 
            alt="Experience Every Moment" 
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>
      
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 opacity-30 pointer-events-none">
        <div className="absolute top-1/4 left-10 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-10 w-80 h-80 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-700" />
      </div>
    </section>
  );
}
