import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/events/Hero";
import { FeaturedEvents } from "@/components/events/FeaturedEvents";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1">
        <Hero />
        
        <section className="py-6 border-y bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-8 min-w-max">
              {['All Events', 'Music', 'Tech', 'Sports', 'Culture', 'Arts'].map((cat) => (
                <button 
                  key={cat} 
                  className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors whitespace-nowrap"
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        <FeaturedEvents />
        
        <section className="py-20 bg-[#f8f9ff]">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-black text-[#0f172a] mb-4 tracking-tight">Ready to join the fun?</h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto text-balance">
              Sign up today to discover exclusive events or start hosting your own and reach thousands of attendees.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="h-12 px-8 bg-primary text-white font-bold rounded-full shadow-lg shadow-primary/25 hover:scale-105 transition-transform">
                Get Started
              </button>
              <button className="h-12 px-8 bg-white text-primary border border-primary/20 font-bold rounded-full hover:bg-primary/5 transition-colors">
                Learn More
              </button>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
}
