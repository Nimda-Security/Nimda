import React, { useEffect, useState } from 'react';
import {
  createProfileDecorationAPI,
  deleteProfileDecorationAPI,
  grantProfileDecorationAPI,
  getAdminProfileDecorationsAPI,
  revokeProfileDecorationAPI,
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
  const [deletingId, setDeletingId] = useState(null);
  const [ownershipSubmitting, setOwnershipSubmitting] = useState(false);
  const [label, setLabel] = useState('');
  const [key, setKey] = useState('');
  const [file, setFile] = useState(null);
  const [studentNum, setStudentNum] = useState('');
  const [selectedDecorationId, setSelectedDecorationId] = useState('');

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
        filePath: upload.data.key,
        purchaseRequired: true,
      });
      if (!created.success) {
        alert(created.message);
        return;
      }

      setLabel('');
      setKey('');
      setFile(null);
      event.currentTarget.reset();
      await loadDecorations();
      alert('프로필 배지가 등록되었습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (decoration) => {
    if (!decoration.id) {
      alert('배지 ID를 찾을 수 없습니다.');
      return;
    }
    if (!window.confirm(`"${decoration.label}" 배지를 삭제하시겠습니까?`)) {
      return;
    }

    setDeletingId(decoration.id);
    try {
      const result = await deleteProfileDecorationAPI(decoration.id);
      if (!result.success) {
        alert(result.message);
        return;
      }
      setDecorations((prev) => prev.filter((item) => item.id !== decoration.id));
      alert(result.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleOwnershipSubmit = async (mode) => {
    const trimmedStudentNum = studentNum.trim();
    const decorationId = Number(selectedDecorationId);
    if (!trimmedStudentNum) {
      alert('학번을 입력해주세요.');
      return;
    }
    if (!decorationId) {
      alert('배지를 선택해주세요.');
      return;
    }

    setOwnershipSubmitting(true);
    try {
      const result = mode === 'grant'
        ? await grantProfileDecorationAPI({ studentNum: trimmedStudentNum, decorationId })
        : await revokeProfileDecorationAPI({ studentNum: trimmedStudentNum, decorationId });
      alert(result.message);
      if (result.success) {
        setStudentNum('');
      }
    } finally {
      setOwnershipSubmitting(false);
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
            accept="image/png,image/jpeg"
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

      <div
        className="admin__content-card"
        style={{
          padding: '24px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '18px',
          marginBottom: '28px',
        }}
      >
        <div style={{ gridColumn: '1 / -1' }}>
          <h3 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: 800 }}>
            배지 지급/회수
          </h3>
          <p style={{ margin: 0, fontSize: '13px', color: '#8e8e8e' }}>
            학번과 배지를 선택해 특정 사용자에게 배지를 지급하거나 회수합니다.
          </p>
        </div>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span className="admin__form-label">학번</span>
          <input
            type="text"
            value={studentNum}
            onChange={(event) => setStudentNum(event.target.value)}
            className="admin__form-input"
            placeholder="예: 202400001"
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span className="admin__form-label">배지</span>
          <select
            value={selectedDecorationId}
            onChange={(event) => setSelectedDecorationId(event.target.value)}
            className="admin__form-input"
          >
            <option value="">배지를 선택하세요</option>
            {decorations.map((decoration) => (
              <option key={decoration.id ?? decoration.key} value={decoration.id}>
                {decoration.label} ({decoration.key})
              </option>
            ))}
          </select>
        </label>

        <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button
            type="button"
            className="admin__btn admin__btn--primary"
            disabled={ownershipSubmitting}
            onClick={() => handleOwnershipSubmit('grant')}
          >
            지급
          </button>
          <button
            type="button"
            className="admin__btn admin__btn--danger"
            disabled={ownershipSubmitting}
            onClick={() => handleOwnershipSubmit('revoke')}
          >
            회수
          </button>
        </div>
      </div>

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
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
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
                <p style={{ fontSize: '12px', color: '#d97399', marginTop: '6px' }}>
                  지급/구매 필요
                </p>
                <button
                  type="button"
                  onClick={() => handleDelete(decoration)}
                  disabled={deletingId === decoration.id}
                  className="admin__btn admin__btn--danger"
                  style={{
                    width: '100%',
                    marginTop: '14px',
                    justifyContent: 'center',
                  }}
                >
                  {deletingId === decoration.id ? '삭제 중...' : '삭제'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileDecorationManagement;
