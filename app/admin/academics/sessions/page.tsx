import { Metadata } from 'next';
import { defaultMetadata } from '@/lib/metadata';
import Container from '@/components/Container';

export const metadata: Metadata = {
  title: 'Academic Sessions | DPRIDE Admin',
  description: 'Manage academic sessions and terms',
};

export default function SessionsPage() {
  return (
    <Container>
      <div className="py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Academic Sessions</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Academic Sessions</h2>
            <p className="text-gray-600 mb-6">Session management will be available here.</p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-700">
                <strong>Coming Soon:</strong> Complete session and term management system.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
