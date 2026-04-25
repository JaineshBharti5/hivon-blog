import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-7xl mb-6">🔍</div>
        <h1 className="text-4xl font-bold text-gray-900 mb-3">404 — Not Found</h1>
        <p className="text-gray-500 mb-8">The page or post you're looking for doesn't exist.</p>
        <Link href="/" className="btn-primary">← Back to Blog</Link>
      </div>
    </div>
  );
}
