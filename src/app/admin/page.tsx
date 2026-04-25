import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AdminPanel from '@/components/AdminPanel';

export default async function AdminPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single();
  if (profile?.role !== 'admin') redirect('/');

  // Fetch all users, posts, comments for admin view
  const [{ data: users }, { data: posts }, { data: comments }] = await Promise.all([
    supabase.from('users').select('*').order('created_at', { ascending: false }),
    supabase.from('posts').select('*, author:users(name)').order('created_at', { ascending: false }),
    supabase.from('comments').select('*, user:users(name), post:posts(title)').order('created_at', { ascending: false }).limit(50),
  ]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
        <p className="text-gray-500 mt-1">Manage users, posts, and comments</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Users', value: users?.length || 0, icon: '👥', color: 'blue' },
          { label: 'Total Posts', value: posts?.length || 0, icon: '📝', color: 'green' },
          { label: 'Comments', value: comments?.length || 0, icon: '💬', color: 'purple' },
          { label: 'Authors', value: users?.filter((u: any) => u.role === 'author').length || 0, icon: '✍️', color: 'yellow' },
        ].map(stat => (
          <div key={stat.label} className="card p-5 text-center">
            <div className="text-3xl mb-1">{stat.icon}</div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      <AdminPanel users={users || []} posts={posts || []} comments={comments || []} />
    </div>
  );
}
