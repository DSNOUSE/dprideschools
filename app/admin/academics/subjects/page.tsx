import { Metadata } from 'next';
import { defaultMetadata } from '@/lib/metadata';
import Container from '@/components/Container';

export const metadata: Metadata = {
  title: 'Academic Subjects | DPRIDE Admin',
  description: 'Manage academic subjects and curriculum',
};

export default function SubjectsPage() {
  return (
    <Container>
      <div className="py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Academic Subjects</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 19 7.5 19s3.332-.523 4.5-1.253V6.253z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Academic Subjects</h2>
            <p className="text-gray-600 mb-6">Subject management will be available here.</p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-700">
                <strong>Coming Soon:</strong> Full subject management system with curriculum tracking.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
