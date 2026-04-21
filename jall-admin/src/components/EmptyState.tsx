import { Inbox } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  message?: string;
  hint?: string;
  icon?: LucideIcon;
}

export default function EmptyState({ message = 'No bookings found', hint, icon: Icon = Inbox }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <Icon className="mb-3 h-10 w-10 text-brand-hairline" strokeWidth={1.5} />
      <p className="text-sm text-brand-muted">{message}</p>
      {hint && (
        <p className="mt-1 text-xs text-brand-subtle">{hint}</p>
      )}
    </div>
  );
}
