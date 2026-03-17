"use client";

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AdminSignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-semibold mb-2 text-gray-800">Admin Sign in</h1>
        <p className="text-sm text-gray-500 mb-6">- login with your admin details -</p>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              className="w-full bg-gray-100 px-4 py-3 rounded-lg focus:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <div className="relative">
              <input
                className="w-full bg-gray-100 px-4 py-3 pr-12 rounded-lg focus:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? 'text' : 'password'}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 015.12 5.12M3 3l3.59 3.59" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-9.543 7" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <div>
            <button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium disabled:opacity-60 transition-colors shadow-sm"
              disabled={loading}
              type="submit"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </div>
          <div className="text-center text-sm text-gray-600">
            Having issues, contact the{' '}
            <a 
              href="mailto:dsnousee@gmail.com" 
              className="text-blue-600 hover:text-blue-700 underline"
            >
              Tech Team
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
