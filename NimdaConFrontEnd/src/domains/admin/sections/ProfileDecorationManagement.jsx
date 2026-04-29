import React, { useEffect, useState } from 'react';
import {
  createProfileDecorationAPI,
  getAdminProfileDecorationsAPI,
  uploadProfileDecorationImageAPI,
} from '@/api/profileDecorations';

const slugify = (value) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '');

const ProfileDecorationManagement = () => {
  const [decorations, setDecorations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [label, setLabel] = useState('');
  const [key, setKey] = useState('');
  const [requiredRole, setRequiredRole] = useState('');
  const [file, setFile] = useState(null);

  const loadDecorations = async () => {
    setLoading(true);
    const result = await getAdminProfileDecorationsAPI();
    if (result.success) {
      setDecorations(result.decorations);
    } else {
      alert(result.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    void loadDecorations();
  }, []);

  const handleLabelChange = (event) => {
    const nextLabel = event.target.value;
    setLabel(nextLabel);
    if (!key.trim()) {
      setKey(slugify(nextLabel));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!label.trim()) {
      alert('배지 이름을 입력해주세요.');
      return;
    }
    if (!key.trim()) {
      alert('배지 키를 입력해주세요.');
      return;
    }
    if (!file) {
      alert('배지 이미지를 선택해주세요.');
      return;
    }

    setSaving(true);
    try {
      const upload = await uploadProfileDecorationImageAPI(file);
      if (!upload.ok) {
        alert(upload.message);
        return;
      }

      const created = await createProfileDecorationAPI({
        key: key.trim(),
        label: label.trim(),
        requiredRoles: requiredRole.trim() ? [requiredRole.trim()] : [],
        filePath: upload.data.key,
      });
      if (!created.success) {
        alert(created.message);
        return;
      }

      setLabel('');
      setKey('');
      setRequiredRole('');
      setFile(null);
      event.currentTarget.reset();
      await loadDecorations();
      alert('프로필 배지가 등록되었습니다.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="admin__header-row">
        <h2 className="admin__section-title">프로필 배지 관리</h2>
      </div>

      <form
        onSubmit={handleSubmit}
        className="admin__content-card"
        style={{
          padding: '24px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '18px',
          marginBottom: '28px',
        }}
      >
        <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span className="admin__form-label">배지 이름</span>
          <input
            type="text"
            value={label}
            onChange={handleLabelChange}
            className="admin__form-input"
            placeholder="예: 체크 배지"
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span className="admin__form-label">배지 키</span>
          <input
            type="text"
            value={key}
            onChange={(event) => setKey(slugify(event.target.value))}
            className="admin__form-input"
            placeholder="예: check-badge"
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span className="admin__form-label">필요 권한</span>
          <select
            value={requiredRole}
            onChange={(event) => setRequiredRole(event.target.value)}
            className="admin__form-input"
          >
            <option value="">전체 사용자</option>
            <option value="ROLE_ADMIN">ROLE_ADMIN</option>
            <option value="ROLE_CARTEL">ROLE_CARTEL</option>
            <option value="ROLE_USER">ROLE_USER</option>
          </select>
        </label>

        <label
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <span className="admin__form-label">배지 이미지</span>
          <input
            type="file"
            accept=".svg,image/svg+xml,image/png,image/jpeg,image/webp"
            onChange={(event) => setFile(event.target.files?.[0] || null)}
            className="admin__form-input"
          />
        </label>

        <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="admin__btn admin__btn--primary" disabled={saving}>
            {saving ? '등록 중...' : '배지 등록'}
          </button>
        </div>
      </form>

      <div className="admin__content-card" style={{ padding: '24px' }}>
        {loading ? (
          <p className="admin__empty-text">불러오는 중...</p>
        ) : decorations.length === 0 ? (
          <p className="admin__empty-text">등록된 배지가 없습니다.</p>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
              gap: '16px',
            }}
          >
            {decorations.map((decoration) => (
              <div
                key={decoration.key}
                style={{
                  border: '1px solid #e5e5e5',
                  borderRadius: '14px',
                  padding: '18px',
                  background: '#fff',
                  textAlign: 'center',
                }}
              >
                <img
                  src={decoration.src}
                  alt={decoration.label}
                  style={{
                    width: '72px',
                    height: '72px',
                    objectFit: 'contain',
                    margin: '0 auto 12px',
                  }}
                />
                <p style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>
                  {decoration.label}
                </p>
                <p style={{ fontSize: '12px', color: '#8e8e8e' }}>
                  {decoration.key}
                </p>
                {decoration.requiredRoles?.length > 0 && (
                  <p style={{ fontSize: '12px', color: '#d97399', marginTop: '6px' }}>
                    {decoration.requiredRoles.join(', ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileDecorationManagement;
