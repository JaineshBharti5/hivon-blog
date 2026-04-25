import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Hivon Blog — Insights & Stories',
  description: 'A modern blogging platform powered by Next.js, Supabase, and AI.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <footer className="bg-white border-t mt-16">
          <div className="max-w-6xl mx-auto px-4 py-8 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Hivon Automations LLP. Built with Next.js & Supabase.
          </div>
        </footer>
      </body>
    </html>
  );
}
