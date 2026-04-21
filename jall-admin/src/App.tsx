import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster }        from '@/components/ui/sonner';
import ProtectedRoute     from '@/components/ProtectedRoute';
import LoginPage          from '@/pages/LoginPage';
import OverviewPage       from '@/pages/OverviewPage';
import BookingsPage       from '@/pages/BookingsPage';
import FleetPage          from '@/pages/FleetPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/"         element={<OverviewPage />} />
          <Route path="/bookings" element={<BookingsPage />} />
          <Route path="/fleet"    element={<FleetPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster
        position="top-right"
        toastOptions={{
          classNames: {
            toast: 'bg-brand-ink text-brand-canvas border border-brand-accent/40 rounded-sm shadow-none',
            title: 'text-sm font-medium tracking-tightish',
            description: 'text-xs text-brand-subtle',
          },
        }}
      />
    </BrowserRouter>
  );
}
