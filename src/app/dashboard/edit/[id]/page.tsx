import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import PostForm from '@/components/PostForm';

export default async function EditPostPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single();
  const { data: post } = await supabase.from('posts').select('*').eq('id', params.id).single();

  if (!post) notFound();

  const canEdit = profile?.role === 'admin' ||
    (profile?.role === 'author' && post.author_id === user.id);
  if (!canEdit) redirect('/dashboard');

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Post</h1>
        <p className="text-gray-500 mt-1 text-sm">Note: The AI summary won't be regenerated on edit to save API costs.</p>
      </div>
      <PostForm mode="edit" postId={params.id} initialData={post} />
    </div>
  );
}
