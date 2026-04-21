import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, Car, LogOut, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/',         label: 'Overview', icon: LayoutDashboard },
  { href: '/bookings', label: 'Bookings', icon: CalendarDays    },
  { href: '/fleet',    label: 'Fleet',    icon: Car             },
] as const;

function NavLinks({ onClose }: { onClose?: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem('jall_token');
    navigate('/login');
  }

  return (
    <div className="flex h-full flex-col bg-brand-ink text-brand-canvas">
      <div className="flex h-16 items-center border-b border-white/10 px-6">
        <span className="text-sm font-semibold uppercase tracking-label text-brand-canvas">
          JALL
        </span>
        <span className="ml-2 text-[11px] uppercase tracking-label text-brand-subtle">
          · Admin
        </span>
      </div>

      <nav className="flex-1 space-y-px px-3 py-5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const isActive = location.pathname === href;
          return (
            <Link
              key={href}
              to={href}
              onClick={onClose}
              className={cn(
                'group relative flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'text-brand-canvas'
                  : 'text-brand-subtle hover:text-brand-canvas'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="h-4 w-4 flex-shrink-0" strokeWidth={1.5} />
              {label}
              {isActive && (
                <span
                  aria-hidden
                  className="absolute bottom-1 left-3 right-3 h-px bg-brand-accent"
                />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-3">
        <button
          onClick={logout}
          className="flex min-h-[44px] items-center gap-2 px-2 text-[11px] font-medium uppercase tracking-label text-brand-subtle transition-colors hover:text-brand-canvas"
        >
          <LogOut size={14} strokeWidth={1.5} />
          Sign out
        </button>
      </div>
    </div>
  );
}

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-50 flex h-11 w-11 items-center justify-center rounded-lg bg-brand-ink text-brand-canvas md:hidden safe-area-top"
        style={{ left: 'max(1rem, env(safe-area-inset-left))', top: 'max(1rem, env(safe-area-inset-top))' }}
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-[280px] transform transition-transform duration-200 md:hidden safe-area-x',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{ paddingLeft: 'max(0px, env(safe-area-inset-left))' }}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute right-3 top-4 flex h-11 w-11 items-center justify-center text-brand-subtle hover:text-brand-canvas"
          aria-label="Close menu"
        >
          <X size={20} />
        </button>
        <NavLinks onClose={() => setMobileOpen(false)} />
      </div>

      <aside className="hidden w-[220px] flex-shrink-0 md:block">
        <div className="fixed h-full w-[220px]">
          <NavLinks />
        </div>
      </aside>
    </>
  );
}
