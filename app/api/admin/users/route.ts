import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  const supabase = await createClient();
  const adminClient = createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: myProfile } = await supabase
    .from('profiles')
    .select('role, is_active')
    .eq('id', user.id)
    .single();

  if (myProfile?.role !== 'admin' || !myProfile?.is_active) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data, error } = await adminClient
    .from('profiles')
    .select('id, full_name, email, role, is_active, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const adminClient = createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: myProfile } = await supabase
    .from('profiles')
    .select('role, is_active')
    .eq('id', user.id)
    .single();

  if (myProfile?.role !== 'admin' || !myProfile?.is_active) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const { email, password, full_name, role } = body;

  if (!email || !password || !role) {
    return NextResponse.json(
      { error: 'Email, password and role are required' },
      { status: 400 }
    );
  }

  const { data: createdUser, error: createError } =
    await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: full_name || '',
        role,
      },
    });

  if (createError) {
    return NextResponse.json({ error: createError.message }, { status: 500 });
  }

  if (createdUser.user) {
    await adminClient
      .from('profiles')
      .update({
        full_name: full_name || '',
        role,
        is_active: true,
        email,
      })
      .eq('id', createdUser.user.id);
  }

  return NextResponse.json({ success: true, user: createdUser.user });
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const adminClient = createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: myProfile } = await supabase
    .from('profiles')
    .select('role, is_active')
    .eq('id', user.id)
    .single();

  if (myProfile?.role !== 'admin' || !myProfile?.is_active) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const { id, role, is_active, full_name } = body;

  if (!id) {
    return NextResponse.json({ error: 'User id is required' }, { status: 400 });
  }

  const updateData: Record<string, unknown> = {};

  if (role) updateData.role = role;
  if (typeof is_active === 'boolean') updateData.is_active = is_active;
  if (typeof full_name === 'string') updateData.full_name = full_name;

  const { error } = await adminClient
    .from('profiles')
    .update(updateData)
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}