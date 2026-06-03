'use client';

import { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { useMutation } from '@tanstack/react-query';
import { ticketsApi } from '@/lib/api/tickets.api';
import { toast } from 'sonner';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, CheckCircle2, XCircle, Loader2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { useEvent } from '@/lib/hooks/useEvents';

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

export default function ScanPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: event } = useEvent(id as string);
  const [lastResult, setLastResult] = useState<ScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(true);

  const { mutate, isPending } = useMutation({
    mutationFn: (qrData: string) => ticketsApi.validateQR(qrData),
    onSuccess: (data: ScanResult) => {
      setLastResult(data);
      setIsScanning(false);
      if (data.valid) {
        toast.success(`Access Granted: ${data.ticket?.holderName}`);
      } else {
        toast.error(`Access Denied: ${data.message}`);
      }
      // Resume scanning after 3 seconds
      setTimeout(() => {
        setIsScanning(true);
        setLastResult(null);
      }, 3000);
    },
    onError: (err) => {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || 'Invalid QR Code');
      } else {
        toast.error('An unexpected error occurred');
      }
      setTimeout(() => {
        setIsScanning(true);
        setLastResult(null);
      }, 3000);
    }
  });

  return (
    <div className="fixed inset-0 z-50 bg-[#0f172a] flex flex-col">
      <div className="p-6 flex items-center justify-between text-white border-b border-white/10 bg-black/20 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <div>
            <h1 className="font-black tracking-tight">{event?.title || 'Main Entrance'}</h1>
            <p className="text-[10px] font-bold text-primary-foreground/60 uppercase tracking-widest">Entry Control</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-green-500/20 text-green-400 px-3 py-1.5 rounded-full border border-green-500/30">
          <ShieldCheck className="h-4 w-4" />
          <span className="text-[10px] font-black uppercase tracking-widest">Secure Scan</span>
        </div>
      </div>

      <div className="flex-1 relative flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-sm aspect-square relative rounded-[40px] overflow-hidden border-4 border-white/10 shadow-2xl shadow-primary/20">
          {isScanning ? (
            <>
              <Scanner
                onScan={(result) => {
                  if (result[0]?.rawValue) {
                    mutate(result[0].rawValue);
                  }
                }}
                onError={(error) => console.warn(error)}
                styles={{ container: { width: '100%', height: '100%' }, video: { objectFit: 'cover' } }}
              />
              <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none" />
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-48 h-48 border-2 border-primary rounded-3xl animate-pulse flex items-center justify-center">
                    <div className="w-full h-0.5 bg-primary absolute top-1/2 left-0 animate-bounce" />
                 </div>
              </div>
            </>
          ) : (
            <div className={`h-full w-full flex flex-col items-center justify-center p-8 text-center transition-colors ${
              lastResult?.valid ? 'bg-green-500' : 'bg-destructive'
            }`}>
              {isPending ? (
                <Loader2 className="h-16 w-16 text-white animate-spin" />
              ) : lastResult?.valid ? (
                <>
                  <CheckCircle2 className="h-20 w-20 text-white mb-6 animate-in zoom-in-50 duration-300" />
                  <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Access Granted</h2>
                  <p className="text-white/80 font-bold">{lastResult.ticket?.holderName}</p>
                  <p className="text-white/60 text-sm mt-1">{lastResult.ticket?.tierName}</p>
                </>
              ) : (
                <>
                  <XCircle className="h-20 w-20 text-white mb-6 animate-in zoom-in-50 duration-300" />
                  <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Access Denied</h2>
                  <p className="text-white/80 font-bold">{lastResult?.message || 'Invalid Ticket'}</p>
                </>
              )}
            </div>
          )}
        </div>

        <div className="mt-12 text-center">
          <p className="text-white/40 text-xs font-black uppercase tracking-[0.3em] mb-4">Scan Instructions</p>
          <p className="text-white/80 text-sm font-medium">Align the attendee&apos;s QR code within the frame above.</p>
        </div>
      </div>

      <div className="p-8 bg-black/20 border-t border-white/10 backdrop-blur-md">
        <div className="max-w-sm mx-auto flex items-center justify-between text-white mb-8">
           <div className="text-center">
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Scanned Total</p>
              <p className="text-2xl font-black">1,452 <span className="text-sm text-white/30">/ 2,000</span></p>
           </div>
           <div className="h-10 w-[1px] bg-white/10" />
           <div className="text-center">
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Capacity</p>
              <p className="text-2xl font-black text-primary">72%</p>
           </div>
        </div>
        <Button className="w-full h-14 rounded-2xl font-black text-sm uppercase tracking-widest bg-white text-black hover:bg-white/90">
          Manual Entry
        </Button>
      </div>
    </div>
  );
}
