import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// PATCH /api/posts/[id] — Edit post (Author owns it, or Admin)
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase.from('users').select('role').eq('id', id).single();
  const { data: post } = await supabase.from('posts').select('author_id').eq('id', id).single();

  if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });

  const isAdmin = profile?.role === 'admin';
  const isAuthorOwner = profile?.role === 'author' && post.author_id === user.id;

  if (!isAdmin && !isAuthorOwner) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const { title, body: postBody, image_url } = body;

  const { data: updated, error } = await supabase
    .from('posts')
    .update({ title, body: postBody, image_url, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ post: updated });
}

// DELETE /api/posts/[id] — Admin only
// Naya
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { error } = await supabase.from('posts').delete().eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
