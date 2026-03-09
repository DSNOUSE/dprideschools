import { Metadata } from 'next';
import { defaultMetadata } from '@/lib/metadata';
import Container from '@/components/Container';

export const metadata: Metadata = {
  title: 'Messages | DPRIDE Admin',
  description: 'Manage internal communications and messages',
};

export default function MessengerPage() {
  return (
    <Container>
      <div className="py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Messages</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 00-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8-3.582 9-9 4.418 0 8-3.582 8-9z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Internal Messages</h2>
            <p className="text-gray-600 mb-6">Message management will be available here.</p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-700">
                <strong>Coming Soon:</strong> Complete internal messaging and communication system.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
