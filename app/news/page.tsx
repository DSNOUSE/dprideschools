import Link from 'next/link';
import { sanityFetch } from '@/lib/sanity';
import { newsQuery } from '@/lib/queries';

export default async function NewsPage() {
  const items = (await sanityFetch(newsQuery).catch(() => [])) as any[] || [];

  return (
    <main className="min-h-screen bg-white">
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">News & Announcements</h1>
          {!items || items.length === 0 ? (
            <p className="text-gray-600">No news items yet.</p>
          ) : (
            <ul className="space-y-6">
              {items.map((item: any) => (
                <li key={item.slug?.current} className="border-b pb-6">
                  <Link href={`/news/${item.slug?.current}`} className="group">
                    <h2 className="text-xl font-semibold group-hover:text-blue-600">{item.title}</h2>
                    <time className="text-sm text-gray-500">
                      {new Date(item.publishedAt).toLocaleDateString()}
                    </time>
                    <p className="mt-2 text-gray-700">{item.excerpt}</p>
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
