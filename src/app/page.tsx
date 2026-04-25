import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import Image from 'next/image';
import type { Post } from '@/lib/types';
import SearchBar from '@/components/SearchBar';

const PER_PAGE = 6;

export default async function HomePage({
  searchParams,
}: {
  searchParams: { page?: string; q?: string };
}) {
  const supabase = await createClient();
  const page = parseInt(searchParams.page || '1');
  const query = searchParams.q || '';
  const from = (page - 1) * PER_PAGE;
  const to = from + PER_PAGE - 1;

  let postsQuery = supabase
    .from('posts')
    .select('*, author:users(id, name, role)', { count: 'exact' })
    .eq('published', true)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (query) {
    postsQuery = postsQuery.ilike('title', `%${query}%`);
  }

  const { data: posts, count } = await postsQuery;
  const totalPages = Math.ceil((count || 0) / PER_PAGE);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">HivonBlog</h1>
        <p className="text-gray-500 text-lg">Insights, stories, and ideas — powered by AI summaries.</p>
      </div>

      {/* Search */}
      <div className="mb-8 max-w-xl mx-auto">
        <SearchBar defaultValue={query} />
      </div>

      {query && (
        <p className="text-sm text-gray-500 mb-6">
          {count} result{count !== 1 ? 's' : ''} for &quot;<strong>{query}</strong>&quot;
        </p>
      )}

      {/* Posts Grid */}
      {posts && posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {posts.map((post: Post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-4">📭</div>
          <p className="text-lg">No posts found. {query ? 'Try a different search.' : 'Check back soon!'}</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/?page=${p}${query ? `&q=${query}` : ''}`}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                p === page
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function PostCard({ post }: { post: Post }) {
  return (
    <Link href={`/blog/${post.id}`} className="card hover:shadow-md transition-shadow group">
      {post.image_url && (
        <div className="relative h-48 overflow-hidden">
          <Image
            src={post.image_url}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      {!post.image_url && (
        <div className="h-48 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
          <span className="text-5xl">📝</span>
        </div>
      )}
      <div className="p-5">
        <h2 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {post.title}
        </h2>
        {post.summary && (
          <p className="text-sm text-gray-500 line-clamp-3 mb-4">{post.summary}</p>
        )}
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>By {(post.author as any)?.name || 'Unknown'}</span>
          <span>{new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
        <div className="mt-3">
          <span className="text-blue-600 text-sm font-medium group-hover:underline">Read more →</span>
        </div>
      </div>
    </Link>
  );
}
