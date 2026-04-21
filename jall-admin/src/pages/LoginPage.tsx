import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button }   from '@/components/ui/button';
import { Input }    from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/api/client';

export default function LoginPage() {
  const [email,    setEmail   ] = useState('admin@jall.com');
  const [password, setPassword] = useState('');
  const [loading,  setLoading ] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { document.title = 'Sign in · Jall Admin'; }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post<{ token: string }>('/auth/login', { email, password });
      localStorage.setItem('jall_token', res.data.token);
      navigate('/');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error
        ?? 'Invalid credentials';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-canvas">
      <div className="w-full max-w-sm px-4">
        <div className="mb-10 text-center">
          <h1 className="text-2xl font-semibold uppercase tracking-[0.3em] text-brand-ink">
            JALL
          </h1>
          <p className="mt-2 text-[11px] font-medium uppercase tracking-label text-brand-muted">
            Luxury Ride — Admin Console
          </p>
        </div>

        <Card className="border border-brand-hairline bg-brand-paper shadow-none rounded-md">
          <CardHeader className="pb-4 pt-8">
            <CardTitle className="text-center text-lg font-semibold tracking-tightish text-brand-ink">
              Sign in
            </CardTitle>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[11px] font-medium uppercase tracking-label text-brand-muted" htmlFor="email">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@jall.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="border-brand-hairline rounded-sm focus-visible:ring-brand-accent-ink"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-medium uppercase tracking-label text-brand-muted" htmlFor="password">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="border-brand-hairline rounded-sm focus-visible:ring-brand-accent-ink"
                />
              </div>
              <Button
                type="submit"
                className="w-full rounded-sm bg-brand-ink text-brand-canvas hover:bg-brand-ink/90 font-medium tracking-tightish"
                disabled={loading}
              >
                {loading ? 'Signing in…' : 'Sign in'}
              </Button>
            </form>
            {import.meta.env.DEV && (
              <p className="mt-6 text-center text-[11px] uppercase tracking-label text-brand-subtle">
                Dev: admin@jall.com · admin123
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
