'use client';

import { UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2 } from 'lucide-react';
import { EventFormValues } from '@/lib/schemas/event.schema';

interface Props {
  index: number;
  form: UseFormReturn<EventFormValues>;
  onRemove: () => void;
  canRemove: boolean;
}

export function TicketTierForm({ index, form, onRemove, canRemove }: Props) {
  return (
    <div className="p-4 bg-muted/30 rounded-xl border border-border/50 relative group">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">Tier Name</label>
          <Input 
            placeholder="e.g., General Admission" 
            className="h-10 bg-white"
            {...form.register(`ticketTiers.${index}.name`)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">Price (NGN)</label>
          <Input 
            type="number" 
            placeholder="0.00" 
            className="h-10 bg-white"
            {...form.register(`ticketTiers.${index}.price`, { valueAsNumber: true })}
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">Quantity</label>
          <div className="flex gap-2">
            <Input 
              type="number" 
              placeholder="100" 
              className="h-10 bg-white"
              {...form.register(`ticketTiers.${index}.totalQuantity`, { valueAsNumber: true })}
            />
            {canRemove && (
              <Button 
                variant="ghost" 
                size="icon" 
                type="button" 
                onClick={onRemove}
                className="h-10 w-10 text-destructive hover:bg-destructive/10 shrink-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
