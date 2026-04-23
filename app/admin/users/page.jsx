'use client';

import { useEffect, useState } from 'react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('lab_assistant');

  async function loadUsers() {
    setLoading(true);
    const res = await fetch('/api/admin/users');
    const data = await res.json();
    setUsers(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();

    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: fullName,
        email,
        password,
        role,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || 'Failed to create user');
      return;
    }

    alert('User created successfully');
    setFullName('');
    setEmail('');
    setPassword('');
    setRole('lab_assistant');
    loadUsers();
  }

  async function updateUser(id, payload) {
    const res = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...payload }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || 'Failed');
      return;
    }

    loadUsers();
  }

  return (
    <main>
      <section style={heroCard}>
        <div>
          <p style={eyebrow}>Users Management</p>
          <h1 style={heroTitle}>Add Lab Assistant</h1>
          <p style={heroText}>
            Create staff accounts, assign roles, and control who can manage or view lab records.
          </p>
        </div>
      </section>

      <section style={twoCol}>
        <div style={panel}>
          <h2 style={panelTitle}>Create New User</h2>
          <p style={panelText}>
            Use this form to add a lab assistant, principal, or another admin.
          </p>

          <form onSubmit={handleCreate} style={{ display: 'grid', gap: 12, marginTop: 16 }}>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Full name"
              style={input}
              required
            />

            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              type="email"
              style={input}
              required
            />

            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Temporary password"
              type="password"
              style={input}
              required
            />

            <select value={role} onChange={(e) => setRole(e.target.value)} style={input}>
              <option value="lab_assistant">Lab Assistant</option>
              <option value="principal">Principal</option>
              <option value="admin">Admin / Section Head</option>
            </select>

            <button type="submit" style={primaryBtn}>
              Create User
            </button>
          </form>
        </div>

        <div style={panel}>
          <h2 style={panelTitle}>Quick Role Guide</h2>
          <div style={{ display: 'grid', gap: 12, marginTop: 14 }}>
            <div style={guideCard}>
              <strong>Lab Assistant</strong>
              <p style={guideText}>Can add sessions, PCs, issues, and update daily records.</p>
            </div>
            <div style={guideCard}>
              <strong>Principal</strong>
              <p style={guideText}>Read-only access for checking reports and records.</p>
            </div>
            <div style={guideCard}>
              <strong>Admin / Section Head</strong>
              <p style={guideText}>Can manage users and supervise the entire system.</p>
            </div>
          </div>
        </div>
      </section>

      <section style={panel}>
        <h2 style={panelTitle}>All Users</h2>

        {loading ? (
          <p style={panelText}>Loading...</p>
        ) : users.length === 0 ? (
          <p style={panelText}>No users found.</p>
        ) : (
          <div style={{ overflowX: 'auto', marginTop: 12 }}>
            <table style={table}>
              <thead>
                <tr>
                  <th style={th}>Name</th>
                  <th style={th}>Email</th>
                  <th style={th}>Role</th>
                  <th style={th}>Status</th>
                  <th style={th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td style={td}>{user.full_name || 'User'}</td>
                    <td style={td}>{user.email}</td>
                    <td style={td}>{user.role}</td>
                    <td style={td}>{user.is_active ? 'Active' : 'Inactive'}</td>
                    <td style={td}>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button style={smallBtn} onClick={() => updateUser(user.id, { role: 'lab_assistant' })}>
                          Assistant
                        </button>
                        <button style={smallBtn} onClick={() => updateUser(user.id, { role: 'principal' })}>
                          Principal
                        </button>
                        <button style={smallBtn} onClick={() => updateUser(user.id, { role: 'admin' })}>
                          Admin
                        </button>
                        <button
                          style={smallBtn}
                          onClick={() => updateUser(user.id, { is_active: !user.is_active })}
                        >
                          {user.is_active ? 'Disable' : 'Enable'}
                        </button>
                      </div>
                    </td>
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

const heroCard = {
  background: 'linear-gradient(135deg, #ffffff 0%, #eff6ff 100%)',
  border: '1px solid #dbe4f0',
  borderRadius: 24,
  padding: 28,
  boxShadow: '0 14px 32px rgba(15, 23, 42, 0.06)',
  marginBottom: 20,
};

const eyebrow = {
  margin: 0,
  color: '#2563eb',
  fontSize: 13,
  fontWeight: 800,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
};

const heroTitle = {
  margin: '8px 0',
  fontSize: 34,
  color: '#0f172a',
};

const heroText = {
  margin: 0,
  color: '#64748b',
  lineHeight: 1.7,
};

const twoCol = {
  display: 'grid',
  gridTemplateColumns: '1.1fr 0.9fr',
  gap: 18,
  marginBottom: 20,
};

const panel = {
  background: '#fff',
  border: '1px solid #dbe4f0',
  borderRadius: 22,
  padding: 22,
  boxShadow: '0 10px 24px rgba(15, 23, 42, 0.05)',
};

const panelTitle = {
  margin: 0,
  fontSize: 24,
  color: '#0f172a',
};

const panelText = {
  margin: '8px 0 0',
  color: '#64748b',
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
  cursor: 'pointer',
};

const guideCard = {
  border: '1px solid #e2e8f0',
  borderRadius: 16,
  padding: 16,
  background: '#f8fafc',
};

const guideText = {
  margin: '6px 0 0',
  color: '#64748b',
  lineHeight: 1.6,
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

const smallBtn = {
  padding: '8px 10px',
  borderRadius: 8,
  border: '1px solid #d1d5db',
  background: '#fff',
  cursor: 'pointer',
};