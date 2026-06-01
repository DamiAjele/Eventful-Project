# Eventful — Next.js Frontend Implementation Prompt

## Project Overview

Build the **Eventful** frontend, a Next.js 14+ (App Router, TypeScript) application that connects to the Eventful NestJS backend. The UI serves two distinct user roles — **Creators** and **Eventees** — each with their own dashboard experience.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui |
| State Management | Zustand |
| Data Fetching | TanStack Query v5 (React Query) |
| Forms | React Hook Form + Zod |
| HTTP Client | Axios (with interceptors) |
| Auth | JWT stored in httpOnly cookies |
| QR Scanner | `@yudiel/react-qr-scanner` |
| QR Display | `react-qr-code` |
| Charts | Recharts |
| Social Sharing | Native Web Share API + fallbacks |
| Notifications (Toast) | Sonner |
| Date Handling | date-fns |
| Animation | Framer Motion |
| Icons | Lucide React |
| Testing | Jest + React Testing Library + Playwright (E2E) |

---

## Environment Variables

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_xxxx
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx                    # Root layout + providers
│   ├── page.tsx                      # Landing/home page
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx                # Dashboard shell (sidebar, header)
│   │   ├── dashboard/page.tsx        # Role-aware dashboard redirect
│   │   ├── creator/
│   │   │   ├── page.tsx              # Creator dashboard overview
│   │   │   ├── events/
│   │   │   │   ├── page.tsx          # My events list
│   │   │   │   ├── create/page.tsx   # Create event form
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx      # Event detail (creator view)
│   │   │   │       ├── edit/page.tsx
│   │   │   │       ├── attendees/page.tsx
│   │   │   │       └── scan/page.tsx # QR scanner
│   │   │   ├── analytics/
│   │   │   │   └── page.tsx
│   │   │   └── payments/
│   │   │       └── page.tsx
│   │   └── eventee/
│   │       ├── page.tsx              # Eventee dashboard
│   │       ├── explore/page.tsx      # Browse events
│   │       ├── tickets/
│   │       │   ├── page.tsx          # My tickets
│   │       │   └── [id]/page.tsx     # Ticket detail + QR
│   │       └── notifications/page.tsx
│   ├── events/
│   │   └── [slug]/page.tsx           # Public event page
│   ├── payment/
│   │   ├── checkout/page.tsx
│   │   └── verify/page.tsx           # Paystack callback
│   └── api/
│       └── auth/[...nextauth]/       # (optional, if using NextAuth)
├── components/
│   ├── ui/                           # shadcn/ui components
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx
│   │   ├── DashboardHeader.tsx
│   │   └── Footer.tsx
│   ├── events/
│   │   ├── EventCard.tsx
│   │   ├── EventGrid.tsx
│   │   ├── EventFilters.tsx
│   │   ├── EventForm.tsx             # Create/edit event form
│   │   ├── TicketTierForm.tsx
│   │   ├── ShareEventModal.tsx
│   │   └── EventStatusBadge.tsx
│   ├── tickets/
│   │   ├── TicketCard.tsx
│   │   ├── TicketQRCode.tsx          # Shows QR code image
│   │   └── TicketList.tsx
│   ├── qr/
│   │   └── QRScanner.tsx             # Camera QR scanner for creators
│   ├── analytics/
│   │   ├── OverviewCards.tsx
│   │   ├── RevenueChart.tsx
│   │   ├── EventAnalyticsCard.tsx
│   │   └── AttendanceChart.tsx
│   ├── payments/
│   │   ├── PaystackButton.tsx
│   │   ├── PaymentHistory.tsx
│   │   └── CheckoutForm.tsx
│   ├── notifications/
│   │   ├── NotificationBell.tsx
│   │   ├── NotificationList.tsx
│   │   └── ReminderModal.tsx
│   └── shared/
│       ├── LoadingSpinner.tsx
│       ├── EmptyState.tsx
│       ├── Pagination.tsx
│       ├── ConfirmDialog.tsx
│       └── ImageUpload.tsx
├── lib/
│   ├── api/
│   │   ├── axios.ts                  # Axios instance + interceptors
│   │   ├── auth.api.ts
│   │   ├── events.api.ts
│   │   ├── tickets.api.ts
│   │   ├── payments.api.ts
│   │   ├── notifications.api.ts
│   │   └── analytics.api.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useEvents.ts
│   │   ├── useTickets.ts
│   │   ├── useAnalytics.ts
│   │   ├── useNotifications.ts
│   │   └── usePayments.ts
│   ├── store/
│   │   ├── auth.store.ts
│   │   └── notification.store.ts
│   ├── schemas/
│   │   ├── event.schema.ts           # Zod schemas
│   │   ├── auth.schema.ts
│   │   └── payment.schema.ts
│   └── utils/
│       ├── format.ts                 # Date, currency formatters
│       ├── share.ts                  # Social share helpers
│       └── cn.ts                     # className utility
├── types/
│   ├── user.ts
│   ├── event.ts
│   ├── ticket.ts
│   ├── payment.ts
│   ├── notification.ts
│   └── analytics.ts
└── middleware.ts                     # Auth route protection
```

---

## TypeScript Types (synced with backend)

```typescript
// src/types/user.ts
export type UserRole = 'CREATOR' | 'EVENTEE';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: UserRole;
  avatar?: string;
  phoneNumber?: string;
  isEmailVerified: boolean;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// src/types/event.ts
