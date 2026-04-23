'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function ProfilePage() {
  const supabase = createClient();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);

  const [form, setForm] = useState({
    full_name: '',
  });

  const avatarPreview = useMemo(() => {
    if (!avatarFile) return '';
    return URL.createObjectURL(avatarFile);
  }, [avatarFile]);

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    setLoading(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      alert(userError.message);
      setLoading(false);
      return;
    }

    if (!user) {
      alert('No logged in user found.');
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, role, avatar_url')
      .eq('id', user.id)
      .single();

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    setProfile(data);
    setForm({
      full_name: data?.full_name || '',
    });

    setLoading(false);
  }

  function handleChange(e) {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  async function uploadAvatar(userId) {
    if (!avatarFile) {
      return profile?.avatar_url || '';
    }

    const fileExt = avatarFile.name.split('.').pop();
    const filePath = `${userId}/avatar-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, avatarFile, {
        upsert: true,
      });

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    const { data: publicData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    if (!publicData?.publicUrl) {
      throw new Error('Could not generate avatar public URL');
    }

    return `${publicData.publicUrl}?t=${Date.now()}`;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!profile?.id) {
      alert('Profile not loaded');
      return;
    }

    try {
      setSaving(true);

      const avatarUrl = await uploadAvatar(profile.id);

      const payload = {
        full_name: form.full_name,
        avatar_url: avatarUrl || null,
      };

      const { data: updatedData, error: updateError } = await supabase
        .from('profiles')
        .update(payload)
        .eq('id', profile.id)
        .select()
        .single();

      if (updateError) {
        throw new Error(`Profile update failed: ${updateError.message}`);
      }

      if (!updatedData) {
        throw new Error('Profile updated but no row returned');
      }

      setProfile(updatedData);
      setAvatarFile(null);

      alert('Profile updated successfully');
    } catch (err) {
      alert(err.message || 'Failed to update profile');
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main style={{ padding: 24 }}>
        <div style={loadingCard}>
          <h2 style={{ margin: 0 }}>Loading profile...</h2>
          <p style={{ marginTop: 8, color: '#64748b' }}>
            Please wait while your account information is loading.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main style={{ display: 'grid', gap: 16 }}>
      <section style={heroCard}>
        <div>
          <p style={eyebrow}>PROFILE SETTINGS</p>
          <h1 style={heroTitle}>My Profile</h1>
          <p style={heroText}>
            Update your display name and profile avatar for the lab management system.
          </p>
        </div>

        <div style={profileSummary}>
          {avatarPreview ? (
            <img src={avatarPreview} alt="Preview" style={largeAvatar} />
          ) : profile?.avatar_url ? (
            <img src={profile.avatar_url} alt={profile?.full_name || 'User'} style={largeAvatar} />
          ) : (
            <div style={largeAvatarFallback}>
              {(profile?.full_name || 'U').charAt(0).toUpperCase()}
            </div>
          )}

          <div>
            <div style={profileName}>{profile?.full_name || 'User'}</div>
            <div style={profileMeta}>{profile?.email || ''}</div>
            <div style={roleBadge}>{profile?.role || 'Role'}</div>
          </div>
        </div>
      </section>

      <section style={card}>
        <h2 style={sectionTitle}>Update Profile</h2>

        <form onSubmit={handleSubmit} style={formGrid}>
          <div>
            <label style={label}>Full Name</label>
            <input
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              placeholder="Enter full name"
              style={input}
            />
          </div>

          <div>
            <label style={label}>Email</label>
            <input value={profile?.email || ''} disabled style={inputDisabled} />
          </div>

          <div>
            <label style={label}>Role</label>
            <input value={profile?.role || ''} disabled style={inputDisabled} />
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label style={label}>Upload Avatar</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
              style={fileInput}
            />
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <button type="submit" disabled={saving} style={saveBtn}>
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
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
  display: 'grid',
  gridTemplateColumns: '1.2fr 0.8fr',
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

const profileSummary = {
  display: 'flex',
  alignItems: 'center',
  gap: 16,
  background: '#fff',
  border: '1px solid #dbe4f0',
  borderRadius: 16,
  padding: 16,
};

const largeAvatar = {
  width: 90,
  height: 90,
  borderRadius: '50%',
  objectFit: 'cover',
};

const largeAvatarFallback = {
  width: 90,
  height: 90,
  borderRadius: '50%',
  background: '#2563eb',
  color: '#fff',
  display: 'grid',
  placeItems: 'center',
  fontSize: 30,
  fontWeight: 800,
};

const profileName = {
  fontWeight: 800,
  fontSize: 18,
  color: '#0f172a',
};

const profileMeta = {
  marginTop: 4,
  color: '#64748b',
  fontSize: 14,
};

const roleBadge = {
  marginTop: 8,
  display: 'inline-flex',
  alignItems: 'center',
  padding: '5px 10px',
  borderRadius: 999,
  fontSize: 11,
  fontWeight: 700,
  background: '#dbeafe',
  color: '#1d4ed8',
  textTransform: 'capitalize',
};

const card = {
  background: '#fff',
  border: '1px solid #dbe4f0',
  borderRadius: 18,
  padding: 18,
  boxShadow: '0 8px 20px rgba(15, 23, 42, 0.04)',
};

const sectionTitle = {
  marginTop: 0,
  marginBottom: 16,
  color: '#0f172a',
  fontSize: 22,
};

const formGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
  gap: 14,
};

const label = {
  display: 'block',
  marginBottom: 8,
  fontWeight: 700,
  color: '#0f172a',
};

const input = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 12,
  border: '1px solid #cbd5e1',
  background: '#f8fafc',
  fontSize: 15,
  boxSizing: 'border-box',
};

const inputDisabled = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 12,
  border: '1px solid #e2e8f0',
  background: '#f8fafc',
  fontSize: 15,
  color: '#64748b',
  boxSizing: 'border-box',
};

const fileInput = {
  width: '100%',
  padding: '10px 0',
};

const saveBtn = {
  padding: '13px 18px',
  borderRadius: 12,
  border: 'none',
  background: '#2563eb',
  color: '#fff',
  fontWeight: 800,
  fontSize: 15,
  cursor: 'pointer',
};