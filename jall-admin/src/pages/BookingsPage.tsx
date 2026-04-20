import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Input }    from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import Sidebar      from '@/components/Sidebar';
import StatusBadge  from '@/components/StatusBadge';
import EmptyState   from '@/components/EmptyState';
import { useBookings }  from '@/hooks/useBookings';
import api from '@/api/client';
import type { Booking, BookingStatus, Driver } from '@/types';

const STATUS_TABS: { value: '' | BookingStatus; label: string }[] = [
  { value: '',           label: 'All'       },
  { value: 'pending',    label: 'Pending'   },
  { value: 'active',     label: 'Active'    },
  { value: 'completed',  label: 'Completed' },
  { value: 'cancelled',  label: 'Cancelled' },
];

export default function BookingsPage() {
  const [search,         setSearch        ] = useState('');
  const [debouncedSearch,setDebouncedSearch] = useState('');
  const [activeStatus,   setActiveStatus  ] = useState<'' | BookingStatus>('');
  const [drivers,        setDrivers       ] = useState<Driver[]>([]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    api.get<Driver[]>('/drivers?available=true')
      .then(res => setDrivers(res.data))
      .catch(() => {});
  }, []);

  const { bookings, setBookings, loading } = useBookings({
    status: activeStatus,
    search: debouncedSearch,
  });

  async function handleStatusChange(booking: Booking, newStatus: BookingStatus) {
    const prev = booking.status;
    setBookings(list => list.map(b => b.id === booking.id ? { ...b, status: newStatus } : b));
    try {
      await api.patch(`/bookings/${booking.id}/status`, { status: newStatus });
      toast.success('Status updated');
    } catch {
      setBookings(list => list.map(b => b.id === booking.id ? { ...b, status: prev } : b));
      toast.error('Failed to update status');
    }
  }

  async function handleAssignDriver(booking: Booking, driverIdStr: string) {
    const prevDriverId   = booking.driver_id;
    const prevDriverName = booking.driver_name;
    const driver         = drivers.find(d => d.id === parseInt(driverIdStr, 10));

    setBookings(list =>
      list.map(b => b.id === booking.id
        ? { ...b, driver_id: parseInt(driverIdStr, 10), driver_name: driver?.name }
        : b
      )
    );
    try {
      await api.patch(`/bookings/${booking.id}/assign`, { driverId: parseInt(driverIdStr, 10) });
      toast.success('Driver assigned');
    } catch {
      setBookings(list =>
        list.map(b => b.id === booking.id
          ? { ...b, driver_id: prevDriverId, driver_name: prevDriverName }
          : b
        )
      );
      toast.error('Failed to assign driver');
    }
  }

  return (
    <div className="flex min-h-screen bg-brand-canvas">
      <Sidebar />
      <main className="flex-1 overflow-auto p-6 pt-16 md:p-8 md:pt-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="mb-6 text-2xl font-semibold tracking-tightish text-brand-ink">Bookings</h1>

          <div className="mb-4">
            <Input
              placeholder="Search client, pickup, destination…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="max-w-sm bg-brand-paper border-brand-hairline"
            />
          </div>

          <div className="mb-6 flex flex-wrap gap-6 border-b border-brand-hairline">
            {STATUS_TABS.map(tab => {
              const isActive = activeStatus === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => setActiveStatus(tab.value)}
                  className={[
                    'relative pb-3 text-[11px] font-medium uppercase tracking-label transition-colors',
                    isActive ? 'text-brand-ink' : 'text-brand-muted hover:text-brand-ink',
                  ].join(' ')}
                  aria-pressed={isActive}
                >
                  {tab.label}
                  {isActive && (
                    <span
                      aria-hidden
                      className="absolute -bottom-px left-0 right-0 h-0.5 bg-brand-accent"
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div className="overflow-hidden rounded-md border border-brand-hairline bg-brand-paper">
            {loading ? (
              <div className="space-y-2 p-4">
                {Array.from({ length: 7 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full rounded" />
                ))}
              </div>
            ) : bookings.length === 0 ? (
              <EmptyState />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-brand-canvas">
                    <TableHead className="w-16">ID</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Pickup</TableHead>
                    <TableHead className="hidden lg:table-cell">Destination</TableHead>
                    <TableHead className="hidden md:table-cell">Date</TableHead>
                    <TableHead>Assign Driver</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow
                      key={booking.id}
                      className="border-b border-brand-hairline hover:bg-brand-canvas transition-colors"
                    >
                      <TableCell className="font-mono text-xs text-brand-subtle">
                        #{booking.id}
                      </TableCell>
                      <TableCell className="font-medium text-brand-ink">
                        {booking.client_name ?? '—'}
                      </TableCell>
                      <TableCell className="max-w-[140px] truncate text-sm text-brand-muted">
                        {booking.pickup_location}
                      </TableCell>
                      <TableCell className="hidden max-w-[140px] truncate text-sm text-brand-muted lg:table-cell">
                        {booking.destination}
                      </TableCell>
                      <TableCell className="hidden text-sm text-brand-subtle md:table-cell">
                        {booking.ride_date}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={booking.driver_id?.toString() ?? ''}
                          onValueChange={val => handleAssignDriver(booking, val)}
                        >
                          <SelectTrigger className="h-8 w-36 text-xs border-brand-hairline">
                            <SelectValue placeholder="Assign…" />
                          </SelectTrigger>
                          <SelectContent>
                            {drivers.map(d => (
                              <SelectItem key={d.id} value={d.id.toString()}>
                                {d.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={booking.status}
                          onValueChange={val =>
                            handleStatusChange(booking, val as BookingStatus)
                          }
                        >
                          <SelectTrigger className="h-8 w-36 text-xs border-brand-hairline">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {(['pending', 'active', 'completed', 'cancelled'] as BookingStatus[]).map(s => (
                              <SelectItem key={s} value={s}>
                                <StatusBadge status={s} />
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
