import type { Metadata } from 'next';
import { Lato } from 'next/font/google';
import '@/app/globals.css';
import Navbar from '@/components/Navbar';
import Providers from '@/components/Providers';
import { defaultMetadata } from '@/lib/metadata';

const lato = Lato({ subsets: ['latin'], weight: ['400', '700'], display: 'swap' });

export const metadata: Metadata = defaultMetadata;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={lato.className}>
        {/* Background layer with transparency */}
        <div className="bg-layer" />
        
        {/* Content layer - fully opaque */}
        <div className="content-layer">
          <Providers>
            <Navbar />
            {children}
          </Providers>
        </div>
      </body>
    </html>
  );
}
