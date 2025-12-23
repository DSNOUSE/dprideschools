import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DPRIDE International School Admin',
  description: 'Admin portal',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
