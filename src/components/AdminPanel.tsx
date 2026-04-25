'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { User, Post, Comment } from '@/lib/types';

interface Props {
  users: User[];
  posts: Post[];
  comments: Comment[];
}

type Tab = 'users' | 'posts' | 'comments';

export default function AdminPanel({ users: initialUsers, posts: initialPosts, comments: initialComments }: Props) {
  const [tab, setTab] = useState<Tab>('posts');
  const [users, setUsers] = useState(initialUsers);
  const [posts, setPosts] = useState(initialPosts);
  const [comments, setComments] = useState(initialComments);
  const supabase = createClient();

  const updateUserRole = async (userId: string, newRole: string) => {
    await supabase.from('users').update({ role: newRole }).eq('id', userId);
    setUsers(u => u.map(user => user.id === userId ? { ...user, role: newRole as any } : user));
  };

  const deletePost = async (postId: string) => {
    if (!confirm('Delete this post permanently?')) return;
    await fetch(`/api/posts/${postId}`, { method: 'DELETE' });
    setPosts(p => p.filter(post => post.id !== postId));
  };

  const deleteComment = async (commentId: string) => {
    await supabase.from('comments').delete().eq('id', commentId);
    setComments(c => c.filter(comment => comment.id !== commentId));
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'posts', label: `Posts (${posts.length})` },
    { id: 'comments', label: `Comments (${comments.length})` },
    { id: 'users', label: `Users (${users.length})` },
  ];

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === t.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Posts tab */}
      {tab === 'posts' && (
        <div className="space-y-3">
          {posts.map((post: any) => (
            <div key={post.id} className="card p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{post.title}</p>
                <p className="text-xs text-gray-400">
                  By {post.author?.name} · {new Date(post.created_at).toLocaleDateString()}
                  {post.summary && ' · ✨ AI Summary'}
                </p>
              </div>
              <div className="flex gap-2">
                <Link href={`/blog/${post.id}`} className="btn-secondary text-xs py-1 px-3">View</Link>
                <Link href={`/dashboard/edit/${post.id}`} className="btn-secondary text-xs py-1 px-3">Edit</Link>
                <button onClick={() => deletePost(post.id)} className="btn-danger text-xs py-1 px-3">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Comments tab */}
      {tab === 'comments' && (
        <div className="space-y-3">
          {comments.map((comment: any) => (
            <div key={comment.id} className="card p-4 flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700">{comment.comment_text}</p>
                <p className="text-xs text-gray-400 mt-1">
                  By {comment.user?.name} on &quot;{comment.post?.title}&quot; · {new Date(comment.created_at).toLocaleDateString()}
                </p>
              </div>
              <button onClick={() => deleteComment(comment.id)} className="btn-danger text-xs py-1 px-3 shrink-0">
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Users tab */}
      {tab === 'users' && (
        <div className="space-y-3">
          {users.map((user: any) => (
            <div key={user.id} className="card p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-400">{user.email} · Joined {new Date(user.created_at).toLocaleDateString()}</p>
              </div>
              <select
                value={user.role}
                onChange={(e) => updateUserRole(user.id, e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="viewer">Viewer</option>
                <option value="author">Author</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
