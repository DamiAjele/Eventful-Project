'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { paymentsApi } from '@/lib/api/payments.api';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

function VerifyContent() {
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
  }, [reference, router]);

  return (
    <div className="max-w-md mx-auto py-24 px-4 text-center">
      {status === 'loading' && (
        <div className="space-y-6">
          <Loader2 className="h-16 w-16 text-primary animate-spin mx-auto" />
          <h2 className="text-2xl font-bold">Verifying Payment</h2>
          <p className="text-muted-foreground">Please wait while we confirm your transaction with Paystack...</p>
        </div>
      )}
      
      {status === 'success' && (
        <div className="space-y-6">
          <CheckCircle2 className="h-20 w-16 text-green-500 mx-auto" />
          <h2 className="text-3xl font-black text-green-600">Payment Successful!</h2>
          <p className="text-muted-foreground text-lg">Your tickets have been generated. You will be redirected to your ticket wallet in a few seconds.</p>
          <Button onClick={() => router.push('/eventee/tickets')} className="font-bold">
            Go to My Tickets
          </Button>
        </div>
      )}
      
      {status === 'failed' && (
        <div className="space-y-6">
          <XCircle className="h-20 w-16 text-destructive mx-auto" />
          <h2 className="text-3xl font-black text-destructive">Verification Failed</h2>
          <p className="text-muted-foreground">We couldn&apos;t verify your payment. If you were charged, please contact support.</p>
          <Button variant="outline" onClick={() => router.back()} className="font-bold">
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}

export default function PaymentVerifyPage() {
  return (
    <main className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <div className="flex-1">
        <Suspense fallback={<div className="p-12 text-center">Loading...</div>}>
          <VerifyContent />
        </Suspense>
      </div>
      <Footer />
    </main>
  );
}
