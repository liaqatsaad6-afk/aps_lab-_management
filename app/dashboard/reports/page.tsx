'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function ReportsPage() {
  const supabase = createClient();

  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [loading, setLoading] = useState(true);

  const [labs, setLabs] = useState<any[]>([]);
  const [pcs, setPcs] = useState<any[]>([]);
  const [issues, setIssues] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);

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
      supabase.from('pcs').select('id, lab_id, status'),
      supabase.from('pc_issues').select('id, pc_id, issue_title, issue_status, created_at'),
      supabase.from('lab_sessions').select('id, lab_id, teacher_name, class_name, topic, session_date'),
    ]);

    setLabs(labsRes.data || []);
    setPcs(pcsRes.data || []);
    setIssues(issuesRes.data || []);
    setSessions(sessionsRes.data || []);

    setProfileLoading(false);
    setLoading(false);
  }

  const totalLabs = labs.length;
  const totalPcs = pcs.length;
  const totalOk = pcs.filter((pc) => pc.status === 'ok').length;
  const totalNeedAttention = pcs.filter((pc) => pc.status !== 'ok').length;
  const totalResolved = issues.filter((i) => i.issue_status === 'resolved').length;
  const totalOpenIssues = issues.filter((i) => i.issue_status !== 'resolved').length;

  const labSummary = useMemo(() => {
    return labs.map((lab) => {
      const labPcs = pcs.filter((pc) => pc.lab_id === lab.id);
      const labSessions = sessions.filter((session) => session.lab_id === lab.id).length;

      return {
        id: lab.id,
        name: lab.name,
        total: labPcs.length,
        ok: labPcs.filter((pc) => pc.status === 'ok').length,
        issue: labPcs.filter((pc) => pc.status !== 'ok').length,
        sessions: labSessions,
      };
    });
  }, [labs, pcs, sessions]);

  const teacherCounts = Object.entries(
    sessions.reduce<Record<string, number>>((acc, item) => {
      const teacher = item.teacher_name || 'Unknown';
      acc[teacher] = (acc[teacher] ?? 0) + 1;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]);

  const recentSessions = [...sessions]
    .sort((a, b) => String(b.session_date || '').localeCompare(String(a.session_date || '')))
    .slice(0, 8);

  const recentIssues = [...issues]
    .sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')))
    .slice(0, 8);

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
    <main style={pageWrap}>
      <section style={heroCard}>
        <div>
          <p style={eyebrow}>{canManage ? 'REPORTS PANEL' : 'VIEW ONLY REPORTS'}</p>
          <h1 style={heroTitle}>Lab Reports & Summary</h1>
          <p style={heroText}>
            View system-wide reports for labs, PCs, sessions, and maintenance activity.
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
            <div style={roleBadge(canManage ? 'manage' : 'view')}>
              {canManage ? 'Manage Access' : 'View Only'}
            </div>
          </div>
        </div>
      </section>

      <section style={statsGrid}>
        <StatCard title="Total Labs" value={String(totalLabs)} tone="blue" />
        <StatCard title="Total PCs" value={String(totalPcs)} tone="green" />
        <StatCard title="PCs OK" value={String(totalOk)} tone="emerald" />
        <StatCard title="Need Attention" value={String(totalNeedAttention)} tone="red" />
        <StatCard title="Open Issues" value={String(totalOpenIssues)} tone="amber" />
        <StatCard title="Resolved Issues" value={String(totalResolved)} tone="purple" />
        <StatCard title="Total Sessions" value={String(sessions.length)} tone="indigo" />
      </section>

      <section style={card}>
        <h2 style={sectionTitle}>Lab-wise Summary</h2>
        <div style={tableWrap}>
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>Lab</th>
                <th style={th}>Total PCs</th>
                <th style={th}>OK</th>
                <th style={th}>Need Attention</th>
                <th style={th}>Sessions</th>
              </tr>
            </thead>
            <tbody>
              {labSummary.map((row) => (
                <tr key={row.id}>
                  <td style={td}>{row.name}</td>
                  <td style={td}>{row.total}</td>
                  <td style={td}>{row.ok}</td>
                  <td style={td}>{row.issue}</td>
                  <td style={td}>{row.sessions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section style={gridTwo}>
        <section style={card}>
          <h2 style={sectionTitle}>Teacher Usage Summary</h2>
          <div style={tableWrap}>
            <table style={table}>
              <thead>
                <tr>
                  <th style={th}>Teacher</th>
                  <th style={th}>Sessions</th>
                </tr>
              </thead>
              <tbody>
                {teacherCounts.length === 0 ? (
                  <tr>
                    <td style={td} colSpan={2}>No teacher session data found.</td>
                  </tr>
                ) : (
                  teacherCounts.map(([teacher, count]) => (
                    <tr key={teacher}>
                      <td style={td}>{teacher}</td>
                      <td style={td}>{count}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section style={card}>
          <h2 style={sectionTitle}>Issue Status Summary</h2>
          <div style={summaryList}>
            <div style={summaryRow}>
              <span style={summaryLabel}>Open Issues</span>
              <span style={statusBadge('#fef3c7', '#92400e')}>{totalOpenIssues}</span>
            </div>
            <div style={summaryRow}>
              <span style={summaryLabel}>Resolved Issues</span>
              <span style={statusBadge('#dcfce7', '#166534')}>{totalResolved}</span>
            </div>
            <div style={summaryRow}>
              <span style={summaryLabel}>PCs Working Fine</span>
              <span style={statusBadge('#dbeafe', '#1d4ed8')}>{totalOk}</span>
            </div>
            <div style={summaryRow}>
              <span style={summaryLabel}>PCs Needing Attention</span>
              <span style={statusBadge('#fee2e2', '#991b1b')}>{totalNeedAttention}</span>
            </div>
          </div>
        </section>
      </section>

      <section style={gridTwo}>
        <section style={card}>
          <h2 style={sectionTitle}>Recent Sessions</h2>
          <div style={tableWrap}>
            <table style={table}>
              <thead>
                <tr>
                  <th style={th}>Date</th>
                  <th style={th}>Teacher</th>
                  <th style={th}>Class</th>
                  <th style={th}>Topic</th>
                </tr>
              </thead>
              <tbody>
                {recentSessions.length === 0 ? (
                  <tr>
                    <td style={td} colSpan={4}>No sessions found.</td>
                  </tr>
                ) : (
                  recentSessions.map((session) => (
                    <tr key={session.id}>
                      <td style={td}>{session.session_date || '-'}</td>
                      <td style={td}>{session.teacher_name || '-'}</td>
                      <td style={td}>{session.class_name || '-'}</td>
                      <td style={td}>{session.topic || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section style={card}>
          <h2 style={sectionTitle}>Recent Issues</h2>
          <div style={tableWrap}>
            <table style={table}>
              <thead>
                <tr>
                  <th style={th}>Issue</th>
                  <th style={th}>Status</th>
                  <th style={th}>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentIssues.length === 0 ? (
                  <tr>
                    <td style={td} colSpan={3}>No issues found.</td>
                  </tr>
                ) : (
                  recentIssues.map((issue) => (
                    <tr key={issue.id}>
                      <td style={td}>{issue.issue_title || '-'}</td>
                      <td style={td}>
                        <span
                          style={
                            issue.issue_status === 'resolved'
                              ? statusBadge('#dcfce7', '#166534')
                              : issue.issue_status === 'in_progress'
                              ? statusBadge('#fef3c7', '#92400e')
                              : statusBadge('#dbeafe', '#1d4ed8')
                          }
                        >
                          {formatIssueStatus(issue.issue_status)}
                        </span>
                      </td>
                      <td style={td}>
                        {issue.created_at ? new Date(issue.created_at).toLocaleDateString() : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </section>

      <section style={printWrap}>
        <button type="button" onClick={() => window.print()} style={printBtn}>
          Print Report
        </button>
      </section>
    </main>
  );
}

function StatCard({ title, value, tone }: { title: string; value: string; tone: string }) {
  return (
    <div style={statCard}>
      <div style={statLabel}>{title}</div>
      <div style={statValue}>{value}</div>
      <div style={statTone(tone)} />
    </div>
  );
}

function formatIssueStatus(status: string) {
  if (status === 'open') return 'Open';
  if (status === 'in_progress') return 'In Progress';
  if (status === 'resolved') return 'Resolved';
  return status || '-';
}

function roleBadge(type: 'manage' | 'view') {
  return {
    marginTop: 8,
    display: 'inline-flex',
    alignItems: 'center',
    padding: '5px 10px',
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 700,
    background: type === 'manage' ? '#dcfce7' : '#fef3c7',
    color: type === 'manage' ? '#166534' : '#92400e',
  } as const;
}

function statusBadge(bg: string, color: string) {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '5px 9px',
    borderRadius: 999,
    background: bg,
    color,
    fontSize: 11,
    fontWeight: 700,
  } as const;
}

const loadingCard = {
  background: '#fff',
  border: '1px solid #dbe4f0',
  borderRadius: 18,
  padding: 24,
  boxShadow: '0 8px 20px rgba(15, 23, 42, 0.04)',
};

const pageWrap = {
  display: 'grid',
  gap: 16,
};

const heroCard = {
  background: 'linear-gradient(135deg, #ffffff 0%, #f3f8ff 100%)',
  border: '1px solid #dbe4f0',
  borderRadius: 22,
  padding: 22,
  boxShadow: '0 12px 26px rgba(15, 23, 42, 0.05)',
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
  textTransform: 'uppercase' as const,
};

const heroTitle = {
  margin: '6px 0',
  fontSize: 30,
  color: '#0f172a',
  lineHeight: 1.12,
};

const heroText = {
  margin: 0,
  color: '#64748b',
  lineHeight: 1.6,
  fontSize: 14,
  maxWidth: 720,
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
  marginTop: 2,
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
  position: 'relative' as const,
  overflow: 'hidden' as const,
};

const statLabel = {
  fontSize: 13,
  color: '#64748b',
  fontWeight: 600,
};

const statValue = {
  marginTop: 6,
  fontSize: 28,
  fontWeight: 800,
  color: '#0f172a',
};

function statTone(tone: string) {
  const colors: Record<string, string> = {
    blue: '#2563eb',
    green: '#16a34a',
    emerald: '#059669',
    amber: '#d97706',
    red: '#dc2626',
    purple: '#7c3aed',
    indigo: '#4f46e5',
  };

  return {
    position: 'absolute' as const,
    left: 0,
    bottom: 0,
    height: 4,
    width: '100%',
    background: colors[tone] || '#2563eb',
  };
}

const card = {
  background: '#fff',
  border: '1px solid #dbe4f0',
  borderRadius: 18,
  padding: 18,
  boxShadow: '0 8px 20px rgba(15, 23, 42, 0.04)',
};

const sectionTitle = {
  marginTop: 0,
  marginBottom: 10,
  color: '#0f172a',
  fontSize: 22,
};

const gridTwo = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
  gap: 16,
};

const tableWrap = {
  overflowX: 'auto' as const,
};

const table = {
  width: '100%',
  borderCollapse: 'collapse' as const,
};

const th = {
  textAlign: 'left' as const,
  padding: 10,
  borderBottom: '1px solid #e5e7eb',
  fontSize: 13,
  color: '#475569',
};

const td = {
  padding: 10,
  borderBottom: '1px solid #f1f5f9',
  verticalAlign: 'top' as const,
  fontSize: 14,
  color: '#0f172a',
};

const summaryList = {
  display: 'grid',
  gap: 12,
};

const summaryRow = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  padding: '12px 14px',
  borderRadius: 12,
  background: '#f8fafc',
  border: '1px solid #e2e8f0',
};

const summaryLabel = {
  color: '#0f172a',
  fontSize: 14,
  fontWeight: 600,
};

const printWrap = {
  display: 'flex',
  justifyContent: 'flex-end',
};

const printBtn = {
  padding: '12px 18px',
  borderRadius: 10,
  border: 'none',
  background: '#2563eb',
  color: '#fff',
  fontWeight: 800,
  cursor: 'pointer',
  fontSize: 14,
};