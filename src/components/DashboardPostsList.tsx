'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Post, User } from '@/lib/types';

interface Props {
  posts: Post[];
  currentUser: User;
}

export default function DashboardPostsList({ posts: initialPosts, currentUser }: Props) {
  const [posts, setPosts] = useState(initialPosts);
  const router = useRouter();

  const handleDelete = async (postId: string) => {
    if (!confirm('Delete this post? This cannot be undone.')) return;
    const res = await fetch(`/api/posts/${postId}`, { method: 'DELETE' });
    if (res.ok) {
      setPosts(p => p.filter(post => post.id !== postId));
    }
  };

  if (posts.length === 0) {
    return (
      <div className="card p-12 text-center text-gray-400">
        <div className="text-5xl mb-4">📝</div>
        <p className="text-lg">No posts yet.</p>
        {(currentUser.role === 'author' || currentUser.role === 'admin') && (
          <Link href="/dashboard/new" className="btn-primary mt-4 inline-flex">
            Create your first post
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {posts.map((post: any) => {
        const canEdit = currentUser.role === 'admin' ||
          (currentUser.role === 'author' && post.author_id === currentUser.id);

        return (
          <div key={post.id} className="card p-5 flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <Link href={`/blog/${post.id}`} className="font-semibold text-gray-900 hover:text-blue-600 truncate block">
                {post.title}
              </Link>
              <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                <span>{new Date(post.created_at).toLocaleDateString('en-GB')}</span>
                <span>•</span>
                <span>{post.comments?.[0]?.count || 0} comments</span>
                {post.summary && <span className="text-green-600">✨ AI Summary</span>}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link href={`/blog/${post.id}`} className="btn-secondary text-xs py-1.5 px-3">
                View
              </Link>
              {canEdit && (
                <Link href={`/dashboard/edit/${post.id}`} className="btn-secondary text-xs py-1.5 px-3">
                  Edit
                </Link>
              )}
              {currentUser.role === 'admin' && (
                <button
                  onClick={() => handleDelete(post.id)}
                  className="btn-danger text-xs py-1.5 px-3"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
