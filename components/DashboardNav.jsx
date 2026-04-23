'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';

export default function DashboardNav() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const [signingOut, setSigningOut] = useState(false);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .select('full_name, email, role, avatar_url')
      .eq('id', user.id)
      .single();

    setProfile(data || null);
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
        
        {/* BRAND */}
        <div style={brandBlock}>
          <div style={logo}>💻</div>
          <div style={titleWrap}>
            <div style={title}>Computer Lab System</div>
            <div style={subtitle}>APSACS Senior Boys</div>
          </div>
        </div>

        {/* NAV AREA */}
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

/* ================= STYLES ================= */

const navWrapper = {
  background: '#ffffff',
  borderBottom: '1px solid #e5e7eb',
  position: 'sticky',
  top: 0,
  zIndex: 50,
};

const navInner = {
  maxWidth: 1280,
  margin: '0 auto',
  padding: '14px 20px',
  display: 'grid',
  gridTemplateColumns: 'auto 1fr',
  gap: 20,
  alignItems: 'center',
};

/* BRAND IMPROVED */
const brandBlock = {
  display: 'flex',
  alignItems: 'center',
  gap: 14,
};

const logo = {
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

const titleWrap = {
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
};

const title = {
  fontWeight: 800,
  fontSize: 20,
  letterSpacing: '-0.02em',
  color: '#0f172a',
};

const subtitle = {
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

/* NAV */
const navArea = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 16,
  flexWrap: 'wrap',
};

const menu = {
  display: 'flex',
  gap: 8,
  flexWrap: 'wrap',
};

const navLink = {
  padding: '10px 14px',
  borderRadius: 10,
  textDecoration: 'none',
  fontWeight: 600,
  fontSize: 14,
  color: '#334155',
  transition: 'all 0.2s ease',
};

const activeLink = {
  background: '#2563eb',
  color: '#fff',
  boxShadow: '0 8px 18px rgba(37,99,235,0.25)',
};

/* RIGHT */
const rightSection = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
};

const profileMiniCard = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '6px 10px',
  border: '1px solid #e5e7eb',
  borderRadius: 12,
  background: '#fff',
};

const avatarImage = {
  width: 38,
  height: 38,
  borderRadius: '50%',
  objectFit: 'cover',
};

const avatarFallback = {
  width: 38,
  height: 38,
  borderRadius: '50%',
  background: '#2563eb',
  color: '#fff',
  display: 'grid',
  placeItems: 'center',
  fontWeight: 800,
};

const profileTextWrap = {
  lineHeight: 1.2,
};

const profileName = {
  fontWeight: 700,
  fontSize: 13,
  color: '#0f172a',
};

const profileRole = {
  fontSize: 11,
  color: '#64748b',
  textTransform: 'capitalize',
};

const logoutBtn = {
  padding: '10px 14px',
  borderRadius: 10,
  border: '1px solid #e5e7eb',
  background: '#fff',
  fontWeight: 700,
  cursor: 'pointer',
  transition: '0.2s',
};