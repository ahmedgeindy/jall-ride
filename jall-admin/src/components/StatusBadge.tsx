import type { BookingStatus } from '@/types';

const styles: Record<BookingStatus, string> = {
  active:    'inline-flex items-center rounded-sm bg-brand-ink px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-label text-brand-canvas',
  pending:   'inline-flex items-center rounded-sm border border-brand-ink px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-label text-brand-ink',
  completed: 'inline-flex items-center px-0 py-0.5 text-[11px] font-medium uppercase tracking-label text-brand-muted',
  cancelled: 'inline-flex items-center px-0 py-0.5 text-[11px] font-medium uppercase tracking-label text-brand-subtle line-through',
};

const labels: Record<BookingStatus, string> = {
  active: 'Active', pending: 'Pending', completed: 'Completed', cancelled: 'Cancelled',
};

export default function StatusBadge({ status }: { status: BookingStatus }) {
  return <span className={styles[status] ?? styles.pending}>{labels[status] ?? 'Unknown'}</span>;
}
