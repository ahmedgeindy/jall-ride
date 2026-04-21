import { useEffect } from 'react';
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { BookOpen, Zap, Banknote, Car } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton }      from '@/components/ui/skeleton';
import Sidebar           from '@/components/Sidebar';
import StatCard          from '@/components/StatCard';
import BookingTable      from '@/components/BookingTable';
import { useDashboardStats } from '@/hooks/useDashboardStats';

function formatSAR(amount: number) {
  return `SAR ${Math.round(amount).toLocaleString('en-SA')}`;
}

export default function OverviewPage() {
  const { stats, loading, error } = useDashboardStats();

  useEffect(() => { document.title = 'Overview · Jall Admin'; }, []);

  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <div className="flex min-h-screen bg-brand-canvas">
      <Sidebar />
      <main id="main-content" className="flex-1 overflow-auto p-6 pt-16 md:p-8 md:pt-8">
        <div className="mx-auto max-w-6xl">
          <h1 className="mb-8 text-2xl font-semibold tracking-tightish text-brand-ink">Overview</h1>

          {error && (
            <div className="mb-6 rounded-sm border border-brand-hairline bg-brand-paper px-4 py-3 text-sm text-brand-muted">
              {error} —{' '}
              <button
                onClick={() => window.location.reload()}
                className="font-medium text-brand-ink underline underline-offset-4 decoration-brand-hairline hover:decoration-brand-accent transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 rounded-md" />
                ))
              : (
                <>
                  <StatCard
                    title="Total Bookings" value={stats?.totalBookings ?? 0}
                    icon={BookOpen}
                  />
                  <StatCard
                    title="Active Rides" value={stats?.activeRides ?? 0}
                    icon={Zap}
                  />
                  <StatCard
                    title="Revenue Today" value={formatSAR(stats?.revenueToday ?? 0)}
                    icon={Banknote}
                  />
                  <StatCard
                    title="Available Cars" value={stats?.availableCars ?? 0}
                    icon={Car}
                  />
                </>
              )}
          </div>

          <Card className="mb-6 border border-brand-hairline shadow-none rounded-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-brand-muted">
                Bookings — Last 7 Days
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-56 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart
                    data={stats?.bookingsPerDay ?? []}
                    margin={{ top: 4, right: 8, bottom: 4, left: -12 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8E4DA" />
                    <XAxis
                      dataKey="date" tick={{ fontSize: 11, fill: '#6B6B6B' }}
                      tickLine={false} axisLine={false}
                    />
                    <YAxis
                      allowDecimals={false} tick={{ fontSize: 11, fill: '#6B6B6B' }}
                      tickLine={false} axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 4,
                        border: '1px solid #E8E4DA',
                        fontSize: 13,
                        fontFamily: 'inherit',
                      }}
                      cursor={{ fill: 'rgba(11,11,15,0.04)' }}
                    />
                    <Bar dataKey="count" name="Bookings" radius={[2, 2, 0, 0]}>
                      {(stats?.bookingsPerDay ?? []).map((entry, i) => (
                        <Cell key={i} fill={entry.date === todayStr ? '#B8893B' : '#0B0B0F'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card className="border border-brand-hairline shadow-none rounded-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-brand-muted">Recent Bookings</CardTitle>
            </CardHeader>
            <CardContent className="p-0 pb-1">
              {loading ? (
                <div className="space-y-2 p-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-full rounded" />
                  ))}
                </div>
              ) : (
                <BookingTable bookings={stats?.recentBookings ?? []} />
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
