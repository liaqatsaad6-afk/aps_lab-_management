'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useRef, useState, type CSSProperties } from 'react';

type Profile = {
  full_name: string | null;
  email: string | null;
  role: string | null;
  avatar_url: string | null;
};

export default function DashboardNav() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const [signingOut, setSigningOut] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);

  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const userId = session?.user?.id;
      if (!userId) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, email, role, avatar_url')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Profile load error:', error.message);
        return;
      }

      setProfile(data as Profile);
    } catch (error) {
      console.error('DashboardNav loadProfile error:', error);
    }
  }

  const links = [
    { name: 'Overview', href: '/dashboard' },
    { name: 'PCs & Issues', href: '/dashboard/pcs' },
    { name: 'Lab Sessions', href: '/dashboard/sessions' },
    { name: 'Reports', href: '/dashboard/reports' },
    ...(profile?.role === 'admin' ? [{ name: 'Users', href: '/admin/users' }] : []),
    { name: 'Profile', href: '/dashboard/profile' },
  ];

  async function handleSignOut() {
    try {
      setSigningOut(true);

      const { error } = await supabase.auth.signOut();

      if (error) {
        alert(error.message);
        return;
      }

      router.push('/login');
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <div style={navWrapper}>
      <div style={navInner}>
        <div style={brandBlock}>
          <div style={logo}>💻</div>
          <div style={titleWrap}>
            <div style={title}>Computer Lab System</div>
            <div style={subtitle}>APSACS Senior Boys</div>
          </div>
        </div>

        <div style={navArea}>
          <div style={menu}>
            {links.map((link) => {
              const active =
                link.href === '/dashboard'
                  ? pathname === '/dashboard'
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    ...navLink,
                    ...(active ? activeLink : {}),
                  }}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          <div style={rightSection}>
            <div style={profileMiniCard}>
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile?.full_name || 'User'}
                  style={avatarImage}
                />
              ) : (
                <div style={avatarFallback}>
                  {(profile?.full_name || 'U').charAt(0).toUpperCase()}
                </div>
              )}

              <div style={profileTextWrap}>
                <div style={profileName}>{profile?.full_name || 'User'}</div>
                <div style={profileRole}>{profile?.role || 'Role'}</div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSignOut}
              style={logoutBtn}
              disabled={signingOut}
            >
              {signingOut ? 'Signing out...' : 'Sign out'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const navWrapper: CSSProperties = {
  background: '#ffffff',
  borderBottom: '1px solid #e5e7eb',
  position: 'sticky',
  top: 0,
  zIndex: 50,
};

const navInner: CSSProperties = {
  maxWidth: 1280,
  margin: '0 auto',
  padding: '14px 20px',
  display: 'grid',
  gridTemplateColumns: 'auto 1fr',
  gap: 20,
  alignItems: 'center',
};

const brandBlock: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 14,
};

const logo: CSSProperties = {
  width: 48,
  height: 48,
  borderRadius: 14,
  background: 'linear-gradient(135deg, #1d4ed8, #2563eb)',
  color: '#fff',
  display: 'grid',
  placeItems: 'center',
  fontSize: 22,
  fontWeight: 'bold',
  boxShadow: '0 10px 24px rgba(37,99,235,0.25)',
};

const titleWrap: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
};

const title: CSSProperties = {
  fontWeight: 800,
  fontSize: 20,
  letterSpacing: '-0.02em',
  color: '#0f172a',
};

const subtitle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  width: 'fit-content',
  padding: '4px 10px',
  borderRadius: 999,
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  color: '#1e3a8a',
  background: '#eff6ff',
  border: '1px solid #bfdbfe',
};

const navArea: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 16,
  flexWrap: 'wrap',
};

const menu: CSSProperties = {
  display: 'flex',
  gap: 8,
  flexWrap: 'wrap',
};

const navLink: CSSProperties = {
  padding: '10px 14px',
  borderRadius: 10,
  textDecoration: 'none',
  fontWeight: 600,
  fontSize: 14,
  color: '#334155',
  transition: 'all 0.2s ease',
};

const activeLink: CSSProperties = {
  background: '#2563eb',
  color: '#fff',
  boxShadow: '0 8px 18px rgba(37,99,235,0.25)',
};

const rightSection: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
};

const profileMiniCard: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '6px 10px',
  border: '1px solid #e5e7eb',
  borderRadius: 12,
  background: '#fff',
};

const avatarImage: CSSProperties = {
  width: 38,
  height: 38,
  borderRadius: '50%',
  objectFit: 'cover',
};

const avatarFallback: CSSProperties = {
  width: 38,
  height: 38,
  borderRadius: '50%',
  background: '#2563eb',
  color: '#fff',
  display: 'grid',
  placeItems: 'center',
  fontWeight: 800,
};

const profileTextWrap: CSSProperties = {
  lineHeight: '1.2',
};

const profileName: CSSProperties = {
  fontWeight: 700,
  fontSize: 13,
  color: '#0f172a',
};

const profileRole: CSSProperties = {
  fontSize: 11,
  color: '#64748b',
  textTransform: 'capitalize',
};

const logoutBtn: CSSProperties = {
  padding: '10px 14px',
  borderRadius: 10,
  border: '1px solid #e5e7eb',
  background: '#fff',
  fontWeight: 700,
  cursor: 'pointer',
  transition: '0.2s',
};