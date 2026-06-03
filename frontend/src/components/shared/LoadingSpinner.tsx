import { Loader2 } from 'lucide-react';

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className="flex items-center justify-center p-8 w-full">
      <Loader2 className={`h-8 w-8 text-primary animate-spin ${className}`} />
    </div>
  );
}