export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED';

export interface TicketTier {
  id: string;
  name: string;
  description?: string;
  price: number;
  totalQuantity: number;
  soldQuantity: number;
  availableQuantity: number;
  saleStartDate?: string;
  saleEndDate?: string;
  isActive: boolean;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  bannerImage?: string;
  venue: string;
  address?: string;
  city?: string;
  country?: string;
  startDate: string;
  endDate: string;
  status: EventStatus;
  isFeatured: boolean;
  tags: string[];
  category?: string;
  shareableSlug: string;
  defaultReminderOffsets: number[];
  creator: User;
  ticketTiers: TicketTier[];
  createdAt: string;
}

export interface EventFilters {
  search?: string;
  category?: string;
  city?: string;
  startDate?: string;
  page?: number;
  limit?: number;
}

// src/types/ticket.ts
export type TicketStatus = 'ACTIVE' | 'USED' | 'CANCELLED' | 'EXPIRED';

export interface Ticket {
  id: string;
  ticketCode: string;
  status: TicketStatus;
  qrCodeUrl: string;
  scannedAt?: string;
  pricePaid: number;
  event: Event;
  ticketTier: TicketTier;
  createdAt: string;
}

// src/types/analytics.ts
export interface CreatorOverallAnalytics {
  totalEvents: number;
  totalRevenue: number;
  totalTicketsSold: number;
  totalScanned: number;
  scanRate: string;
}

export interface EventAnalytics {
  eventId: string;
  eventTitle: string;
  capacity: number;
  ticketsSold: number;
  scannedCount: number;
  revenue: number;
  ticketsByTier: Array<{ tierName: string; count: number }>;
  soldPercentage: string;
  scanPercentage: string;
}

export interface RevenueDataPoint {
  period: string;
  revenue: string;
  transactions: string;
}
```

---

## API Layer

```typescript
// src/lib/api/axios.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
});

// Request interceptor — attach access token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — auto refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/refresh`, {}, {
          headers: { Authorization: `Bearer ${refreshToken}` },
        });
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export default api;
```

```typescript
// src/lib/api/events.api.ts
import api from './axios';
import { Event, EventFilters } from '@/types/event';

export const eventsApi = {
  getAll: (filters: EventFilters) =>
    api.get('/events', { params: filters }).then((r) => r.data),

  getById: (id: string) =>
    api.get<Event>(`/events/${id}`).then((r) => r.data),

  getBySlug: (slug: string) =>
    api.get<Event>(`/events/slug/${slug}`).then((r) => r.data),

  getMyEvents: (params: { page: number; limit: number }) =>
    api.get('/events/my-events', { params }).then((r) => r.data),

  create: (data: FormData) =>
    api.post<Event>('/events', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),

  update: (id: string, data: Partial<Event>) =>
    api.patch<Event>(`/events/${id}`, data).then((r) => r.data),

  publish: (id: string) =>
    api.post<Event>(`/events/${id}/publish`).then((r) => r.data),

  getAttendees: (id: string) =>
    api.get(`/events/${id}/attendees`).then((r) => r.data),

  getShareLinks: (id: string) =>
    api.get(`/events/${id}/share`).then((r) => r.data),
};

// src/lib/api/payments.api.ts
export const paymentsApi = {
  initialize: (data: { ticketTierId: string; quantity: number }) =>
    api.post('/payments/initialize', data).then((r) => r.data),

  verify: (reference: string) =>
    api.get(`/payments/verify/${reference}`).then((r) => r.data),

  getCreatorPayments: (params: { page: number; limit: number }) =>
    api.get('/payments/creator/all', { params }).then((r) => r.data),
};

// src/lib/api/analytics.api.ts
export const analyticsApi = {
  getOverview: () =>
    api.get('/analytics/overview').then((r) => r.data),

  getEventAnalytics: (eventId: string) =>
    api.get(`/analytics/events/${eventId}`).then((r) => r.data),

  getRevenue: (period: 'daily' | 'weekly' | 'monthly') =>
    api.get('/analytics/revenue', { params: { period } }).then((r) => r.data),
};

