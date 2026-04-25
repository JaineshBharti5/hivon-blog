'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Post } from '@/lib/types';

interface Props {
  mode: 'create' | 'edit';
  postId?: string;
  initialData?: Partial<Post>;
}

export default function PostForm({ mode, postId, initialData }: Props) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [body, setBody] = useState(initialData?.body || '');
  const [imageUrl, setImageUrl] = useState(initialData?.image_url || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      setError('Title and body are required.');
      return;
    }
    setLoading(true);
    setError('');

    const url = mode === 'create' ? '/api/posts' : `/api/posts/${postId}`;
    const method = mode === 'create' ? 'POST' : 'PATCH';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, body, image_url: imageUrl }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Something went wrong.');
      setLoading(false);
      return;
    }

    router.push(mode === 'create' ? `/blog/${data.post.id}` : `/blog/${postId}`);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="card p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Post Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-field text-lg font-semibold"
            placeholder="An engaging title..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Featured Image URL
          </label>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="input-field"
            placeholder="https://images.unsplash.com/..."
          />
          {imageUrl && (
            <img src={imageUrl} alt="Preview" className="mt-2 h-40 rounded-lg object-cover w-full" />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Body Content <span className="text-red-500">*</span>
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={18}
            className="input-field resize-y font-mono text-sm"
            placeholder="Write your post content here... (HTML is supported)"
            required
          />
          <p className="text-xs text-gray-400 mt-1">Tip: You can use basic HTML tags like &lt;b&gt;, &lt;i&gt;, &lt;p&gt;, &lt;h2&gt;, &lt;ul&gt;, &lt;li&gt;</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {mode === 'create' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
          ✨ An AI-powered summary will be automatically generated using Google Gemini when you publish.
        </div>
      )}

      <div className="flex gap-3">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading
            ? (mode === 'create' ? '✨ Publishing & generating AI summary...' : 'Saving...')
            : (mode === 'create' ? 'Publish Post' : 'Save Changes')}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  );
}
