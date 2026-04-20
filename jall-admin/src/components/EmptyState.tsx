import { Inbox } from 'lucide-react';

export default function EmptyState({ message = 'No bookings found' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
      <Inbox className="mb-3 h-12 w-12 opacity-50" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
