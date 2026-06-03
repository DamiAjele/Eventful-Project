'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateEvent } from '@/lib/hooks/useEvents';
import { TicketTierForm } from '@/components/events/TicketTierForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ChevronLeft, 
  Upload, 
  Plus, 
  MapPin, 
  Type, 
  Ticket, 
  Bell,
  Rocket
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import axios from 'axios';
import Image from 'next/image';
import { eventSchema, EventFormValues } from '@/lib/schemas/event.schema';

export default function CreateEventPage() {
  const { mutate: createEvent, isPending } = useCreateEvent();
  const [banner, setBanner] = useState<File | null>(null);

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      ticketTiers: [{ name: 'General Admission', price: 0, totalQuantity: 100 }],
      defaultReminderOffsets: [24, 168],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'ticketTiers',
  });

  const onSubmit = (values: EventFormValues) => {
    const formData = new FormData();
    Object.entries(values).forEach(([key, val]) => {
      if (key === 'ticketTiers' || key === 'defaultReminderOffsets') {
        formData.append(key, JSON.stringify(val));
      } else {
        formData.append(key, String(val));
      }
    });
    if (banner) formData.append('bannerImage', banner);
    
    createEvent(formData, {
      onSuccess: () => toast.success('Event created successfully!'),
      onError: (err) => {
        if (axios.isAxiosError(err)) {
          toast.error(err.response?.data?.message || 'Failed to create event');
        } else {
          toast.error('An unexpected error occurred');
        }
      },
    });
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <Link href="/creator/events" className="inline-flex items-center text-sm font-bold text-muted-foreground hover:text-primary mb-4">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to My Events
          </Link>
          <h1 className="text-4xl font-black text-[#0f172a] tracking-tight">Create New Event</h1>
          <p className="text-muted-foreground mt-1 font-medium">Fill in the details below to publish your event to the marketplace.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="font-bold rounded-xl h-11 px-6">Save Draft</Button>
          <Button onClick={form.handleSubmit(onSubmit)} className="font-bold rounded-xl h-11 px-8 gap-2 shadow-lg shadow-primary/20" disabled={isPending}>
            <Rocket className="h-4 w-4" />
            {isPending ? 'Publishing...' : 'Publish Event'}
          </Button>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none shadow-sm bg-white overflow-hidden">
            <div className="p-6 bg-muted/20 border-b flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Type className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-bold">Basic Information</h3>
            </div>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">Event Title *</label>
                <Input placeholder="e.g., Summer Music Festival 2024" className="h-12 text-lg font-medium border-border/60" {...form.register('title')} />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">Description *</label>
                <Textarea placeholder="Describe what makes your event special..." className="min-h-[200px] text-base border-border/60" {...form.register('description')} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">Category *</label>
                  <Select onValueChange={(v) => form.setValue('category', v)}>
                    <SelectTrigger className="h-12 border-border/60">
                      <SelectValue placeholder="Select category..." />
                    </SelectTrigger>
                    <SelectContent>
                      {['Music', 'Sports', 'Tech', 'Arts', 'Food', 'Business'].map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">Event Format</label>
                  <Select defaultValue="in-person">
                    <SelectTrigger className="h-12 border-border/60">
                      <SelectValue placeholder="Select format..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in-person">In Person</SelectItem>
                      <SelectItem value="online">Online / Virtual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white overflow-hidden">
            <div className="p-6 bg-muted/20 border-b flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-bold">Date & Location</h3>
            </div>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">Start Date & Time *</label>
                  <Input type="datetime-local" className="h-12 border-border/60" {...form.register('startDate')} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">End Date & Time *</label>
                  <Input type="datetime-local" className="h-12 border-border/60" {...form.register('endDate')} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">Venue Name *</label>
                <Input placeholder="e.g., Eko Convention Center" className="h-12 border-border/60" {...form.register('venue')} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">City *</label>
                  <Input placeholder="Lagos" className="h-12 border-border/60" {...form.register('city')} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">Country</label>
                  <Input placeholder="Nigeria" defaultValue="Nigeria" className="h-12 border-border/60" {...form.register('country')} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="border-none shadow-sm bg-white overflow-hidden">
            <div className="p-6 bg-muted/20 border-b flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Upload className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-bold">Banner Image</h3>
            </div>
            <CardContent className="p-8">
              <div className="relative group aspect-video rounded-2xl bg-muted/30 border-2 border-dashed border-border flex flex-col items-center justify-center text-center p-6 hover:bg-muted/50 transition-colors cursor-pointer overflow-hidden">
                {banner ? (
                  <Image 
                    src={URL.createObjectURL(banner)} 
                    alt="Banner Preview"
                    fill
                    className="object-cover" 
                  />
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-muted-foreground mb-3 group-hover:scale-110 transition-transform" />
                    <p className="text-xs font-bold mb-1">Click or drag image here</p>
                    <p className="text-[10px] text-muted-foreground">Recommended: 1920x1080px</p>
                  </>
                )}
                <input 
                  type="file" 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  accept="image/*"
                  onChange={(e) => setBanner(e.target.files?.[0] || null)}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white overflow-hidden">
            <div className="p-6 bg-muted/20 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Ticket className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-bold">Ticketing</h3>
              </div>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                className="h-8 px-2 font-bold text-primary hover:bg-primary/5"
                onClick={() => append({ name: '', price: 0, totalQuantity: 100 })}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Tier
              </Button>
            </div>
            <CardContent className="p-6 space-y-4">
              {fields.map((field, index) => (
                <TicketTierForm 
                  key={field.id} 
                  index={index} 
                  form={form} 
                  onRemove={() => remove(index)}
                  canRemove={fields.length > 1}
                />
              ))}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white overflow-hidden">
            <div className="p-6 bg-muted/20 border-b flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-bold">Reminders</h3>
            </div>
            <CardContent className="p-8">
              <p className="text-xs text-muted-foreground mb-6 font-medium leading-relaxed">
                Automatically notify attendees before the event starts.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: '1 Hour Before', value: 1 },
                  { label: '1 Day Before', value: 24 },
                  { label: '3 Hours Before', value: 3 },
                  { label: '1 Week Before', value: 168 },
                ].map((rem) => (
                  <button
                    key={rem.value}
                    type="button"
                    className="h-10 border-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-primary/50 transition-colors"
                  >
                    {rem.label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
