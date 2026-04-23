import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import DashboardNav from '@/components/DashboardNav';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 🔐 Protect dashboard
  if (!user) {
    redirect('/login');
  }

  return (
    <div style={wrapper}>
      <DashboardNav />

      <main style={main}>
        {children}
      </main>
    </div>
  );
}

/* ---------- STYLES ---------- */

const wrapper = {
  minHeight: '100vh',
  background: '#f8fafc',
};

const main = {
  maxWidth: 1200,
  margin: '0 auto',
  padding: '24px 20px 40px',
};