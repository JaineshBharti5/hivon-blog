import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import DashboardPostsList from '@/components/DashboardPostsList';

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single();
  if (!profile) redirect('/auth/login');

  // Fetch user's posts (or all if admin)
  let postsQuery = supabase
    .from('posts')
    .select('*, comments(count)')
    .order('created_at', { ascending: false });

  if (profile.role !== 'admin') {
    postsQuery = postsQuery.eq('author_id', user.id);
  }

  const { data: posts } = await postsQuery;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Welcome back, <strong>{profile.name}</strong>
            <span className={`ml-2 badge badge-${profile.role}`}>{profile.role}</span>
          </p>
        </div>
        {(profile.role === 'author' || profile.role === 'admin') && (
          <Link href="/dashboard/new" className="btn-primary">
            ✏️ New Post
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="card p-5 text-center">
          <div className="text-3xl font-bold text-blue-600">{posts?.length || 0}</div>
          <div className="text-sm text-gray-500 mt-1">Total Posts</div>
        </div>
        <div className="card p-5 text-center">
          <div className="text-3xl font-bold text-green-600">
            {posts?.reduce((acc: number, p: any) => acc + (p.comments?.[0]?.count || 0), 0) || 0}
          </div>
          <div className="text-sm text-gray-500 mt-1">Total Comments</div>
        </div>
        <div className="card p-5 text-center">
          <div className="text-3xl font-bold text-purple-600 capitalize">{profile.role}</div>
          <div className="text-sm text-gray-500 mt-1">Your Role</div>
        </div>
      </div>

      {/* Posts list */}
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        {profile.role === 'admin' ? 'All Posts' : 'Your Posts'}
      </h2>
      <DashboardPostsList posts={posts || []} currentUser={profile} />
    </div>
  );
}
