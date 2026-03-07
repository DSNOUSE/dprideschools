"use client";

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AdminSignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    let res: any = null;
    try {
      res = await signIn('credentials', {
        redirect: false,
        email,
        password,
        callbackUrl: '/admin/dashboard',
      } as any);
      // debug: log signIn response to help diagnose silent failures
      // eslint-disable-next-line no-console
      console.log('signIn response', res);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('signIn error', err);
    }
    setLoading(false);
    if (res && res.ok) {
      try {
        router.push('/admin/dashboard');
      } catch (e) {
        // fallback to full redirect if router push doesn't work
        // eslint-disable-next-line no-console
        console.warn('router.push failed, falling back to location.href', e);
        window.location.href = '/admin/dashboard';
      }
    } else {
      setError((res as any)?.error || 'Sign in failed');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#D9FFD1] bg-transparent">
      <div className="w-full max-w-md p-6 bg-white rounded shadow">
        <h1 className="text-2xl font-semibold mb-4">Admin Sign in</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              className="mt-1 w-full border px-3 py-2 rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Password</label>
            <input
              className="mt-1 w-full border px-3 py-2 rounded"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
            />
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <div>
            <button
              className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-60"
              disabled={loading}
              type="submit"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
