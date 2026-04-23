'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function PCsPage() {
  const supabase = createClient();

  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [labs, setLabs] = useState([]);
  const [pcs, setPcs] = useState([]);
  const [issues, setIssues] = useState([]);

  const [loading, setLoading] = useState(true);
  const [savingPc, setSavingPc] = useState(false);
  const [savingIssue, setSavingIssue] = useState(false);
  const [editingPcId, setEditingPcId] = useState(null);

  const canManage =
    !profileLoading &&
    (profile?.role === 'admin' || profile?.role === 'lab_assistant');

  const emptyPcForm = {
    lab_id: '',
    pc_number: '',
    status: 'ok',
    processor: '',
    ram: '',
    storage: '',
    monitor: '',
    os: '',
    notes: '',
  };

  const emptyIssueForm = {
    pc_id: '',
    issue_title: '',
    issue_details: '',
    issue_status: 'open',
  };

  const [pcForm, setPcForm] = useState(emptyPcForm);
  const [issueForm, setIssueForm] = useState(emptyIssueForm);

  const totalPcs = pcs.length;
  const totalOk = useMemo(() => pcs.filter((pc) => pc.status === 'ok').length, [pcs]);
  const totalRepair = useMemo(() => pcs.filter((pc) => pc.status === 'repair').length, [pcs]);
  const totalIssue = useMemo(() => pcs.filter((pc) => pc.status === 'issue').length, [pcs]);
  const openIssues = useMemo(
    () => issues.filter((issue) => issue.issue_status !== 'resolved').length,
    [issues]
  );

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
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, email, role')
        .eq('id', user.id)
        .single();

      setProfile(data || null);
    } else {
      setProfile(null);
    }

    const [labsRes, pcsRes, issuesRes] = await Promise.all([
      supabase.from('labs').select('id, name').order('name'),
      supabase
        .from('pcs')
        .select(`
          id,
          lab_id,
          pc_number,
          status,
          processor,
          ram,
          storage,
          monitor,
          os,
          notes,
          labs(name)
        `)
        .order('pc_number'),
      supabase
        .from('pc_issues')
        .select(`
          id,
          pc_id,
          issue_title,
          issue_details,
          issue_status,
          created_at,
          pcs(pc_number)
        `)
        .order('created_at', { ascending: false }),
    ]);

    setLabs(labsRes.data || []);
    setPcs(pcsRes.data || []);
    setIssues(issuesRes.data || []);

    setProfileLoading(false);
    setLoading(false);
  }

  function handlePcChange(e) {
    setPcForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  function handleIssueChange(e) {
    setIssueForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  function resetPcForm() {
    setPcForm(emptyPcForm);
    setEditingPcId(null);
  }

  async function handlePcSubmit(e) {
    e.preventDefault();

    if (!canManage) {
      alert('You have view-only access.');
      return;
    }

    setSavingPc(true);

    try {
      let result;

      if (editingPcId) {
        result = await supabase.from('pcs').update(pcForm).eq('id', editingPcId);
      } else {
        result = await supabase.from('pcs').insert([pcForm]);
      }

      if (result.error) {
        alert(result.error.message);
        return;
      }

      alert(editingPcId ? 'PC updated successfully' : 'PC added successfully');
      resetPcForm();
      loadData();
    } finally {
      setSavingPc(false);
    }
  }

  function handlePcEdit(pc) {
    if (!canManage) return;

    setEditingPcId(pc.id);
    setPcForm({
      lab_id: pc.lab_id || '',
      pc_number: pc.pc_number || '',
      status: pc.status || 'ok',
      processor: pc.processor || '',
      ram: pc.ram || '',
      storage: pc.storage || '',
      monitor: pc.monitor || '',
      os: pc.os || '',
      notes: pc.notes || '',
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handlePcDelete(id) {
    if (!canManage) return;

    const ok = window.confirm('Are you sure you want to delete this PC record?');
    if (!ok) return;

    const { error } = await supabase.from('pcs').delete().eq('id', id);

    if (error) {
      alert(error.message);
      return;
    }

    if (editingPcId === id) {
      resetPcForm();
    }

    alert('PC deleted successfully');
    loadData();
  }

  async function handleIssueSubmit(e) {
    e.preventDefault();

    if (!canManage) {
      alert('You have view-only access.');
      return;
    }

    setSavingIssue(true);

    try {
      const { error } = await supabase.from('pc_issues').insert([issueForm]);

      if (error) {
        alert(error.message);
        return;
      }

      if (issueForm.issue_status !== 'resolved') {
        await supabase
          .from('pcs')
          .update({ status: issueForm.issue_status === 'in_progress' ? 'repair' : 'issue' })
          .eq('id', issueForm.pc_id);
      }

      alert('Issue logged successfully');
      setIssueForm(emptyIssueForm);
      loadData();
    } finally {
      setSavingIssue(false);
    }
  }

  async function markIssueResolved(issue) {
    if (!canManage) return;

    const { error } = await supabase
      .from('pc_issues')
      .update({ issue_status: 'resolved' })
      .eq('id', issue.id);

    if (error) {
      alert(error.message);
      return;
    }

    await supabase.from('pcs').update({ status: 'ok' }).eq('id', issue.pc_id);

    alert('Issue marked as resolved');
    loadData();
  }

  async function deleteIssue(id) {
    if (!canManage) return;

    const ok = window.confirm('Are you sure you want to delete this issue?');
    if (!ok) return;

    const { error } = await supabase.from('pc_issues').delete().eq('id', id);

    if (error) {
      alert(error.message);
      return;
    }

    alert('Issue deleted successfully');
    loadData();
  }

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
    <main>
      <section style={heroCard}>
        <div>
          <p style={eyebrow}>{canManage ? 'LAB MANAGEMENT PANEL' : 'VIEW ONLY PANEL'}</p>
          <h1 style={heroTitle}>PC Inventory & Issue Management</h1>
          <p style={heroText}>
            {canManage
              ? 'Manage computer records, specifications, current status, and maintenance issues for the lab.'
              : 'View computer records, specifications, current status, and maintenance issues for the lab.'}
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
        <StatCard title="Total PCs" value={String(totalPcs)} tone="blue" />
        <StatCard title="Working PCs" value={String(totalOk)} tone="green" />
        <StatCard title="Repair Mode" value={String(totalRepair)} tone="amber" />
        <StatCard title="Need Attention" value={String(totalIssue)} tone="red" />
        <StatCard title="Open Issues" value={String(openIssues)} tone="purple" />
      </section>

      {!canManage && (
        <section style={noticeCard}>
          <div style={noticeTitle}>Principal View</div>
          <div style={noticeText}>
            You are logged in with view-only access. You can review PC records and issues,
            but you cannot add, edit, resolve, or delete records.
          </div>
        </section>
      )}

      {canManage && (
        <>
          <section style={card}>
            <div style={sectionHeader}>
              <div>
                <h2 style={sectionTitle}>
                  {editingPcId ? 'Edit PC Record' : 'Add New PC'}
                </h2>
                <p style={sectionText}>
                  Enter system specifications, status, and notes for each computer.
                </p>
              </div>

              {editingPcId && (
                <button type="button" onClick={resetPcForm} style={cancelBtn}>
                  Cancel Edit
                </button>
              )}
            </div>

            <form onSubmit={handlePcSubmit} style={grid}>
              <select
                name="lab_id"
                value={pcForm.lab_id || ''}
                onChange={handlePcChange}
                style={compactInput}
                required
              >
                <option value="">Select Lab</option>
                {labs.map((lab) => (
                  <option key={lab.id} value={String(lab.id)}>
                    {lab.name}
                  </option>
                ))}
              </select>

              <input
                name="pc_number"
                placeholder="PC Number (e.g. PC-01)"
                value={pcForm.pc_number}
                onChange={handlePcChange}
                style={compactInput}
                required
              />

              <select
                name="status"
                value={pcForm.status}
                onChange={handlePcChange}
                style={compactInput}
              >
                <option value="ok">OK</option>
                <option value="issue">Issue</option>
                <option value="repair">Repair</option>
              </select>

              <input
                name="processor"
                placeholder="Processor"
                value={pcForm.processor}
                onChange={handlePcChange}
                style={compactInput}
              />

              <input
                name="ram"
                placeholder="RAM"
                value={pcForm.ram}
                onChange={handlePcChange}
                style={compactInput}
              />

              <input
                name="storage"
                placeholder="Storage"
                value={pcForm.storage}
                onChange={handlePcChange}
                style={compactInput}
              />

              <input
                name="monitor"
                placeholder="Monitor"
                value={pcForm.monitor}
                onChange={handlePcChange}
                style={compactInput}
              />

              <input
                name="os"
                placeholder="Operating System"
                value={pcForm.os}
                onChange={handlePcChange}
                style={compactInput}
              />

              <div style={notesWrap}>
                <textarea
                  name="notes"
                  placeholder="Notes / Remarks"
                  value={pcForm.notes}
                  onChange={handlePcChange}
                  style={textarea}
                />
              </div>

              <div style={submitWrap}>
                <button type="submit" style={primaryBtn} disabled={savingPc}>
                  {savingPc ? 'Saving...' : editingPcId ? 'Update PC' : 'Save PC'}
                </button>
              </div>
            </form>
          </section>

          <section style={card}>
            <div style={sectionHeader}>
              <div>
                <h2 style={sectionTitle}>Log New Issue</h2>
                <p style={sectionText}>
                  Record software or hardware problems and track their status.
                </p>
              </div>
            </div>

            <form onSubmit={handleIssueSubmit} style={grid}>
              <select
                name="pc_id"
                value={issueForm.pc_id || ''}
                onChange={handleIssueChange}
                style={compactInput}
                required
              >
                <option value="">Select PC</option>
                {pcs.map((pc) => (
                  <option key={pc.id} value={String(pc.id)}>
                    {pc.pc_number} {pc.labs?.name ? `- ${pc.labs.name}` : ''}
                  </option>
                ))}
              </select>

              <input
                name="issue_title"
                placeholder="Issue Title"
                value={issueForm.issue_title}
                onChange={handleIssueChange}
                style={compactInput}
                required
              />

              <select
                name="issue_status"
                value={issueForm.issue_status}
                onChange={handleIssueChange}
                style={compactInput}
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>

              <div style={notesWrap}>
                <textarea
                  name="issue_details"
                  placeholder="Issue Details"
                  value={issueForm.issue_details}
                  onChange={handleIssueChange}
                  style={textarea}
                />
              </div>

              <div style={submitWrap}>
                <button type="submit" style={primaryBtn} disabled={savingIssue}>
                  {savingIssue ? 'Saving...' : 'Save Issue'}
                </button>
              </div>
            </form>
          </section>
        </>
      )}

      <section style={card}>
        <h2 style={sectionTitle}>PC Inventory</h2>

        {loading ? (
          <p style={muted}>Loading...</p>
        ) : pcs.length === 0 ? (
          <p style={muted}>No PCs found.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={table}>
              <thead>
                <tr>
                  <th style={th}>PC No.</th>
                  <th style={th}>Lab</th>
                  <th style={th}>Status</th>
                  <th style={th}>Processor</th>
                  <th style={th}>RAM</th>
                  <th style={th}>Storage</th>
                  <th style={th}>OS</th>
                  <th style={th}>Notes</th>
                  {canManage && <th style={th}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {pcs.map((pc) => (
                  <tr key={pc.id}>
                    <td style={td}>{pc.pc_number}</td>
                    <td style={td}>{pc.labs?.name || '-'}</td>
                    <td style={td}>
                      <span style={statusBadge(pc.status)}>{formatStatus(pc.status)}</span>
                    </td>
                    <td style={td}>{pc.processor || '-'}</td>
                    <td style={td}>{pc.ram || '-'}</td>
                    <td style={td}>{pc.storage || '-'}</td>
                    <td style={td}>{pc.os || '-'}</td>
                    <td style={td}>{pc.notes || '-'}</td>
                    {canManage && (
                      <td style={td}>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <button type="button" onClick={() => handlePcEdit(pc)} style={editBtn}>
                            Edit
                          </button>
                          <button type="button" onClick={() => handlePcDelete(pc.id)} style={deleteBtn}>
                            Delete
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section style={card}>
        <h2 style={sectionTitle}>Recent Issues</h2>

        {loading ? (
          <p style={muted}>Loading...</p>
        ) : issues.length === 0 ? (
          <p style={muted}>No issues found.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={table}>
              <thead>
                <tr>
                  <th style={th}>PC</th>
                  <th style={th}>Issue</th>
                  <th style={th}>Details</th>
                  <th style={th}>Status</th>
                  {canManage && <th style={th}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {issues.map((issue) => (
                  <tr key={issue.id}>
                    <td style={td}>{issue.pcs?.pc_number || '-'}</td>
                    <td style={td}>{issue.issue_title}</td>
                    <td style={td}>{issue.issue_details || '-'}</td>
                    <td style={td}>
                      <span style={issueStatusBadge(issue.issue_status)}>
                        {formatIssueStatus(issue.issue_status)}
                      </span>
                    </td>
                    {canManage && (
                      <td style={td}>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          {issue.issue_status !== 'resolved' && (
                            <button
                              type="button"
                              onClick={() => markIssueResolved(issue)}
                              style={resolveBtn}
                            >
                              Resolve
                            </button>
                          )}
                          <button type="button" onClick={() => deleteIssue(issue.id)} style={deleteBtn}>
                            Delete
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

function StatCard({ title, value, tone }) {
  return (
    <div style={statCard}>
      <div style={statLabel}>{title}</div>
      <div style={statValue}>{value}</div>
      <div style={statTone(tone)} />
    </div>
  );
}

function formatStatus(status) {
  if (status === 'ok') return 'OK';
  if (status === 'issue') return 'Issue';
  if (status === 'repair') return 'Repair';
  return status;
}

function formatIssueStatus(status) {
  if (status === 'open') return 'Open';
  if (status === 'in_progress') return 'In Progress';
  if (status === 'resolved') return 'Resolved';
  return status;
}

function statusBadge(status) {
  if (status === 'ok') return badge('#dcfce7', '#166534');
  if (status === 'repair') return badge('#fef3c7', '#92400e');
  return badge('#fee2e2', '#991b1b');
}

function issueStatusBadge(status) {
  if (status === 'resolved') return badge('#dcfce7', '#166534');
  if (status === 'in_progress') return badge('#fef3c7', '#92400e');
  return badge('#dbeafe', '#1d4ed8');
}

function badge(bg, color) {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '5px 9px',
    borderRadius: 999,
    background: bg,
    color,
    fontSize: 11,
    fontWeight: 700,
  };
}

function roleBadge(type) {
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
  };
}

function statTone(tone) {
  const colors = {
    blue: '#2563eb',
    green: '#16a34a',
    amber: '#d97706',
    red: '#dc2626',
    purple: '#7c3aed',
  };

  return {
    position: 'absolute',
    left: 0,
    bottom: 0,
    height: 4,
    width: '100%',
    background: colors[tone] || '#2563eb',
  };
}

const loadingCard = {
  background: '#fff',
  border: '1px solid #dbe4f0',
  borderRadius: 18,
  padding: 24,
  boxShadow: '0 8px 20px rgba(15, 23, 42, 0.04)',
};

const heroCard = {
  background: 'linear-gradient(135deg, #ffffff 0%, #f3f8ff 100%)',
  border: '1px solid #dbe4f0',
  borderRadius: 22,
  padding: 22,
  boxShadow: '0 12px 26px rgba(15, 23, 42, 0.05)',
  marginBottom: 18,
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
  lineHeight: 1.12,
};

const heroText = {
  margin: 0,
  color: '#64748b',
  lineHeight: 1.6,
  fontSize: 14,
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
  marginBottom: 16,
};

const statCard = {
  background: '#fff',
  border: '1px solid #dbe4f0',
  borderRadius: 16,
  padding: 16,
  position: 'relative',
  overflow: 'hidden',
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

const card = {
  background: '#fff',
  border: '1px solid #dbe4f0',
  borderRadius: 18,
  padding: 18,
  boxShadow: '0 8px 20px rgba(15, 23, 42, 0.04)',
  marginBottom: 16,
};

const noticeCard = {
  background: '#fffbea',
  border: '1px solid #fcd34d',
  borderRadius: 16,
  padding: 16,
  marginBottom: 16,
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
  lineHeight: 1.6,
};

const sectionHeader = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: 10,
  marginBottom: 12,
  flexWrap: 'wrap',
};

const sectionTitle = {
  marginTop: 0,
  marginBottom: 4,
  color: '#0f172a',
  fontSize: 22,
};

const sectionText = {
  margin: 0,
  color: '#64748b',
  lineHeight: 1.5,
  fontSize: 14,
};

const grid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
  gap: 10,
};

const compactInput = {
  width: '100%',
  height: 44,
  padding: '0 12px',
  borderRadius: 10,
  border: '1px solid #d1d5db',
  background: '#f8fafc',
  fontSize: 14,
  boxSizing: 'border-box',
};

const notesWrap = {
  gridColumn: '1 / -1',
};

const textarea = {
  width: '100%',
  minHeight: 92,
  padding: 12,
  borderRadius: 10,
  border: '1px solid #d1d5db',
  background: '#f8fafc',
  fontSize: 14,
  resize: 'vertical',
  boxSizing: 'border-box',
};

const submitWrap = {
  gridColumn: '1 / -1',
  display: 'flex',
  justifyContent: 'flex-start',
  marginTop: 4,
};

const primaryBtn = {
  padding: '11px 18px',
  borderRadius: 10,
  border: 'none',
  background: '#2563eb',
  color: '#fff',
  fontWeight: 800,
  cursor: 'pointer',
  fontSize: 14,
};

const cancelBtn = {
  padding: '10px 14px',
  borderRadius: 10,
  border: '1px solid #d1d5db',
  background: '#fff',
  color: '#0f172a',
  fontWeight: 700,
  cursor: 'pointer',
};

const editBtn = {
  padding: '6px 10px',
  borderRadius: 8,
  border: '1px solid #bfdbfe',
  background: '#eff6ff',
  color: '#1d4ed8',
  fontWeight: 700,
  cursor: 'pointer',
  fontSize: 12,
};

const resolveBtn = {
  padding: '6px 10px',
  borderRadius: 8,
  border: '1px solid #bbf7d0',
  background: '#f0fdf4',
  color: '#166534',
  fontWeight: 700,
  cursor: 'pointer',
  fontSize: 12,
};

const deleteBtn = {
  padding: '6px 10px',
  borderRadius: 8,
  border: '1px solid #fecaca',
  background: '#fff1f2',
  color: '#be123c',
  fontWeight: 700,
  cursor: 'pointer',
  fontSize: 12,
};

const table = {
  width: '100%',
  borderCollapse: 'collapse',
};

const th = {
  textAlign: 'left',
  padding: 10,
  borderBottom: '1px solid #e5e7eb',
  fontSize: 13,
  color: '#475569',
};

const td = {
  padding: 10,
  borderBottom: '1px solid #f1f5f9',
  verticalAlign: 'top',
  fontSize: 14,
  color: '#0f172a',
};

const muted = {
  color: '#64748b',
  fontSize: 14,
};