// src/lib/api/notifications.api.ts
export const notificationsApi = {
  getAll: (params: { page: number; limit: number }) =>
    api.get('/notifications', { params }).then((r) => r.data),

  markAsRead: (id: string) =>
    api.patch(`/notifications/${id}/read`).then((r) => r.data),

  markAllRead: () =>
    api.patch('/notifications/mark-all-read').then((r) => r.data),

  setReminder: (eventId: string, offsetHours: number[]) =>
    api.post(`/notifications/events/${eventId}/reminders`, { offsetHours }).then((r) => r.data),

  setCreatorReminders: (eventId: string, offsetHours: number[]) =>
    api.post(`/notifications/events/${eventId}/creator-reminders`, { offsetHours }).then((r) => r.data),
};
```

---

## Zustand Auth Store

```typescript
// src/lib/store/auth.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types/user';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      setAuth: (user, accessToken, refreshToken) =>
        set({ user, accessToken, refreshToken, isAuthenticated: true }),
      clearAuth: () =>
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false }),
    }),
    { name: 'eventful-auth' },
  ),
);
```

---

## React Query Hooks

```typescript
// src/lib/hooks/useEvents.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsApi } from '../api/events.api';
import { EventFilters } from '@/types/event';

export const useEvents = (filters: EventFilters) =>
  useQuery({
    queryKey: ['events', filters],
    queryFn: () => eventsApi.getAll(filters),
    staleTime: 5 * 60 * 1000, // 5 min
  });

export const useEvent = (id: string) =>
  useQuery({
    queryKey: ['event', id],
    queryFn: () => eventsApi.getById(id),
    enabled: !!id,
  });

export const useEventBySlug = (slug: string) =>
  useQuery({
    queryKey: ['event', 'slug', slug],
    queryFn: () => eventsApi.getBySlug(slug),
    enabled: !!slug,
  });

export const useMyEvents = (page = 1, limit = 10) =>
  useQuery({
    queryKey: ['my-events', page],
    queryFn: () => eventsApi.getMyEvents({ page, limit }),
  });

export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: FormData) => eventsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-events'] });
    },
  });
};

export const usePublishEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => eventsApi.publish(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['event', id] });
      queryClient.invalidateQueries({ queryKey: ['my-events'] });
    },
  });
};

// src/lib/hooks/useAnalytics.ts
export const useCreatorAnalytics = () =>
  useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: analyticsApi.getOverview,
    staleTime: 5 * 60 * 1000,
  });

export const useEventAnalytics = (eventId: string) =>
  useQuery({
    queryKey: ['analytics', 'event', eventId],
    queryFn: () => analyticsApi.getEventAnalytics(eventId),
    enabled: !!eventId,
  });

export const useRevenueChart = (period: 'daily' | 'weekly' | 'monthly') =>
  useQuery({
    queryKey: ['analytics', 'revenue', period],
    queryFn: () => analyticsApi.getRevenue(period),
  });
```

---

## Key Page Implementations

### Middleware (Route Protection)

```typescript
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_ROUTES = ['/', '/login', '/register', '/events'];
const CREATOR_ROUTES = ['/creator'];
const EVENTEE_ROUTES = ['/eventee'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('accessToken')?.value;
  const userRole = request.cookies.get('userRole')?.value;

  const isPublic = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));
  if (!token && !isPublic) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token && (pathname === '/login' || pathname === '/register')) {
    const redirect = userRole === 'CREATOR' ? '/creator' : '/eventee';
    return NextResponse.redirect(new URL(redirect, request.url));
  }

  if (userRole === 'EVENTEE' && CREATOR_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL('/eventee', request.url));
  }

  if (userRole === 'CREATOR' && EVENTEE_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL('/creator', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

### Auth Pages

```typescript
// src/app/(auth)/register/page.tsx
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterFormValues } from '@/lib/schemas/auth.schema';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/lib/api/auth.api';
import { useAuthStore } from '@/lib/store/auth.store';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function RegisterPage() {
  const { setAuth } = useAuthStore();
  const router = useRouter();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'EVENTEE' },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken);
      // Set cookies for middleware
      document.cookie = `accessToken=${data.accessToken}; path=/`;
      document.cookie = `userRole=${data.user.role}; path=/`;
      toast.success('Welcome to Eventful!');
      router.push(data.user.role === 'CREATOR' ? '/creator' : '/eventee');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Registration failed');
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-orange-50">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6">Join Eventful</h1>

        {/* Role Selection */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {['EVENTEE', 'CREATOR'].map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => form.setValue('role', role as any)}
              className={`p-4 rounded-xl border-2 transition-all ${
                form.watch('role') === role
                  ? 'border-purple-600 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <p className="font-semibold text-sm">{role === 'EVENTEE' ? 'Attendee' : 'Event Creator'}</p>
              <p className="text-xs text-gray-500 mt-1">
                {role === 'EVENTEE' ? 'Browse & attend events' : 'Create & manage events'}
              </p>
            </button>
          ))}
        </div>

        <form onSubmit={form.handleSubmit((data) => mutate(data))} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input {...form.register('firstName')} placeholder="First name" />
            <Input {...form.register('lastName')} placeholder="Last name" />
          </div>
          <Input {...form.register('email')} type="email" placeholder="Email" />
          <Input {...form.register('password')} type="password" placeholder="Password (min 8 chars)" />
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account? <a href="/login" className="text-purple-600 font-medium">Sign in</a>
        </p>
      </div>
    </div>
  );
}
```

### Event Form (Create/Edit)

```typescript
// src/components/events/EventForm.tsx
'use client';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { eventSchema, EventFormValues } from '@/lib/schemas/event.schema';
import { useCreateEvent } from '@/lib/hooks/useEvents';
import { ReminderOffsetPicker } from './ReminderOffsetPicker';
import { TicketTierForm } from './TicketTierForm';
import { ImageUpload } from '@/components/shared/ImageUpload';

