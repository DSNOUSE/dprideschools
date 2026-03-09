import { Metadata } from 'next';
import { defaultMetadata } from '@/lib/metadata';
import Container from '@/components/Container';

export const metadata: Metadata = {
  title: 'Academic Classes | DPRIDE Admin',
  description: 'Manage academic classes and class assignments',
};

export default function ClassesPage() {
  return (
    <Container>
      <div className="py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Academic Classes</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Academic Classes</h2>
            <p className="text-gray-600 mb-6">Class management will be available here.</p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-700">
                <strong>Coming Soon:</strong> Complete class management and assignment system.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
