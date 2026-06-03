import * as z from 'zod';

export const eventSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  description: z.string().min(10, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
  venue: z.string().min(1, 'Venue is required'),
  city: z.string().min(1, 'City is required'),
  country: z.string().optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  ticketTiers: z.array(z.object({
    name: z.string().min(1, 'Tier name is required'),
    price: z.number().min(0),
    totalQuantity: z.number().min(1),
  })).min(1),
  defaultReminderOffsets: z.array(z.number()),
  bannerImage: z.any().optional(),
});

export type EventFormValues = z.infer<typeof eventSchema>;
