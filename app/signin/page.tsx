'use client';

import { useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useEffect } from 'react';
import { Button } from '@/components/Button';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  // Handle role-based redirection after successful login
  useEffect(() => {
    if (status === 'authenticated' && session) {
      const userRole = (session.user as any)?.role;
      const roles = (session.user as any)?.roles || [];
      
      console.log('User logged in with role:', userRole, 'roles:', roles);
      
      // Redirect based on role
      if (userRole === 'Administrator' || userRole === 'Teacher' || roles.includes('Administrator') || roles.includes('Teacher')) {
        console.log('Redirecting to admin dashboard');
        router.push('/admin');
      } else if (userRole === 'parent' || roles.includes('parent')) {
        console.log('Redirecting parent to results');
        router.push('/results');
      } else if (userRole === 'student' || roles.includes('student')) {
        console.log('Redirecting student to personal results');
        const admissionNo = (session.user as any)?.admissionNo;
        
        if (admissionNo) {
          // Smart redirect to dedicated student results page
          console.log('Smart redirect to student results page');
          router.push(`/student-results?student=${admissionNo}`);
        } else {
          // Fallback to general results page
          console.log('Fallback to general results page - missing admission number');
          router.push('/results');
        }
      } else {
        console.log('Default redirect to results');
        router.push('/results');
      }
    }
  }, [session, status, router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Try login with email (works for both parents and students)
    const res = await signIn('credentials', { 
      email, 
      password, 
      redirect: false 
    });
    
    setLoading(false);
    if (!res?.ok) {
      setError('Invalid credentials');
    }
    // Note: Redirection will be handled by useEffect based on session
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 to-blue-700/40 z-10" />
        <Image
          src="/images/toddler-girl.jpg"
          alt="DPRIDE International School"
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
          priority
        />
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Logo for mobile */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-blue-900 flex items-center justify-center text-white text-xl font-bold">
              D
            </div>
            <h1 className="text-3xl font-bold text-gray-900">DPRIDE</h1>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
              <p className="text-gray-600">Sign in to access your portal</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={onSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email or Admission Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    @
                  </div>
                  <input 
                    className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
                    type="text" 
                    placeholder="parent1@dprideschools.com or DPS2024001"
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    autoComplete="email"
                    required 
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    *
                  </div>
                  <input 
                    className="w-full border border-gray-300 rounded-lg pl-10 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
                    type={showPassword ? 'text' : 'password'} 
                    placeholder="Enter your password"
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    autoComplete="current-password"
                    required 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <span className="text-xs font-semibold">
                      {showPassword ? 'Hide' : 'Show'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                  <span className="ml-2 text-sm text-gray-600">Remember me</span>
                </label>
                <a href="#" className="text-sm text-blue-600 hover:text-blue-700">
                  Forgot password?
                </a>
              </div>

              <Button
                disabled={loading}
                variant="blue"
                size="lg"
                className="w-full"
                type="submit"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm font-semibold text-blue-900 mb-2">Login Options:</p>
              <div className="space-y-1 text-sm text-blue-700">
                <p>• Teachers/Admins: Use your email + password</p>
                <p>• Parents: Use email + Password123!</p>
                <p>• Students: Use admission number + same number as password</p>
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                  Contact Admin
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
