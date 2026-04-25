'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Comment, User } from '@/lib/types';

interface Props {
  postId: string;
  currentUser: User | null;
}

export default function CommentSection({ postId, currentUser }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    const { data } = await supabase
      .from('comments')
      .select('*, user:users(id, name, role)')
      .eq('post_id', postId)
      .order('created_at', { ascending: false });
    setComments(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !currentUser) return;
    setLoading(true);
    await supabase.from('comments').insert({
      post_id: postId,
      user_id: currentUser.id,
      comment_text: text.trim(),
    });
    setText('');
    await fetchComments();
    setLoading(false);
  };

  const handleDelete = async (commentId: string) => {
    await supabase.from('comments').delete().eq('id', commentId);
    setComments(c => c.filter(x => x.id !== commentId));
  };

  return (
    <section>
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        💬 Comments ({comments.length})
      </h2>

      {/* Add comment */}
      {currentUser ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Share your thoughts..."
            rows={3}
            className="input-field resize-none mb-3"
          />
          <button type="submit" className="btn-primary" disabled={loading || !text.trim()}>
            {loading ? 'Posting...' : 'Post Comment'}
          </button>
        </form>
      ) : (
        <div className="bg-gray-50 rounded-xl p-6 text-center mb-8">
          <p className="text-gray-500 mb-3">Sign in to leave a comment</p>
          <a href="/auth/login" className="btn-primary">Login</a>
        </div>
      )}

      {/* Comments list */}
      <div className="space-y-4">
        {comments.map((comment) => {
          const canDelete = currentUser?.role === 'admin' || currentUser?.id === comment.user_id;
          return (
            <div key={comment.id} className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm text-gray-900">
                      {(comment.user as any)?.name || 'User'}
                    </span>
                    <span className={`badge badge-${(comment.user as any)?.role || 'viewer'}`}>
                      {(comment.user as any)?.role || 'viewer'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{comment.comment_text}</p>
                </div>
                {canDelete && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="text-red-400 hover:text-red-600 text-sm"
                    title="Delete comment"
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {comments.length === 0 && (
          <p className="text-center text-gray-400 py-8">No comments yet. Be the first!</p>
        )}
      </div>
    </section>
  );
}
