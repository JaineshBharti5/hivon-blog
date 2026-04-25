import { createClient, createServiceClient } from '@/lib/supabase/server';
import { generatePostSummary } from '@/lib/gemini';
import { NextResponse } from 'next/server';

// POST /api/posts — Create a new post (Author/Admin only)
export async function POST(request: Request) {
  const supabase = await createClient();

  // Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Role check
  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
  if (!profile || !['author', 'admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden: Only authors can create posts' }, { status: 403 });
  }

  const body = await request.json();
  const { title, body: postBody, image_url } = body;

  if (!title || !postBody) {
    return NextResponse.json({ error: 'Title and body are required' }, { status: 400 });
  }

  // Generate AI summary ONCE using Gemini (stored to avoid repeated API calls)
  const summary = await generatePostSummary(title, postBody);

  const serviceClient = await createServiceClient();
  const { data: post, error } = await serviceClient.from('posts').insert({
    title,
    body: postBody,
    image_url,
    summary,         // Stored in DB — not regenerated on subsequent views
    author_id: user.id,
    published: true,
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ post }, { status: 201 });
}

// GET /api/posts — List posts (supports search & pagination)
export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const q = searchParams.get('q') || '';
  const perPage = 6;
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let query = supabase
    .from('posts')
    .select('*, author:users(id, name)', { count: 'exact' })
    .eq('published', true)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (q) query = query.ilike('title', `%${q}%`);

  const { data: posts, count, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ posts, total: count, page, perPage, totalPages: Math.ceil((count || 0) / perPage) });
}
