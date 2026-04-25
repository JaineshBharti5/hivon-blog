'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function BlogPostPage() {
  const { id } = useParams();
  const router = useRouter();
  const supabase = createClient();
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      const { data: post } = await supabase
        .from('posts').select('*, users(name)').eq('id', id).single();
      if (!post) { router.push('/'); return; }
      setPost(post);
      const { data: comments } = await supabase
        .from('comments').select('*, users(name)').eq('post_id', id).order('created_at');
      setComments(comments || []);
      setLoading(false);
    }
    fetchData();
  }, [id]);

  async function submitComment() {
    if (!newComment.trim() || !user) return;
    const { data: userData } = await supabase
      .from('users').select('id').eq('id', user.id).single();
    await supabase.from('comments').insert({
      post_id: id, user_id: user.id, comment_text: newComment
    });
    setNewComment('');
    const { data } = await supabase
      .from('comments').select('*, users(name)').eq('post_id', id).order('created_at');
    setComments(data || []);
  }

  if (loading) return <div className="text-center py-20">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {post.image_url && (
        <img src={post.image_url} alt={post.title}
          className="w-full h-64 object-cover rounded-xl mb-6" />
      )}
      <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
      <p className="text-gray-500 text-sm mb-6">
        By {post.users?.name} · {new Date(post.created_at).toLocaleDateString()}
      </p>
      {post.summary && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm font-semibold text-blue-700 mb-1">✨ AI Summary</p>
          <p className="text-blue-800 text-sm">{post.summary}</p>
        </div>
      )}
      <div className="prose max-w-none mb-10"
        dangerouslySetInnerHTML={{ __html: post.body }} />
      <hr className="mb-6" />
      <h2 className="text-xl font-bold mb-4">Comments ({comments.length})</h2>
      {comments.map((c) => (
        <div key={c.id} className="bg-gray-50 rounded-lg p-3 mb-3">
          <p className="text-sm font-semibold">{c.users?.name}</p>
          <p className="text-gray-700">{c.comment_text}</p>
        </div>
      ))}
      {user ? (
        <div className="mt-4">
          <textarea value={newComment} onChange={e => setNewComment(e.target.value)}
            className="w-full border rounded-lg p-3 text-sm" rows={3}
            placeholder="Write a comment..." />
          <button onClick={submitComment}
            className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">
            Post Comment
          </button>
        </div>
      ) : (
        <p className="text-gray-500 text-sm mt-4">
          <a href="/auth/login" className="text-blue-600 underline">Login</a> to comment
        </p>
      )}
    </div>
  );
}