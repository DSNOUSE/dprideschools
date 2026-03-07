import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://dprideschools.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/admin-signin',
          '/signin',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
