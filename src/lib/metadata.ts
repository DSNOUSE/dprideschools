/**
 * Shared SEO Metadata Configuration
 * 
 * Provides consistent metadata across the application
 */

import { Metadata } from 'next';

const siteUrl = process.env.NEXTAUTH_URL || 'https://dprideschools.com';
const siteName = 'DPRIDE International School';
const siteDescription =
  'DPRIDE International School, Abuja - Providing high-quality western education while nurturing strong moral values. Grooming children for academic excellence and character development.';

export const defaultMetadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} - Education Excellence in Abuja`,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  icons: {
    icon: '/images/favicon.png',
    shortcut: '/images/favicon.png',
    apple: '/images/favicon.png',
  },
  keywords: [
    'DPRIDE International School',
    'international school Abuja',
    'nursery school Abuja',
    'primary school Abuja',
    'secondary school Abuja',
    'best school in Abuja',
    'quality education Nigeria',
    'private school Abuja',
    'British curriculum Abuja',
    'DPRIDE School',
  ],
  authors: [{ name: siteName }],
  creator: siteName,
  publisher: siteName,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: siteName,
    title: siteName,
    description: siteDescription,
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: `${siteName} - Education Excellence`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteName,
    description: siteDescription,
    images: ['/images/og-image.jpg'],
    creator: '@dprideschools',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // bing: 'your-bing-verification-code',
  },
};

export function createPageMetadata(
  title: string,
  description: string,
  path?: string,
  image?: string
): Metadata {
  const url = path ? `${siteUrl}${path}` : siteUrl;
  const ogImage = image || '/images/og-image.jpg';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: siteName,
      type: 'website',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
    alternates: {
      canonical: url,
    },
  };
}
