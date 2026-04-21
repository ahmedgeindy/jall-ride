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

function emptyMessage(status: '' | BookingStatus, search: string) {
  if (search) return { message: 'No matching bookings', hint: 'Try a different search term' };
  if (status === 'pending')   return { message: 'No pending bookings', hint: 'All bookings have been processed' };
  if (status === 'active')    return { message: 'No active rides', hint: 'Active rides will appear here' };
  if (status === 'completed') return { message: 'No completed bookings yet', hint: 'Completed rides appear here after finishing' };
  if (status === 'cancelled') return { message: 'No cancelled bookings', hint: 'A clean slate' };
  return { message: 'No bookings yet', hint: 'New bookings will appear here' };
}

const isResolved = (s: BookingStatus) => s === 'completed' || s === 'cancelled';

export default function BookingsPage() {
  const [search,         setSearch        ] = useState('');
  const [debouncedSearch,setDebouncedSearch] = useState('');
  const [activeStatus,   setActiveStatus  ] = useState<'' | BookingStatus>('');
  const [drivers,        setDrivers       ] = useState<Driver[]>([]);

  useEffect(() => { document.title = 'Bookings · Jall Admin'; }, []);

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

  const isSearching = search !== debouncedSearch;

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
      <main id="main-content" className="flex-1 overflow-auto p-6 pt-16 md:p-8 md:pt-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="mb-6 text-2xl font-semibold tracking-tightish text-brand-ink">Bookings</h1>

          <div className="mb-4 relative">
            <Input
              placeholder="Search client, pickup, destination…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-brand-paper border-brand-hairline sm:max-w-sm"
            />
            {isSearching && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 rounded-full border border-brand-hairline border-t-brand-muted animate-spin sm:right-[calc(100%-13rem)]" />
            )}
          </div>

          <div className="mb-6 -mx-6 overflow-x-auto scrollbar-none px-6 md:mx-0 md:px-0">
            <div className="flex gap-4 border-b border-brand-hairline">
              {STATUS_TABS.map(tab => {
                const isActive = activeStatus === tab.value;
                return (
                  <button
                    key={tab.value}
                    onClick={() => setActiveStatus(tab.value)}
                    className={[
                      'relative whitespace-nowrap pb-3 text-[11px] font-medium uppercase tracking-label transition-colors',
                      isActive ? 'text-brand-ink' : 'text-brand-muted hover:text-brand-ink',
                    ].join(' ')}
                    aria-pressed={isActive}
                  >
                    {tab.label}
                    {isActive && (
                      <span
                        aria-hidden
                        className="absolute -bottom-px left-0 right-0 h-0.5 bg-brand-ink"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="overflow-hidden rounded-md border border-brand-hairline bg-brand-paper">
            {loading ? (
              <div className="space-y-2 p-4">
                {Array.from({ length: 7 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full rounded" />
                ))}
              </div>
            ) : bookings.length === 0 ? (
              <EmptyState {...emptyMessage(activeStatus, debouncedSearch)} />
            ) : (
              <>
                <div className="md:hidden divide-y divide-brand-hairline">
                  {bookings.map((booking) => (
                    <div key={booking.id} className={`px-4 py-3 space-y-3 transition-opacity ${isResolved(booking.status) ? 'opacity-50' : ''}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs text-brand-subtle">#{booking.id}</span>
                        <StatusBadge status={booking.status} />
                      </div>
                      <div className="space-y-0.5">
                        <div className="text-sm font-medium text-brand-ink">{booking.client_name ?? '—'}</div>
                        <div className="text-sm text-brand-muted truncate">{booking.pickup_location}{booking.destination ? ` → ${booking.destination}` : ''}</div>
                        {booking.ride_date && (
                          <div className="text-xs text-brand-subtle">{booking.ride_date}</div>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="mb-1 text-[10px] uppercase tracking-label text-brand-subtle">Driver</div>
                          <Select
                            value={booking.driver_id?.toString() ?? ''}
                            onValueChange={val => handleAssignDriver(booking, val)}
                          >
                            <SelectTrigger className="h-9 w-full text-xs border-brand-hairline">
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
                        </div>
                        <div>
                          <div className="mb-1 text-[10px] uppercase tracking-label text-brand-subtle">Status</div>
                          <Select
                            value={booking.status}
                            onValueChange={val =>
                              handleStatusChange(booking, val as BookingStatus)
                            }
                          >
                            <SelectTrigger className="h-9 w-full text-xs border-brand-hairline">
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
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="hidden md:block">
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
                          className={`border-b border-brand-hairline hover:bg-brand-canvas transition-colors ${isResolved(booking.status) ? 'opacity-50' : ''}`}
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
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
