import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import StatusBadge from './StatusBadge';
import EmptyState  from './EmptyState';
import type { Booking } from '@/types';

export default function BookingTable({ bookings }: { bookings: Booking[] }) {
  if (bookings.length === 0) return <EmptyState />;

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-brand-canvas">
          <TableHead className="w-1/4">Client</TableHead>
          <TableHead className="w-1/3">Pickup</TableHead>
          <TableHead>Driver</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {bookings.map((b) => (
          <TableRow
            key={b.id}
            className="border-b border-brand-hairline hover:bg-brand-canvas transition-colors"
          >
            <TableCell className="font-medium text-brand-ink">
              {b.client_name ?? '—'}
            </TableCell>
            <TableCell className="max-w-[200px] truncate text-brand-muted text-sm">
              {b.pickup_location}
            </TableCell>
            <TableCell className="text-brand-muted text-sm">
              {b.driver_name ?? <span className="text-brand-subtle italic">Unassigned</span>}
            </TableCell>
            <TableCell>
              <StatusBadge status={b.status} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
