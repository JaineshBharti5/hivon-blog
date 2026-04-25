import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import PostForm from '@/components/PostForm';

export default async function NewPostPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
  if (!profile || !['author', 'admin'].includes(profile.role)) {
    redirect('/dashboard');
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create New Post</h1>
        <p className="text-gray-500 mt-1 text-sm">
          An AI summary will be automatically generated when you publish. ✨
        </p>
      </div>
      <PostForm mode="create" />
    </div>
  );
}
