'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function IssuesPage() {
  const supabase = createClient();

  const [pcs, setPcs] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    pc_id: '',
    issue_title: '',
    issue_details: '',
    issue_status: 'open',
  });

  async function loadData() {
    setLoading(true);

    const [pcsRes, issuesRes] = await Promise.all([
      supabase
        .from('pcs')
        .select(`
          id,
          pc_number,
          labs(name)
        `)
        .order('pc_number'),
      supabase
        .from('pc_issues')
        .select(`
          id,
          issue_title,
          issue_details,
          issue_status,
          created_at,
          pcs(pc_number, labs(name))
        `)
        .order('created_at', { ascending: false }),
    ]);

    setPcs(pcsRes.data || []);
    setIssues(issuesRes.data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const { error } = await supabase.from('pc_issues').insert([form]);

    if (error) {
      alert(error.message);
      return;
    }

    alert('Issue added successfully');

    setForm({
      pc_id: '',
      issue_title: '',
      issue_details: '',
      issue_status: 'open',
    });

    loadData();
  }

  async function updateIssue(id, issue_status) {
    const { error } = await supabase.from('pc_issues').update({ issue_status }).eq('id', id);

    if (error) {
      alert(error.message);
      return;
    }

    loadData();
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>PC Issues</h1>

      <div style={card}>
        <h2>Add Issue</h2>

        <form onSubmit={handleSubmit} style={grid}>
          <select name="pc_id" value={form.pc_id} onChange={handleChange} style={input} required>
            <option value="">Select PC</option>
            {pcs.map((pc) => (
              <option key={pc.id} value={pc.id}>
                {(pc.labs?.name || 'Lab')} - {pc.pc_number}
              </option>
            ))}
          </select>

          <input name="issue_title" placeholder="Issue Title" value={form.issue_title} onChange={handleChange} style={input} required />
          <input name="issue_details" placeholder="Issue Details" value={form.issue_details} onChange={handleChange} style={input} />
          <select name="issue_status" value={form.issue_status} onChange={handleChange} style={input}>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>

          <button type="submit" style={primaryBtn}>
            Save Issue
          </button>
        </form>
      </div>

      <div style={card}>
        <h2>Issue List</h2>

        {loading ? (
          <p>Loading...</p>
        ) : issues.length === 0 ? (
          <p>No issues found.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={table}>
              <thead>
                <tr>
                  <th style={th}>Lab / PC</th>
                  <th style={th}>Title</th>
                  <th style={th}>Details</th>
                  <th style={th}>Status</th>
                  <th style={th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {issues.map((issue) => (
                  <tr key={issue.id}>
                    <td style={td}>
                      {issue.pcs?.labs?.name || '-'} / {issue.pcs?.pc_number || '-'}
                    </td>
                    <td style={td}>{issue.issue_title}</td>
                    <td style={td}>{issue.issue_details}</td>
                    <td style={td}>{issue.issue_status}</td>
                    <td style={td}>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button style={btn} onClick={() => updateIssue(issue.id, 'open')}>Open</button>
                        <button style={btn} onClick={() => updateIssue(issue.id, 'in_progress')}>In Progress</button>
                        <button style={btn} onClick={() => updateIssue(issue.id, 'resolved')}>Resolved</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}

const card = {
  background: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: 16,
  padding: 20,
  marginBottom: 24,
};

const grid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: 12,
};

const input = {
  padding: 12,
  borderRadius: 10,
  border: '1px solid #d1d5db',
};

const primaryBtn = {
  padding: 12,
  borderRadius: 10,
  border: 'none',
  background: '#2563eb',
  color: '#fff',
  fontWeight: 700,
};

const table = {
  width: '100%',
  borderCollapse: 'collapse',
};

const th = {
  textAlign: 'left',
  padding: 12,
  borderBottom: '1px solid #e5e7eb',
};

const td = {
  padding: 12,
  borderBottom: '1px solid #f1f5f9',
  verticalAlign: 'top',
};

const btn = {
  padding: '8px 10px',
  borderRadius: 8,
  border: '1px solid #d1d5db',
  background: '#fff',
  cursor: 'pointer',
};