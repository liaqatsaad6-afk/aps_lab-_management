'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function DashboardPage() {
  const supabase = createClient();

  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [loading, setLoading] = useState(true);

  const [labs, setLabs] = useState([]);
  const [pcs, setPcs] = useState([]);
  const [issues, setIssues] = useState([]);
  const [sessions, setSessions] = useState([]);

  const canManage =
    !profileLoading &&
    (profile?.role === 'admin' || profile?.role === 'lab_assistant');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setProfileLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, full_name, email, role')
        .eq('id', user.id)
        .single();

      setProfile(profileData || null);
    } else {
      setProfile(null);
    }

    const [labsRes, pcsRes, issuesRes, sessionsRes] = await Promise.all([
      supabase.from('labs').select('id, name').order('name'),
      supabase.from('pcs').select('id, status'),
      supabase.from('pc_issues').select('id, issue_status'),
      supabase
        .from('lab_sessions')
        .select('id, session_date, teacher_name, class_name, topic')
        .order('session_date', { ascending: false })
        .limit(5),
    ]);

    setLabs(labsRes.data || []);
    setPcs(pcsRes.data || []);
    setIssues(issuesRes.data || []);
    setSessions(sessionsRes.data || []);

    setProfileLoading(false);
    setLoading(false);
  }

  const totalOk = useMemo(
    () => pcs.filter((pc) => pc.status === 'ok').length,
    [pcs]
  );

  const totalBad = useMemo(
    () => pcs.filter((pc) => pc.status !== 'ok').length,
    [pcs]
  );

  const openIssues = useMemo(
    () => issues.filter((issue) => issue.issue_status !== 'resolved').length,
    [issues]
  );

  if (profileLoading) {
    return (
      <main style={{ padding: 24 }}>
        <div style={loadingCard}>
          <h2 style={{ margin: 0 }}>Loading dashboard...</h2>
          <p style={{ marginTop: 8, color: '#64748b' }}>
            Please wait while your access level is being verified.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main style={{ display: 'grid', gap: 16 }}>
      <section style={heroCard}>
        <div>
          <p style={eyebrow}>{canManage ? 'MANAGEMENT DASHBOARD' : 'VIEW ONLY DASHBOARD'}</p>
          <h1 style={heroTitle}>Computer Lab Overview</h1>
          <p style={heroText}>
            {canManage
              ? 'Manage lab computers, issue history, and daily session records from one place.'
              : 'View lab computers, issue history, and daily session records in a read-only overview.'}
          </p>
        </div>

        <div style={profileCard}>
          <div style={avatar}>
            {(profile?.full_name || 'U').charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={profileName}>{profile?.full_name || 'User'}</div>
            <div style={profileMeta}>
              {profile?.role || 'Role'} · {profile?.email || ''}
            </div>
          </div>
        </div>
      </section>

      {!canManage && (
        <section style={noticeCard}>
          <div style={noticeTitle}>Principal View</div>
          <div style={noticeText}>
            You are logged in with view-only access. You can review summary information,
            but you cannot create or update records.
          </div>
        </section>
      )}

      <section style={statsGrid}>
        <div style={statCard}>
          <p style={statLabel}>Labs</p>
          <h2 style={statValue}>{labs.length}</h2>
        </div>
        <div style={statCard}>
          <p style={statLabel}>PCs OK</p>
          <h2 style={statValue}>{totalOk}</h2>
        </div>
        <div style={statCard}>
          <p style={statLabel}>Need Attention</p>
          <h2 style={statValue}>{totalBad}</h2>
        </div>
        <div style={statCard}>
          <p style={statLabel}>Open Issues</p>
          <h2 style={statValue}>{openIssues}</h2>
        </div>
      </section>

      <section style={gridTwo}>
        <section style={card}>
          <h2 style={sectionTitle}>Labs</h2>
          {loading ? (
            <p style={muted}>Loading...</p>
          ) : labs.length === 0 ? (
            <p style={muted}>No labs found.</p>
          ) : (
            <ul style={list}>
              {labs.map((lab) => (
                <li key={lab.id}>{lab.name}</li>
              ))}
            </ul>
          )}
        </section>

        <section style={card}>
          <h2 style={sectionTitle}>Recent Sessions</h2>
          {loading ? (
            <p style={muted}>Loading...</p>
          ) : sessions.length === 0 ? (
            <p style={muted}>No sessions found.</p>
          ) : (
            <ul style={list}>
              {sessions.map((session) => (
                <li key={session.id}>
                  {session.session_date} — {session.teacher_name} — {session.class_name} — {session.topic}
                </li>
              ))}
            </ul>
          )}
        </section>
      </section>
    </main>
  );
}

const loadingCard = {
  background: '#fff',
  border: '1px solid #dbe4f0',
  borderRadius: 18,
  padding: 24,
};

const heroCard = {
  background: 'linear-gradient(135deg, #ffffff 0%, #f3f8ff 100%)',
  border: '1px solid #dbe4f0',
  borderRadius: 22,
  padding: 22,
  display: 'grid',
  gridTemplateColumns: '1.25fr 0.75fr',
  gap: 18,
  alignItems: 'center',
};

const eyebrow = {
  margin: 0,
  color: '#2563eb',
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
};

const heroTitle = {
  margin: '6px 0',
  fontSize: 30,
  color: '#0f172a',
};

const heroText = {
  margin: 0,
  color: '#64748b',
  lineHeight: 1.6,
};

const profileCard = {
  background: '#fff',
  border: '1px solid #dbe4f0',
  borderRadius: 16,
  padding: 14,
  display: 'flex',
  alignItems: 'center',
  gap: 12,
};

const avatar = {
  width: 48,
  height: 48,
  borderRadius: '50%',
  background: '#2563eb',
  color: '#fff',
  display: 'grid',
  placeItems: 'center',
  fontSize: 18,
  fontWeight: 800,
};

const profileName = {
  fontWeight: 800,
  color: '#0f172a',
  fontSize: 16,
};

const profileMeta = {
  color: '#64748b',
  fontSize: 13,
};

const noticeCard = {
  background: '#fffbea',
  border: '1px solid #fcd34d',
  borderRadius: 16,
  padding: 16,
};

const noticeTitle = {
  fontSize: 16,
  fontWeight: 800,
  color: '#92400e',
  marginBottom: 6,
};

const noticeText = {
  color: '#92400e',
  fontSize: 14,
};

const statsGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
  gap: 12,
};

const statCard = {
  background: '#fff',
  border: '1px solid #dbe4f0',
  borderRadius: 16,
  padding: 16,
};

const statLabel = {
  color: '#64748b',
  marginTop: 0,
};

const statValue = {
  marginBottom: 0,
};

const gridTwo = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
  gap: 16,
};

const card = {
  background: '#fff',
  border: '1px solid #dbe4f0',
  borderRadius: 18,
  padding: 18,
};

const sectionTitle = {
  marginTop: 0,
  marginBottom: 10,
};

const list = {
  margin: 0,
  paddingLeft: 18,
  lineHeight: 1.9,
};

const muted = {
  color: '#64748b',
};