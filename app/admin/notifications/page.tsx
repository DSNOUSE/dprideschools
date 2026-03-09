import { Metadata } from 'next';
import { defaultMetadata } from '@/lib/metadata';
import Container from '@/components/Container';

export const metadata: Metadata = {
  title: 'Notifications | DPRIDE Admin',
  description: 'Manage system notifications and communications',
};

export default function NotificationsPage() {
  return (
    <Container>
      <div className="py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Notifications</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5m-5 0v-5a2 2 0 00-2-2H7a2 2 0 00-2 2v5m5 0h5m-5 0a1 1 0 01-1 1h-5a1 1 0 01-1-1v-5a1 1 0 011-1h5a1 1 0 011 1v5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">System Notifications</h2>
            <p className="text-gray-600 mb-6">Notification management will be available here.</p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-700">
                <strong>Coming Soon:</strong> Complete notification and messaging system.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
