import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Farm2Market | Premium Agricultural Marketplace',
  description: 'Connect directly with local farmers and source premium agricultural products.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className={`${inter.className} min-h-screen antialiased bg-background text-foreground`}>
        {children}
      </body>
    </html>
  );
}