export function EventForm() {
  const { mutate: createEvent, isPending } = useCreateEvent();

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      ticketTiers: [{ name: 'General', price: 0, totalQuantity: 100 }],
      defaultReminderOffsets: [24, 168], // 1 day and 1 week defaults
    },
  });

  const { fields: tierFields, append, remove } = useFieldArray({
    control: form.control,
    name: 'ticketTiers',
  });

  const onSubmit = (values: EventFormValues) => {
    const formData = new FormData();
    Object.entries(values).forEach(([key, val]) => {
      if (key === 'ticketTiers' || key === 'defaultReminderOffsets') {
        formData.append(key, JSON.stringify(val));
      } else if (val instanceof File) {
        formData.append(key, val);
      } else if (val !== undefined && val !== null) {
        formData.append(key, String(val));
      }
    });
    createEvent(formData);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      {/* Basic Info Section */}
      <section className="bg-white rounded-xl p-6 border border-gray-100">
        <h2 className="text-lg font-semibold mb-4">Event Details</h2>
        <div className="space-y-4">
          <FormField label="Event Title" error={form.formState.errors.title?.message}>
            <Input {...form.register('title')} placeholder="An amazing event..." />
          </FormField>

          <FormField label="Description">
            <Textarea {...form.register('description')} rows={4} placeholder="Tell attendees about your event..." />
          </FormField>

          <ImageUpload
            label="Event Banner"
            onUpload={(file) => form.setValue('bannerImage', file)}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Start Date & Time">
              <Input {...form.register('startDate')} type="datetime-local" />
            </FormField>
            <FormField label="End Date & Time">
              <Input {...form.register('endDate')} type="datetime-local" />
            </FormField>
          </div>

          <FormField label="Venue Name">
            <Input {...form.register('venue')} placeholder="e.g. Eko Convention Centre" />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="City">
              <Input {...form.register('city')} />
            </FormField>
            <FormField label="Country">
              <Input {...form.register('country')} defaultValue="Nigeria" />
            </FormField>
          </div>

          <FormField label="Category">
            <Select onValueChange={(v) => form.setValue('category', v)}>
              <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {['Music', 'Sports', 'Tech', 'Arts', 'Food', 'Business', 'Cultural'].map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </div>
      </section>

      {/* Ticket Tiers Section */}
      <section className="bg-white rounded-xl p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Ticket Tiers</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ name: '', price: 0, totalQuantity: 0 })}
          >
            + Add Tier
          </Button>
        </div>
        <div className="space-y-3">
          {tierFields.map((field, index) => (
            <TicketTierForm
              key={field.id}
              index={index}
              form={form}
              onRemove={() => remove(index)}
              canRemove={tierFields.length > 1}
            />
          ))}
        </div>
      </section>

      {/* Reminders Section */}
      <section className="bg-white rounded-xl p-6 border border-gray-100">
        <h2 className="text-lg font-semibold mb-2">Default Attendee Reminders</h2>
        <p className="text-sm text-gray-500 mb-4">
          Set when attendees will be reminded about this event. They can also customize their own reminders.
        </p>
        <ReminderOffsetPicker
          value={form.watch('defaultReminderOffsets')}
          onChange={(val) => form.setValue('defaultReminderOffsets', val)}
        />
      </section>

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline">Save as Draft</Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Creating...' : 'Create & Publish'}
        </Button>
      </div>
    </form>
  );
}
```

### Reminder Offset Picker Component

```typescript
// src/components/events/ReminderOffsetPicker.tsx
'use client';

