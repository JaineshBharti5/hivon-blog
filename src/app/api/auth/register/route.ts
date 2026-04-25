import { createServiceClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { id, name, email, role } = await request.json();

  if (!id || !name || !email) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const supabase = await createServiceClient();

  const { error } = await supabase.from('users').insert({
    id,
    name,
    email,
    role: role === 'author' ? 'author' : 'viewer', // never allow admin self-assignment
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
