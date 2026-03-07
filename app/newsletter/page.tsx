import Link from 'next/link';
import { sanityFetch } from '@/lib/sanity';
import { newsletterQuery } from '@/lib/queries';

export default async function NewsletterPage() {
  const items = (await sanityFetch(newsletterQuery).catch(() => [])) as any[] || [];

  return (
    <main className="min-h-screen bg-white">
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">Newsletters</h1>
          {!items || items.length === 0 ? (
            <p className="text-gray-600">No newsletters yet.</p>
          ) : (
            <ul className="space-y-4">
              {items.map((item: any) => (
                <li key={item.file?.url} className="border-b pb-4">
                  <Link
                    href={item.file?.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block"
                  >
                    <h3 className="text-lg font-medium group-hover:text-blue-600">
                      {item.title}
                    </h3>
                    <time className="text-sm text-gray-500">
                      {new Date(item.publishedAt).toLocaleDateString()}
                    </time>
                    <span className="text-sm text-blue-600 group-hover:text-blue-700">
                      → Download PDF
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}
