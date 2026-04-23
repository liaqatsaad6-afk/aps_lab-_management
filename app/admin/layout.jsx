import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import DashboardNav from '@/components/DashboardNav';

export default async function AdminLayout({ children }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    redirect('/dashboard');
  }

  return (
    <main style={{ display: 'grid', gap: 20, paddingTop: 24, paddingBottom: 40 }}>
      <DashboardNav />
      <div className="container">{children}</div>
    </main>
  );
}