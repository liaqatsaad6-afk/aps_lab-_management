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

  const { error } = await supabase.from('lab_sessions').insert({
    lab_id: body.lab_id,
    session_date: body.session_date,
    day_name: body.day_name,
    start_time: body.start_time,
    end_time: body.end_time,
    teacher_name: body.teacher_name,
    class_name: body.class_name,
    topic: body.topic,
    teacher_sign: body.teacher_sign || null,
    cr_sign: body.cr_sign || null,
    assistant_sign: body.assistant_sign || null,
    remarks: body.remarks || null,
    created_by: user.id
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
