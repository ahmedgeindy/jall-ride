import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Input }    from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import Sidebar      from '@/components/Sidebar';
import EmptyState   from '@/components/EmptyState';
import api from '@/api/client';
import type { Car } from '@/types';

export default function FleetPage() {
  const [cars,    setCars   ] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch ] = useState('');

  useEffect(() => { document.title = 'Fleet · Jall Admin'; }, []);

  useEffect(() => {
    api.get<Car[]>('/cars?all=true')
      .then(res => setCars(res.data))
      .catch(() => toast.error('Failed to load fleet'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = cars.filter(car => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      car.plate.toLowerCase().includes(q) ||
      car.make.toLowerCase().includes(q) ||
      car.model.toLowerCase().includes(q) ||
      (car.color ?? '').toLowerCase().includes(q)
    );
  });

  async function toggleAvailability(car: Car) {
    const prev = car.available;
    setCars(list => list.map(c => c.id === car.id ? { ...c, available: !prev } : c));
    try {
      await api.patch(`/cars/${car.id}/availability`, { available: !prev });
      toast.success(`${car.make} ${car.model} marked as ${!prev ? 'available' : 'busy'}`);
    } catch {
      setCars(list => list.map(c => c.id === car.id ? { ...c, available: prev } : c));
      toast.error('Failed to update availability');
    }
  }

  return (
    <div className="flex min-h-screen bg-brand-canvas">
      <Sidebar />
      <main id="main-content" className="flex-1 overflow-auto p-6 pt-16 md:p-8 md:pt-8">
        <div className="mx-auto max-w-5xl">
          <h1 className="mb-6 text-2xl font-semibold tracking-tightish text-brand-ink">Fleet</h1>

          <div className="mb-4">
            <Input
              placeholder="Search plate, make, model…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-brand-paper border-brand-hairline sm:max-w-sm"
            />
          </div>

          <div className="overflow-hidden rounded-md border border-brand-hairline bg-brand-paper">
            {loading ? (
              <div className="space-y-2 p-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full rounded" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState
                message={search ? 'No matching vehicles' : 'No vehicles in fleet'}
                hint={search ? 'Try a different search term' : 'Add vehicles to get started'}
              />
            ) : (
              <>
                <div className="md:hidden divide-y divide-brand-hairline">
                  {filtered.map((car) => (
                    <div key={car.id} className="flex items-center justify-between gap-3 px-4 py-3">
                      <div className="min-w-0 flex-1">
                        <div className="font-mono text-sm font-semibold text-brand-muted">{car.plate}</div>
                        <div className="text-sm font-medium text-brand-ink">{car.make} {car.model}</div>
                        <div className="text-xs text-brand-subtle">{car.color ?? '—'} · {car.seats} seats</div>
                      </div>
                      <div className="flex flex-shrink-0 items-center gap-3">
                        {car.available ? (
                          <span className="inline-flex items-center rounded-sm border border-brand-ink px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-label text-brand-ink">
                            Available
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-0 py-0.5 text-[11px] font-medium uppercase tracking-label text-brand-muted">
                            Busy
                          </span>
                        )}
                        <button
                          onClick={() => toggleAvailability(car)}
                          className="min-h-[44px] text-[11px] font-medium uppercase tracking-label text-brand-muted underline decoration-brand-hairline underline-offset-4 transition-colors hover:text-brand-ink hover:decoration-brand-accent"
                        >
                          {car.available ? 'Set busy' : 'Set available'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-brand-canvas">
                        <TableHead>Plate</TableHead>
                        <TableHead>Make &amp; Model</TableHead>
                        <TableHead className="hidden sm:table-cell">Color</TableHead>
                        <TableHead className="hidden sm:table-cell">Seats</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((car) => (
                        <TableRow
                          key={car.id}
                          className="border-b border-brand-hairline hover:bg-brand-canvas transition-colors"
                        >
                          <TableCell className="font-mono text-sm font-semibold text-brand-muted">
                            {car.plate}
                          </TableCell>
                          <TableCell className="font-medium text-brand-ink">
                            {car.make} {car.model}
                          </TableCell>
                          <TableCell className="hidden text-brand-muted sm:table-cell">
                            {car.color ?? '—'}
                          </TableCell>
                          <TableCell className="hidden text-brand-muted sm:table-cell">
                            {car.seats}
                          </TableCell>
                          <TableCell>
                            {car.available ? (
                              <span className="inline-flex items-center rounded-sm border border-brand-ink px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-label text-brand-ink">
                                Available
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-0 py-0.5 text-[11px] font-medium uppercase tracking-label text-brand-muted">
                                Busy
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <button
                              onClick={() => toggleAvailability(car)}
                              className="text-[11px] font-medium uppercase tracking-label text-brand-muted underline decoration-brand-hairline underline-offset-4 transition-colors hover:text-brand-ink hover:decoration-brand-accent"
                            >
                              {car.available ? 'Set busy' : 'Set available'}
                            </button>
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
