import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  const { error: insertError } = await supabase.from('pc_issues').insert({
    pc_id: body.pc_id,
    issue_title: body.issue_title,
    issue_details: body.issue_details || null,
    priority: body.priority || 'medium',
    issue_status: 'open',
    created_by: user.id
  });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 400 });
  }

  const { error: updateError } = await supabase
    .from('pcs')
    .update({
      status: body.pc_status || 'issue',
      updated_at: new Date().toISOString(),
      notes: body.issue_title
    })
    .eq('id', body.pc_id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
