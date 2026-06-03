import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Props {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, actionHref }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="bg-muted p-4 rounded-3xl mb-6">
        <Icon className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-bold text-[#0f172a] mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-xs mx-auto mb-8 font-medium">{description}</p>
      {actionLabel && actionHref && (
        <Link href={actionHref}>
          <Button className="font-bold rounded-xl h-11 px-8">{actionLabel}</Button>
        </Link>
      )}
    </div>
  );
}
