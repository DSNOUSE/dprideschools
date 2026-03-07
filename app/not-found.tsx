import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '404 - Page Not Found | DPRIDE International School',
  description: 'The page you are looking for could not be found.',
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-6">
          <div className="text-6xl font-bold text-blue-600 mb-4">404</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Page Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Home
          </Link>
          <Link
            href="/contact"
            className="block w-full px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
          >
            Contact Us
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 text-sm">
          <Link href="/our-school" className="text-blue-600 hover:underline">
            Our School
          </Link>
          <Link href="/calendar" className="text-blue-600 hover:underline">
            Calendar
          </Link>
          <Link href="/results" className="text-blue-600 hover:underline">
            Results
          </Link>
          <Link href="/apply" className="text-blue-600 hover:underline">
            Apply Now
          </Link>
        </div>
      </div>
    </div>
  );
}
