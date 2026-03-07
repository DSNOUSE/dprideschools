import { notFound } from 'next/navigation';
import { sanityFetch } from '@/lib/sanity';

interface NewsPost {
  title: string;
  slug: { current: string };
  publishedAt: string;
  body: any[];
}

export default async function NewsPostPage({ params }: { params: { slug: string } }) {
  const query = `*[_type == "news" && slug.current == $slug][0]{
    title,
    slug,
    publishedAt,
    body
  }`;
  const post: NewsPost | null = (await sanityFetch(query, { slug: params.slug }).catch(() => null)) as NewsPost | null;

  if (!post) notFound();

  return (
    <main className="min-h-screen bg-white">
      <article className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
          <time className="text-sm text-gray-500">
            {new Date(post.publishedAt).toLocaleDateString()}
          </time>
          <div className="mt-8 prose max-w-none">
            {post.body.map((block, i) => (
              <p key={i}>{block.children?.[0]?.text}</p>
            ))}
          </div>
        </div>
      </article>
    </main>
  );
}
