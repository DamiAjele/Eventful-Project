'use client';

import { useSearchParams } from 'next/navigation';
import { useEvent } from '@/lib/hooks/useEvents';
import { useState, Suspense } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Minus, Plus, CreditCard, ChevronRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/format';
import { useMutation } from '@tanstack/react-query';
import { paymentsApi } from '@/lib/api/payments.api';
import { toast } from 'sonner';

function CheckoutContent() {
  const params = useSearchParams();
  const eventId = params.get('eventId')!;
  const tierId = params.get('tierId')!;
  const [quantity, setQuantity] = useState(1);

  const { data: event, isLoading } = useEvent(eventId);
  const selectedTier = event?.ticketTiers.find((t) => t.id === tierId);

  const { mutate: initializePayment, isPending } = useMutation({
    mutationFn: () => paymentsApi.initialize({ ticketTierId: tierId, quantity }),
    onSuccess: (data) => {
      window.location.href = data.authorizationUrl;
    },
    onError: () => {
      toast.error('Could not initialize payment. Please try again.');
    },
  });

  if (isLoading) return <div className="max-w-2xl mx-auto p-12 space-y-6"><Skeleton className="h-40 w-full" /><Skeleton className="h-60 w-full" /></div>;
  if (!event || !selectedTier) return <div className="text-center p-12">Event or Ticket Tier not found</div>;

  const total = selectedTier.price * quantity;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-black text-[#0f172a] mb-2 tracking-tight">Checkout</h1>
            <p className="text-muted-foreground">Review your order before proceeding to payment.</p>
          </div>

          <Card className="border-none shadow-sm bg-white overflow-hidden">
            <CardHeader className="bg-primary/5">
              <CardTitle className="text-lg font-bold">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Event</p>
                  <p className="font-bold text-lg">{event.title}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between border-y py-6">
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Ticket Type</p>
                  <p className="font-bold">{selectedTier.name}</p>
                  <p className="text-xs text-primary font-bold mt-1">{formatCurrency(selectedTier.price)} per ticket</p>
                </div>
                <div className="flex items-center gap-4 bg-muted/50 p-2 rounded-xl">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8 rounded-lg"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-4 text-center font-black">{quantity}</span>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8 rounded-lg"
                    onClick={() => setQuantity(Math.min(selectedTier.availableQuantity, quantity + 1))}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-xl font-black">Total</p>
                <p className="text-2xl font-black text-primary">{formatCurrency(total)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-xl bg-white p-8">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <CreditCard className="h-6 w-6 text-primary" />
              Payment Method
            </h3>
            <p className="text-sm text-muted-foreground mb-8">
              We use <span className="font-bold text-[#00C3F7]">Paystack</span> for secure payment processing. You will be redirected to their platform.
            </p>
            
            <Button 
              className="w-full h-14 text-lg font-bold bg-[#00C3F7] hover:bg-[#00a8d6] rounded-xl shadow-lg shadow-[#00C3F7]/20"
              onClick={() => initializePayment()}
              disabled={isPending}
            >
              {isPending ? 'Redirecting...' : `Pay ${formatCurrency(total)}`}
              <ChevronRight className="h-5 w-5 ml-2" />
            </Button>
            
            <div className="mt-8 pt-8 border-t space-y-4">
              <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                SSL Secured & Encrypted
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                By clicking pay, you agree to our Ticketing Terms and acknowledge that tickets are non-refundable unless the event is cancelled.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <main className="min-h-screen flex flex-col bg-[#f8f9ff]">
      <Navbar />
      <div className="flex-1">
        <Suspense fallback={<div className="p-12 text-center">Loading checkout...</div>}>
          <CheckoutContent />
        </Suspense>
      </div>
      <Footer />
    </main>
  );
}
