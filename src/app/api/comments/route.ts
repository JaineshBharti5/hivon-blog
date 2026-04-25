import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// POST /api/comments — Add a comment (any logged-in user)
export async function POST(request: Request) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { post_id, comment_text } = await request.json();
  if (!post_id || !comment_text?.trim()) {
    return NextResponse.json({ error: 'post_id and comment_text required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('comments')
    .insert({ post_id, user_id: user.id, comment_text: comment_text.trim() })
    .select('*, user:users(id, name, role)')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ comment: data }, { status: 201 });
}

// GET /api/comments?post_id=xxx
export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const postId = searchParams.get('post_id');

  if (!postId) return NextResponse.json({ error: 'post_id required' }, { status: 400 });

  const { data, error } = await supabase
    .from('comments')
    .select('*, user:users(id, name, role)')
    .eq('post_id', postId)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ comments: data });
}