const PRESET_OFFSETS = [
  { label: '1 hour before', value: 1 },
  { label: '3 hours before', value: 3 },
  { label: '12 hours before', value: 12 },
  { label: '1 day before', value: 24 },
  { label: '2 days before', value: 48 },
  { label: '3 days before', value: 72 },
  { label: '1 week before', value: 168 },
  { label: '2 weeks before', value: 336 },
];

interface Props {
  value: number[];
  onChange: (val: number[]) => void;
}

export function ReminderOffsetPicker({ value, onChange }: Props) {
  const toggle = (hours: number) => {
    if (value.includes(hours)) {
      onChange(value.filter((v) => v !== hours));
    } else {
      onChange([...value, hours].sort((a, b) => a - b));
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {PRESET_OFFSETS.map((preset) => (
          <button
            key={preset.value}
            type="button"
            onClick={() => toggle(preset.value)}
            className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
              value.includes(preset.value)
                ? 'bg-purple-600 text-white border-purple-600'
                : 'bg-white text-gray-600 border-gray-300 hover:border-purple-300'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-400 mt-2">
        {value.length === 0
          ? 'No reminders set'
          : `${value.length} reminder(s) will be sent to attendees`}
      </p>
    </div>
  );
}
```

### Share Event Modal

```typescript
// src/components/events/ShareEventModal.tsx
'use client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useQuery } from '@tanstack/react-query';
import { eventsApi } from '@/lib/api/events.api';
import { toast } from 'sonner';

interface Props {
  eventId: string;
  open: boolean;
  onClose: () => void;
}

const SHARE_PLATFORMS = [
  { key: 'twitter', label: 'Twitter / X', icon: '𝕏', color: 'bg-black' },
  { key: 'whatsapp', label: 'WhatsApp', icon: '💬', color: 'bg-green-500' },
  { key: 'facebook', label: 'Facebook', icon: '𝑓', color: 'bg-blue-600' },
  { key: 'linkedin', label: 'LinkedIn', icon: 'in', color: 'bg-blue-700' },
];

export function ShareEventModal({ eventId, open, onClose }: Props) {
  const { data: links } = useQuery({
    queryKey: ['event-share', eventId],
    queryFn: () => eventsApi.getShareLinks(eventId),
    enabled: open,
  });

  const copyLink = async () => {
    await navigator.clipboard.writeText(links?.directLink || '');
    toast.success('Link copied!');
  };

  const shareNative = async () => {
    if (navigator.share) {
      await navigator.share({
        title: 'Check out this event on Eventful!',
        url: links?.directLink,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share this Event</DialogTitle>
        </DialogHeader>

        {/* Direct link */}
        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
          <input
            readOnly
            value={links?.directLink || ''}
            className="flex-1 bg-transparent text-sm text-gray-600 outline-none truncate"
          />
          <Button size="sm" onClick={copyLink}>Copy</Button>
        </div>

        {/* Native share (mobile) */}
        {typeof navigator !== 'undefined' && navigator.share && (
          <Button variant="outline" onClick={shareNative} className="w-full">
            Share via device
          </Button>
        )}

        {/* Platform buttons */}
        <div className="grid grid-cols-2 gap-2">
          {SHARE_PLATFORMS.map(({ key, label, icon, color }) => (
            <a
              key={key}
              href={links?.[key]}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-white text-sm font-medium ${color}`}
            >
              <span>{icon}</span> {label}
            </a>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

### Payment Checkout Page

```typescript
// src/app/payment/checkout/page.tsx
'use client';
import { useSearchParams } from 'next/navigation';
import { PaystackButton } from '@/components/payments/PaystackButton';
import { useEvent } from '@/lib/hooks/useEvents';
import { useState } from 'react';

export default function CheckoutPage() {
  const params = useSearchParams();
  const eventId = params.get('eventId')!;
  const tierId = params.get('tierId')!;
  const [quantity, setQuantity] = useState(1);

  const { data: event } = useEvent(eventId);
  const selectedTier = event?.ticketTiers.find((t) => t.id === tierId);

  if (!event || !selectedTier) return <LoadingSpinner />;

  const total = (selectedTier.price * quantity).toLocaleString('en-NG', {
    style: 'currency', currency: 'NGN',
  });

  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Complete Purchase</h1>

      <div className="bg-white rounded-xl border p-6 mb-6 space-y-4">
        <div>
          <p className="text-sm text-gray-500">Event</p>
          <p className="font-semibold">{event.title}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Ticket Tier</p>
          <p className="font-semibold">{selectedTier.name}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-2">Quantity</p>
          <div className="flex items-center gap-3">
            <Button size="sm" variant="outline" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</Button>
            <span className="w-8 text-center font-semibold">{quantity}</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setQuantity(Math.min(selectedTier.availableQuantity, quantity + 1))}
            >+</Button>
          </div>
        </div>
        <div className="pt-4 border-t">
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>{total}</span>
          </div>
        </div>
      </div>

      <PaystackButton
        ticketTierId={tierId}
        quantity={quantity}
        amount={selectedTier.price * quantity}
      />
    </div>
  );
}
```

### Paystack Button Component

```typescript
// src/components/payments/PaystackButton.tsx
'use client';
import { useMutation } from '@tanstack/react-query';
import { paymentsApi } from '@/lib/api/payments.api';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface Props {
  ticketTierId: string;
  quantity: number;
  amount: number;
}

export function PaystackButton({ ticketTierId, quantity, amount }: Props) {
  const router = useRouter();

  const { mutate, isPending } = useMutation({
    mutationFn: () => paymentsApi.initialize({ ticketTierId, quantity }),
    onSuccess: (data) => {
      // Redirect to Paystack hosted payment page
      window.location.href = data.authorizationUrl;
    },
    onError: () => {
      toast.error('Could not initialize payment. Please try again.');
    },
  });

  return (
    <Button
      className="w-full h-12 text-base bg-[#00C3F7] hover:bg-[#00a8d6] text-white"
      onClick={() => mutate()}
      disabled={isPending}
    >
      {isPending ? 'Preparing payment...' : `Pay ₦${amount.toLocaleString()} with Paystack`}
    </Button>
  );
}
```

### Payment Verify Page (Paystack callback)

```typescript
// src/app/payment/verify/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { paymentsApi } from '@/lib/api/payments.api';

export default function PaymentVerifyPage() {
  const params = useSearchParams();
  const router = useRouter();
  const reference = params.get('reference')!;
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');

  useEffect(() => {
    if (!reference) return;
    paymentsApi.verify(reference)
      .then(() => {
        setStatus('success');
        setTimeout(() => router.push('/eventee/tickets'), 3000);
      })
      .catch(() => {
        setStatus('failed');
      });
  }, [reference]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      {status === 'loading' && (
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Verifying your payment...</p>
        </div>
      )}
      {status === 'success' && (
        <div className="text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-green-600">Payment Successful!</h2>
          <p className="text-gray-500 mt-2">Your tickets have been generated. Redirecting...</p>
        </div>
      )}
      {status === 'failed' && (
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-red-600">Payment Failed</h2>
          <Button className="mt-4" onClick={() => router.back()}>Try Again</Button>
        </div>
      )}
    </div>
  );
}
```

### QR Code Display (Eventee Ticket)

```typescript
// src/components/tickets/TicketQRCode.tsx
'use client';
import QRCode from 'react-qr-code';
import { Ticket } from '@/types/ticket';
import { format } from 'date-fns';

export function TicketQRCode({ ticket }: { ticket: Ticket }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 max-w-sm mx-auto">
      <div className="text-center mb-4">
        <p className="text-sm text-gray-500">Your Ticket</p>
        <h2 className="text-lg font-bold">{ticket.event.title}</h2>
        <p className="text-sm text-purple-600 font-medium">{ticket.ticketTier.name}</p>
      </div>

      <div className="flex justify-center my-6 p-4 bg-gray-50 rounded-xl">
        {ticket.qrCodeData ? (
          <QRCode value={ticket.qrCodeData} size={180} />
        ) : (
          <img src={ticket.qrCodeUrl} alt="QR Code" className="w-44 h-44" />
        )}
      </div>

      <div className="space-y-2 text-sm border-t pt-4">
        <div className="flex justify-between">
          <span className="text-gray-500">Ticket Code</span>
          <span className="font-mono font-semibold text-xs">{ticket.ticketCode}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Date</span>
          <span>{format(new Date(ticket.event.startDate), 'dd MMM yyyy, HH:mm')}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Venue</span>
          <span>{ticket.event.venue}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Status</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
            ticket.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
          }`}>
            {ticket.status}
          </span>
        </div>
      </div>
    </div>
  );
}
```

### QR Scanner (Creator - Event Entry)

```typescript
// src/app/(dashboard)/creator/events/[id]/scan/page.tsx
'use client';
import { useState } from 'react';
import { QrScanner } from '@yudiel/react-qr-scanner';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api/axios';
import { toast } from 'sonner';

interface ScanResult {
  valid: boolean;
  message: string;
  ticket?: {
    holderName: string;
    tierName: string;
    eventTitle: string;
    scannedAt: string;
  };
}

export default function ScanPage({ params }: { params: { id: string } }) {
  const [lastResult, setLastResult] = useState<ScanResult | null>(null);
  const [scanning, setScanning] = useState(true);

  const { mutate } = useMutation({
    mutationFn: (qrData: string) =>
      api.post('/qr-codes/validate', { qrData }).then((r) => r.data),
    onSuccess: (data: ScanResult) => {
      setLastResult(data);
      setScanning(false);
      if (data.valid) {
        toast.success(`✅ ${data.ticket?.holderName} — Access Granted`);
      } else {
        toast.error(`❌ ${data.message}`);
      }
      // Resume scanning after 3 seconds
      setTimeout(() => setScanning(true), 3000);
    },
  });

  return (
    <div className="max-w-sm mx-auto p-4">
      <h1 className="text-xl font-bold mb-4 text-center">Scan Tickets</h1>

      <div className="rounded-2xl overflow-hidden border-4 border-purple-600">
        {scanning ? (
          <QrScanner
            onDecode={(result) => mutate(result)}
            onError={(error) => console.warn(error)}
          />
        ) : (
          <div className={`h-64 flex items-center justify-center ${
            lastResult?.valid ? 'bg-green-50' : 'bg-red-50'
          }`}>
            <div className="text-center p-6">
              <div className="text-4xl mb-2">{lastResult?.valid ? '✅' : '❌'}</div>
              <p className="font-bold">{lastResult?.message}</p>
              {lastResult?.ticket && (
                <div className="mt-2 text-sm text-gray-600">
                  <p>{lastResult.ticket.holderName}</p>
                  <p>{lastResult.ticket.tierName}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

### Analytics Dashboard

```typescript
// src/app/(dashboard)/creator/analytics/page.tsx
'use client';
import { useCreatorAnalytics, useRevenueChart } from '@/lib/hooks/useAnalytics';
import { OverviewCards } from '@/components/analytics/OverviewCards';
import { RevenueChart } from '@/components/analytics/RevenueChart';
import { useState } from 'react';

export default function AnalyticsPage() {
  const { data: overview, isLoading } = useCreatorAnalytics();
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const { data: revenueData } = useRevenueChart(period);

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Analytics</h1>

      {isLoading ? <LoadingSpinner /> : <OverviewCards data={overview} />}

      <div className="bg-white rounded-xl border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Revenue Over Time</h2>
          <div className="flex gap-2">
            {(['daily', 'weekly', 'monthly'] as const).map((p) => (
              <Button
                key={p}
                size="sm"
                variant={period === p ? 'default' : 'outline'}
                onClick={() => setPeriod(p)}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </Button>
            ))}
          </div>
        </div>
        <RevenueChart data={revenueData || []} />
      </div>
    </div>
  );
}

// src/components/analytics/OverviewCards.tsx
export function OverviewCards({ data }: { data: CreatorOverallAnalytics }) {
  const cards = [
    { label: 'Total Events', value: data.totalEvents, icon: '🎪' },
    { label: 'Total Revenue', value: `₦${data.totalRevenue.toLocaleString()}`, icon: '💰' },
    { label: 'Tickets Sold', value: data.totalTicketsSold, icon: '🎟️' },
    { label: 'Scan Rate', value: data.scanRate, icon: '📱' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ label, value, icon }) => (
        <div key={label} className="bg-white rounded-xl border p-5">
          <div className="text-2xl mb-2">{icon}</div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-gray-500 mt-1">{label}</p>
        </div>
      ))}
    </div>
  );
}

// src/components/analytics/RevenueChart.tsx
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export function RevenueChart({ data }: { data: RevenueDataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="period" tick={{ fontSize: 12 }} />
        <YAxis tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 12 }} />
        <Tooltip formatter={(v: number) => [`₦${v.toLocaleString()}`, 'Revenue']} />
        <Area type="monotone" dataKey="revenue" stroke="#7c3aed" fill="url(#revenueGrad)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
```

### Notification Bell

```typescript
// src/components/notifications/NotificationBell.tsx
'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '@/lib/api/notifications.api';
import { Bell } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export function NotificationBell() {
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ['notifications', 1],
    queryFn: () => notificationsApi.getAll({ page: 1, limit: 10 }),
    refetchInterval: 30000, // Poll every 30 seconds
  });

  const { mutate: markAllRead } = useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const unread = data?.unreadCount || 0;

  return (
    <Popover>
      <PopoverTrigger className="relative p-2">
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {unread > 0 && (
            <button onClick={() => markAllRead()} className="text-xs text-purple-600">
              Mark all read
            </button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {data?.data?.length === 0 && (
            <p className="text-center text-sm text-gray-400 py-8">No notifications yet</p>
          )}
          {data?.data?.map((n: any) => (
            <div key={n.id} className={`px-4 py-3 border-b last:border-0 ${!n.isRead ? 'bg-purple-50' : ''}`}>
              <p className="text-sm font-medium">{n.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
```

---

## Zod Validation Schemas

```typescript
// src/lib/schemas/event.schema.ts
import { z } from 'zod';

export const ticketTierSchema = z.object({
  name: z.string().min(1, 'Tier name required'),
  description: z.string().optional(),
  price: z.coerce.number().min(0, 'Price must be 0 or more'),
  totalQuantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
  saleStartDate: z.string().optional(),
  saleEndDate: z.string().optional(),
});

export const eventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(20, 'Description too short'),
  venue: z.string().min(2),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  startDate: z.string().min(1, 'Start date required'),
  endDate: z.string().min(1, 'End date required'),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  ticketTiers: z.array(ticketTierSchema).min(1, 'Add at least one ticket tier'),
  defaultReminderOffsets: z.array(z.number()).default([]),
});

export type EventFormValues = z.infer<typeof eventSchema>;

// src/lib/schemas/auth.schema.ts
export const registerSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8).regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[0-9]/, 'Must contain number'),
  role: z.enum(['CREATOR', 'EVENTEE']),
  phoneNumber: z.string().optional(),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;
```

---

## Testing

```typescript
// src/__tests__/components/EventCard.test.tsx
import { render, screen } from '@testing-library/react';
import { EventCard } from '@/components/events/EventCard';

const mockEvent = {
  id: '1',
  title: 'Lagos Tech Summit',
  venue: 'Eko Hotel',
  startDate: new Date().toISOString(),
  ticketTiers: [{ price: 5000, availableQuantity: 50 }],
  shareableSlug: 'lagos-tech-summit',
};

describe('EventCard', () => {
  it('renders event title', () => {
    render(<EventCard event={mockEvent as any} />);
    expect(screen.getByText('Lagos Tech Summit')).toBeInTheDocument();
  });

  it('shows lowest ticket price', () => {
    render(<EventCard event={mockEvent as any} />);
    expect(screen.getByText(/5,000/)).toBeInTheDocument();
  });
});

// e2e/auth.spec.ts (Playwright)
test('user can register and login', async ({ page }) => {
  await page.goto('/register');
  await page.fill('input[name="firstName"]', 'Test');
  await page.fill('input[name="lastName"]', 'User');
  await page.fill('input[name="email"]', `test${Date.now()}@test.com`);
  await page.fill('input[name="password"]', 'TestPass123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/eventee');
});
```

---

## Key Dependencies (package.json)

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "@tanstack/react-query": "^5.0.0",
    "zustand": "^4.5.0",
    "axios": "^1.6.0",
    "react-hook-form": "^7.50.0",
    "@hookform/resolvers": "^3.3.0",
    "zod": "^3.22.0",
    "react-qr-code": "^2.0.0",
    "@yudiel/react-qr-scanner": "^1.1.0",
    "recharts": "^2.12.0",
    "framer-motion": "^11.0.0",
    "sonner": "^1.4.0",
    "date-fns": "^3.3.0",
    "lucide-react": "^0.323.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0"
  },
  "devDependencies": {
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "@playwright/test": "^1.42.0",
    "jest": "^29.0.0",
    "jest-environment-jsdom": "^29.0.0"
  }
}
```

---

## Feature-to-Route Mapping

| Feature | Frontend Route | Backend Endpoint |
|---|---|---|
| Public event listing | `/events/[slug]` | `GET /events/slug/:slug` |
| Browse events | `/eventee/explore` | `GET /events` |
| Create event | `/creator/events/create` | `POST /events` |
| Manage events | `/creator/events` | `GET /events/my-events` |
| View attendees | `/creator/events/[id]/attendees` | `GET /events/:id/attendees` |
| Scan QR | `/creator/events/[id]/scan` | `POST /qr-codes/validate` |
| Analytics | `/creator/analytics` | `GET /analytics/overview` |
| Creator payments | `/creator/payments` | `GET /payments/creator/all` |
| Buy ticket | `/payment/checkout` | `POST /payments/initialize` |
| Verify payment | `/payment/verify` | `GET /payments/verify/:ref` |
| My tickets | `/eventee/tickets` | `GET /tickets/my-tickets` |
| View ticket + QR | `/eventee/tickets/[id]` | `GET /tickets/:id` |
| Notifications | `/eventee/notifications` | `GET /notifications` |
| Set reminders | Reminder modal (any page) | `POST /notifications/events/:id/reminders` |
| Share event | ShareEventModal (any event page) | `GET /events/:id/share` |
