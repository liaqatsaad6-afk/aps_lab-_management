'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();

    if (!email || !password) {
      alert('Please enter email and password');
      return;
    }

    setLoading(true);

    const { error: signInError, data: signInData } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setLoading(false);
      alert(signInError.message);
      return;
    }

    const userId = signInData.user?.id;

    if (!userId) {
      setLoading(false);
      alert('Login failed. User not found.');
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    setLoading(false);

    if (profileError) {
      alert(profileError.message);
      return;
    }

    if (profile?.role === 'principal' || profile?.role === 'viewer') {
      router.push('/dashboard/reports');
    } else {
      router.push('/dashboard');
    }

    router.refresh();
  }

  return (
    <main style={main}>
      <div style={container}>
        <section style={leftCard}>
          <p style={eyebrow}>Iqra APSACS Tarbela Cantt</p>

          <h1 style={title}>
            Computer Lab
            <br />
            Record System
          </h1>

          <p style={desc}>
            Secure access for administration, lab operations, and principal review.
            Sign in with your assigned email and password to continue.
          </p>

          <div style={roleGrid}>
            <RoleCard
              title="Admin / Section Head"
              text="Manage users and supervise the system."
              color="#dbeafe"
              textColor="#1d4ed8"
            />
            <RoleCard
              title="Lab Assistant"
              text="Manage sessions, PCs, and daily work."
              color="#dcfce7"
              textColor="#166534"
            />
            <RoleCard
              title="Principal"
              text="View reports and records with read-only access."
              color="#fef3c7"
              textColor="#92400e"
            />
          </div>
        </section>

        <section style={rightCard}>
          <div style={{ marginBottom: 18 }}>
            <h2 style={loginTitle}>Sign in</h2>
            <p style={loginText}>
              Your role will be automatically detected after login.
            </p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'grid', gap: 14 }}>
            <div>
              <label style={label}>Email</label>
              <input
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={input}
              />
            </div>

            <div>
              <label style={label}>Password</label>
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={input}
              />
            </div>

            <button type="submit" disabled={loading} style={loginBtn}>
              {loading ? 'Signing in...' : 'Login'}
            </button>

            <Link href="/" style={homeBtn}>
              ← Back to Home
            </Link>
          </form>
        </section>
      </div>
    </main>
  );
}

function RoleCard({ title, text, color, textColor }) {
  return (
    <div style={roleCard}>
      <span style={{ ...badge, background: color, color: textColor }}>
        {title}
      </span>
      <p style={roleText}>{text}</p>
    </div>
  );
}

const main = {
  minHeight: '100vh',
  background: 'linear-gradient(to bottom, #f8fafc, #eef4ff)',
  display: 'grid',
  placeItems: 'center',
  padding: 24,
};

const container = {
  width: '100%',
  maxWidth: 1150,
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 24,
};

const leftCard = {
  background: 'linear-gradient(135deg, #ffffff 0%, #eff6ff 100%)',
  border: '1px solid #dbe4f0',
  borderRadius: 24,
  padding: 30,
};

const rightCard = {
  background: '#fff',
  border: '1px solid #dbe4f0',
  borderRadius: 24,
  padding: 30,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
};

const eyebrow = {
  fontSize: 13,
  fontWeight: 800,
  color: '#2563eb',
};

const title = {
  fontSize: 42,
  margin: '10px 0',
  color: '#0f172a',
};

const desc = {
  color: '#64748b',
  lineHeight: 1.7,
};

const roleGrid = {
  marginTop: 20,
  display: 'grid',
  gap: 12,
};

const roleCard = {
  border: '1px solid #e2e8f0',
  borderRadius: 16,
  padding: 16,
};

const badge = {
  padding: '6px 10px',
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 800,
};

const roleText = {
  marginTop: 8,
  color: '#64748b',
};

const loginTitle = {
  fontSize: 28,
  margin: 0,
};

const loginText = {
  color: '#64748b',
};

const label = {
  fontWeight: 700,
};

const input = {
  width: '100%',
  padding: 12,
  borderRadius: 10,
  border: '1px solid #cbd5e1',
  background: '#f8fafc',
};

const loginBtn = {
  padding: 14,
  borderRadius: 12,
  border: 'none',
  background: '#2563eb',
  color: '#fff',
  fontWeight: 800,
  cursor: 'pointer',
};

const homeBtn = {
  textAlign: 'center',
  padding: 12,
  borderRadius: 12,
  border: '1px solid #dbe4f0',
  background: '#fff',
  fontWeight: 700,
  textDecoration: 'none',
  color: '#0f172a',
};