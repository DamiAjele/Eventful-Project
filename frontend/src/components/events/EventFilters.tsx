'use client';

import { Search, MapPin, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const CATEGORIES = [
  'Music & Concerts',
  'Technology',
  'Arts & Culture',
  'Business',
  'Sports',
  'Food & Drink'
];

export function EventFilters() {
  return (
    <aside className="w-full lg:w-72 flex-shrink-0 space-y-8">
      <div className="space-y-3">
        <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest">Search</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search events..." 
            className="pl-10 h-11 bg-white border-border rounded-xl"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest">Categories</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 bg-primary/5 p-3 rounded-xl border border-primary/10">
            <Checkbox id="all" checked />
            <Label htmlFor="all" className="text-sm font-bold text-primary">All Events</Label>
          </div>
          {CATEGORIES.map((cat) => (
            <div key={cat} className="flex items-center space-x-3 px-3 py-1">
              <Checkbox id={cat} />
              <Label htmlFor={cat} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                {cat}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest">Location</h3>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Anywhere" 
            className="pl-10 h-11 bg-white border-border rounded-xl"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest">Date</h3>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            type="date"
            className="pl-10 h-11 bg-white border-border rounded-xl"
          />
        </div>
      </div>
    </aside>
  );
}
