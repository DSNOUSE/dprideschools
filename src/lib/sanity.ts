import { createClient } from 'next-sanity';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;

type SanityClient = ReturnType<typeof createClient>;
let client: SanityClient | null = null;

if (projectId && dataset) {
  client = createClient({
    projectId,
    dataset,
    apiVersion: '2024-01-01',
    useCdn: true,
  });
}

export { client };

export async function sanityFetch<T = unknown>(
  query: string,
  params?: Record<string, unknown>
): Promise<T | null> {
  if (!client) {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.warn('[sanity] Missing projectId/dataset; returning null for query.');
    }
    return null;
  }
  // @ts-expect-error next-sanity client fetch typing is broad
  return client.fetch<T>(query, params);
}
