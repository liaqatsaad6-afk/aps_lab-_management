'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function SessionsPage() {
  const supabase = createClient();

  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [labs, setLabs] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');

  const [teacherFile, setTeacherFile] = useState(null);
  const [crFile, setCrFile] = useState(null);
  const [assistantFile, setAssistantFile] = useState(null);

  const teacherPreview = useMemo(
    () => (teacherFile ? URL.createObjectURL(teacherFile) : ''),
    [teacherFile]
  );
  const crPreview = useMemo(
    () => (crFile ? URL.createObjectURL(crFile) : ''),
    [crFile]
  );
  const assistantPreview = useMemo(
    () => (assistantFile ? URL.createObjectURL(assistantFile) : ''),
    [assistantFile]
  );

  const canManage =
    !profileLoading &&
    (profile?.role === 'admin' || profile?.role === 'lab_assistant');

  const emptyForm = {
    lab_id: '',
    session_no: '',
    session_date: '',
    day_name: '',
    start_time: '',
    end_time: '',
    teacher_name: '',
    class_name: '',
    topic: '',
    assistant_name: '',
    teacher_sign: '',
    cr_sign: '',
    assistant_sign: '',
  };

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    return () => {
      if (teacherPreview) URL.revokeObjectURL(teacherPreview);
      if (crPreview) URL.revokeObjectURL(crPreview);
      if (assistantPreview) URL.revokeObjectURL(assistantPreview);
    };
  }, [teacherPreview, crPreview, assistantPreview]);

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

      if (data?.full_name && !editingId) {
        setForm((prev) => ({
          ...prev,
          assistant_name: data.full_name,
        }));
      }
    } else {
      setProfile(null);
    }

    const [labsRes, sessionsRes] = await Promise.all([
      supabase.from('labs').select('id, name').order('name'),
      supabase
        .from('lab_sessions')
        .select(`
          id,
          lab_id,
          session_no,
          session_date,
          day_name,
          start_time,
          end_time,
          teacher_name,
          class_name,
          topic,
          teacher_sign,
          cr_sign,
          assistant_sign,
          assistant_name,
          labs(name)
        `)
        .order('session_date', { ascending: false })
        .order('created_at', { ascending: false }),
    ]);

    setLabs(labsRes.data || []);
    setSessions(sessionsRes.data || []);
    setProfileLoading(false);
    setLoading(false);
  }

  function handleChange(e) {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  function resetForm() {
    setForm({
      ...emptyForm,
      assistant_name: profile?.full_name || '',
    });
    setEditingId(null);
    setTeacherFile(null);
    setCrFile(null);
    setAssistantFile(null);
  }

  function openPreview(url, title) {
    setPreviewImage(url);
    setPreviewTitle(title);
  }

  function closePreview() {
    setPreviewImage('');
    setPreviewTitle('');
  }

  async function uploadSignature(file, folderName) {
    if (!file) return '';

    const fileExt = file.name.split('.').pop();
    const fileName = `${folderName}-${Date.now()}.${fileExt}`;
    const filePath = `session-signatures/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('signatures')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      throw new Error(`Storage upload failed: ${uploadError.message}`);
    }

    const { data } = supabase.storage.from('signatures').getPublicUrl(filePath);
    return data.publicUrl;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!canManage) {
      alert('You have view-only access.');
      return;
    }

    try {
      setSaving(true);

      const teacherSignUrl = await uploadSignature(teacherFile, 'teacher');
      const crSignUrl = await uploadSignature(crFile, 'cr');
      const assistantSignUrl = await uploadSignature(assistantFile, 'assistant');

      const payload = {
        ...form,
        teacher_sign: teacherSignUrl || form.teacher_sign,
        cr_sign: crSignUrl || form.cr_sign,
        assistant_sign: assistantSignUrl || form.assistant_sign,
      };

      let result;

      if (editingId) {
        result = await supabase
          .from('lab_sessions')
          .update(payload)
          .eq('id', editingId);
      } else {
        result = await supabase.from('lab_sessions').insert([payload]);
      }

      if (result.error) {
        alert(result.error.message);
        return;
      }

      alert(editingId ? 'Session updated successfully' : 'Lab session saved successfully');
      resetForm();
      loadData();
    } catch (err) {
      alert(err?.message || 'Failed to save session');
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(session) {
    if (!canManage) return;

    setEditingId(session.id);
    setTeacherFile(null);
    setCrFile(null);
    setAssistantFile(null);

    setForm({
      lab_id: session.lab_id || '',
      session_no: session.session_no || '',
      session_date: session.session_date || '',
      day_name: session.day_name || '',
      start_time: session.start_time || '',
      end_time: session.end_time || '',
      teacher_name: session.teacher_name || '',
      class_name: session.class_name || '',
      topic: session.topic || '',
      assistant_name: session.assistant_name || profile?.full_name || '',
      teacher_sign: session.teacher_sign || '',
      cr_sign: session.cr_sign || '',
      assistant_sign: session.assistant_sign || '',
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleDelete(id) {
    if (!canManage) return;

    const ok = window.confirm('Are you sure you want to delete this session record?');
    if (!ok) return;

    const { error } = await supabase.from('lab_sessions').delete().eq('id', id);

    if (error) {
      alert(error.message);
      return;
    }

    if (editingId === id) {
      resetForm();
    }

    alert('Session deleted successfully');
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
          <p style={eyebrow}>
            {canManage ? 'LAB ASSISTANT PANEL' : 'VIEW ONLY PANEL'}
          </p>
          <h1 style={heroTitle}>Lab Session Register</h1>
          <p style={heroText}>
            {canManage
              ? 'Record daily computer lab sessions, teacher details, class, timings, topic, and signatures.'
              : 'View daily computer lab sessions, teacher details, class timings, topics, and signatures.'}
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

      {canManage && (
        <section style={card}>
          <div style={sectionHeader}>
            <div>
              <h2 style={sectionTitle}>
                {editingId ? 'Edit Session Entry' : 'Add New Session'}
              </h2>
              <p style={sectionText}>
                Fill the session information, teaching details, and upload signatures.
              </p>
            </div>

            {editingId && (
              <button type="button" onClick={resetForm} style={cancelBtn}>
                Cancel Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} style={grid}>
            <input
              name="session_no"
              placeholder="Session No."
              value={form.session_no}
              onChange={handleChange}
              style={compactInput}
            />

            <select
              name="lab_id"
              value={form.lab_id || ''}
              onChange={handleChange}
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
              name="session_date"
              type="date"
              value={form.session_date}
              onChange={handleChange}
              style={compactInput}
              required
            />

            <input
              name="day_name"
              placeholder="Day"
              value={form.day_name}
              onChange={handleChange}
              style={compactInput}
            />

            <input
              name="start_time"
              type="time"
              value={form.start_time}
              onChange={handleChange}
              style={compactInput}
            />

            <input
              name="end_time"
              type="time"
              value={form.end_time}
              onChange={handleChange}
              style={compactInput}
            />

            <input
              name="teacher_name"
              placeholder="Teacher Name"
              value={form.teacher_name}
              onChange={handleChange}
              style={compactInput}
              required
            />

            <input
              name="class_name"
              placeholder="Class / Section"
              value={form.class_name}
              onChange={handleChange}
              style={compactInput}
              required
            />

            <input
              name="topic"
              placeholder="Topic / Lesson"
              value={form.topic}
              onChange={handleChange}
              style={compactInput}
            />
          <br></br>
            
            <SignatureUpload
              title="Teacher Signature"
              file={teacherFile}
              preview={teacherPreview}
              onChange={(file) => setTeacherFile(file)}
              onClear={() => setTeacherFile(null)}
            />

            <SignatureUpload
              title="CR Signature"
              file={crFile}
              preview={crPreview}
              onChange={(file) => setCrFile(file)}
              onClear={() => setCrFile(null)}
            />

            <SignatureUpload
              title="Assistant Signature"
              file={assistantFile}
              preview={assistantPreview}
              onChange={(file) => setAssistantFile(file)}
              onClear={() => setAssistantFile(null)}
            />

            <div style={submitWrap}>
              <button type="submit" style={primaryBtn} disabled={saving}>
                {saving ? 'Saving...' : editingId ? 'Update Session' : 'Save Session'}
              </button>
            </div>
          </form>
        </section>
      )}

      {!canManage && (
        <section style={noticeCard}>
          <div style={noticeTitle}>Principal View</div>
          <div style={noticeText}>
            You are logged in with view-only access. You can review session records and signatures,
            but you cannot add, edit, or delete entries.
          </div>
        </section>
      )}

      <section style={card}>
        <h2 style={sectionTitle}>Recent Sessions</h2>

        {loading ? (
          <p style={muted}>Loading...</p>
        ) : sessions.length === 0 ? (
          <p style={muted}>No sessions found.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={table}>
              <thead>
                <tr>
                  <th style={th}>Session No.</th>
                  <th style={th}>Date</th>
                  <th style={th}>Lab</th>
                  <th style={th}>Teacher</th>
                  <th style={th}>Class</th>
                  <th style={th}>Topic</th>
                  <th style={th}>Assistant</th>
                  <th style={th}>Signatures</th>
                  {canManage && <th style={th}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => (
                  <tr key={session.id}>
                    <td style={td}>{session.session_no || '-'}</td>
                    <td style={td}>{session.session_date}</td>
                    <td style={td}>{session.labs?.name || '-'}</td>
                    <td style={td}>{session.teacher_name}</td>
                    <td style={td}>{session.class_name}</td>
                    <td style={td}>{session.topic || '-'}</td>
                    <td style={td}>{session.assistant_name || '-'}</td>
                    <td style={td}>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {session.teacher_sign && (
                          <button
                            type="button"
                            onClick={() => openPreview(session.teacher_sign, 'Teacher Signature')}
                            style={signButton}
                          >
                            Teacher
                          </button>
                        )}
                        {session.cr_sign && (
                          <button
                            type="button"
                            onClick={() => openPreview(session.cr_sign, 'CR Signature')}
                            style={signButton}
                          >
                            CR
                          </button>
                        )}
                        {session.assistant_sign && (
                          <button
                            type="button"
                            onClick={() => openPreview(session.assistant_sign, 'Assistant Signature')}
                            style={signButton}
                          >
                            Assistant
                          </button>
                        )}
                      </div>
                    </td>
                    {canManage && (
                      <td style={td}>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <button type="button" onClick={() => handleEdit(session)} style={editBtn}>
                            Edit
                          </button>
                          <button type="button" onClick={() => handleDelete(session.id)} style={deleteBtn}>
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

      {previewImage && (
        <div style={modalOverlay} onClick={closePreview}>
          <div style={modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeader}>
              <h3 style={modalTitle}>{previewTitle}</h3>
              <button type="button" onClick={closePreview} style={modalCloseBtn}>
                Close
              </button>
            </div>
            <div style={modalBody}>
              <img src={previewImage} alt={previewTitle} style={modalImage} />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function SignatureUpload({ title, file, preview, onChange, onClear }) {
  return (
    <div style={uploadCard}>
      <div style={uploadHeader}>
        <span style={uploadTitle}>{title}</span>
        {file && (
          <button type="button" onClick={onClear} style={removeBtn}>
            Remove
          </button>
        )}
      </div>

      <label style={uploadArea}>
        {preview ? (
          <img src={preview} alt={title} style={previewImage} />
        ) : (
          <div style={placeholderBox}>
            <div style={placeholderTitle}>Choose image</div>
            <div style={placeholderText}>PNG, JPG, JPEG</div>
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => onChange(e.target.files?.[0] || null)}
          style={{ display: 'none' }}
        />
      </label>

      <div style={fileNameText}>{file ? file.name : 'No file selected'}</div>
    </div>
  );
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

const card = {
  background: '#fff',
  border: '1px solid #dbe4f0',
  borderRadius: 18,
  padding: 18,
  boxShadow: '0 8px 20px rgba(15, 23, 42, 0.04)',
  marginBottom: 16,
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

const assistantInfoCard = {
  border: '1px solid #d1d5db',
  borderRadius: 12,
  padding: 12,
  background: 'linear-gradient(135deg, #ffffff 0%, #eff6ff 100%)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
};

const assistantInfoLabel = {
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: '#2563eb',
  marginBottom: 4,
};

const assistantInfoName = {
  fontSize: 16,
  fontWeight: 800,
  color: '#0f172a',
};

const assistantInfoMeta = {
  marginTop: 4,
  fontSize: 12,
  color: '#64748b',
};

const uploadCard = {
  border: '1px solid #d1d5db',
  borderRadius: 12,
  padding: 10,
  background: '#f8fafc',
};

const uploadHeader = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 8,
  marginBottom: 8,
};

const uploadTitle = {
  fontWeight: 800,
  color: '#0f172a',
  fontSize: 14,
};

const removeBtn = {
  border: '1px solid #fecaca',
  background: '#fff1f2',
  color: '#be123c',
  borderRadius: 8,
  padding: '5px 8px',
  fontWeight: 700,
  cursor: 'pointer',
  fontSize: 12,
};

const uploadArea = {
  display: 'block',
  cursor: 'pointer',
};

const placeholderBox = {
  height: 82,
  borderRadius: 10,
  border: '1px dashed #cbd5e1',
  display: 'grid',
  placeItems: 'center',
  background: '#ffffff',
  textAlign: 'center',
  padding: 10,
};

const placeholderTitle = {
  fontWeight: 700,
  color: '#0f172a',
  fontSize: 14,
};

const placeholderText = {
  color: '#64748b',
  fontSize: 12,
  marginTop: 2,
};

const previewImage = {
  width: '100%',
  height: 82,
  objectFit: 'cover',
  borderRadius: 10,
  border: '1px solid #dbe4f0',
  background: '#fff',
};

const fileNameText = {
  marginTop: 8,
  fontSize: 12,
  color: '#64748b',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
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

const signButton = {
  padding: '5px 8px',
  borderRadius: 999,
  border: 'none',
  background: '#dbeafe',
  color: '#1d4ed8',
  fontSize: 11,
  fontWeight: 700,
  cursor: 'pointer',
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

const modalOverlay = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(15, 23, 42, 0.65)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 20,
  zIndex: 9999,
};

const modalCard = {
  width: '100%',
  maxWidth: 900,
  background: '#fff',
  borderRadius: 18,
  overflow: 'hidden',
};

const modalHeader = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '14px 18px',
  borderBottom: '1px solid #e5e7eb',
};

const modalTitle = {
  margin: 0,
  fontSize: 18,
  color: '#0f172a',
};

const modalCloseBtn = {
  padding: '8px 12px',
  borderRadius: 10,
  border: '1px solid #d1d5db',
  background: '#fff',
  color: '#0f172a',
  fontWeight: 700,
  cursor: 'pointer',
};

const modalBody = {
  padding: 18,
  background: '#f8fafc',
};

const modalImage = {
  width: '100%',
  maxHeight: '75vh',
  objectFit: 'contain',
  borderRadius: 12,
  background: '#fff',
};