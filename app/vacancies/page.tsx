export default function VacanciesPage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">Vacancies</h1>
          <p className="text-gray-600 mb-4">There are no vacancies at the moment. Please check back later.</p>
          <p className="text-sm text-gray-500">
            If you would like to be considered for future openings, please send your CV to{' '}
            <a href="mailto:office@dprideschools.com" className="text-blue-600 hover:underline">
              office@dprideschools.com
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}
