import React from 'react';
import { useNavigate } from 'react-router-dom';

const UserInfo = ({
  users,
  loading,
  loadUsers,
  selectedUser,
  setSelectedUser,
  onSelectUser,
  hasRole,
  getUserRoles,
  uploadingImage,
  handleImageUpload,
  availableRoles,
  grantingRole,
  handleGrantRole,
  removingRole,
  handleRemoveRole,
}) => {
  const navigate = useNavigate();
  const [selectedRoleToGrant, setSelectedRoleToGrant] = React.useState('');

  React.useEffect(() => {
    setSelectedRoleToGrant('');
  }, [selectedUser?.id]);

  return (
    <div>
      <div className="admin__header-row">
        <h2 className="admin__section-title">유저 정보</h2>
        <button onClick={loadUsers} disabled={loading} className="admin__btn">
          {loading ? '로딩 중' : '새로고침'}
        </button>
      </div>

      {users.length > 0 ? (
        <div className="admin__table-wrap">
          <table className="admin__table">
            <thead>
              <tr>
                <th>ID</th>
                <th>사용자명</th>
                <th>이메일</th>
                <th>가입일</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} style={{ cursor: 'pointer' }} onClick={() => onSelectUser ? onSelectUser(user) : setSelectedUser(user)}>
                  <td>{user.id}</td>
                  <td style={{ textAlign: 'left' }}>
                    <span>{user.nickname || user.userId}</span>
                    {hasRole(user, 'ADMIN') && (
                      <span className="admin__role admin__role--admin" style={{ marginLeft: 8 }}>ADMIN</span>
                    )}
                    {hasRole(user, 'USER') && (
                      <span className="admin__role admin__role--user" style={{ marginLeft: 8 }}>USER</span>
                    )}
                  </td>
                  <td>{user.email}</td>
                  <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="admin__empty">
          <p style={{ marginBottom: 16 }}>사용자 목록이 비어있습니다.</p>
          <button onClick={loadUsers} className="admin__btn">불러오기</button>
        </div>
      )}

      {selectedUser && (
        <div className="admin__modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="admin__modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin__modal-header">
              <h3>사용자 정보</h3>
              <button className="admin__modal-close" onClick={() => setSelectedUser(null)}>✕</button>
            </div>

            <div style={{ padding: '20px', borderBottom: '1px solid #e0e0e0', textAlign: 'center' }}>
              <div style={{ marginBottom: '12px' }}>
                {selectedUser.profileImage ? (
                  <img
                    src={selectedUser.profileImage}
                    alt="프로필"
                    style={{
                      width: '120px',
                      height: '120px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2px solid #e0e0e0'
                    }}
                  />
                ) : (
                  <img
                    src="/default_user_profile.svg"
                    alt="기본 프로필"
                    style={{
                      width: '120px',
                      height: '120px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2px solid #e0e0e0',
                      margin: '0 auto'
                    }}
                  />
                )}
              </div>
              <div>
                <input
                  type="file"
                  id="profile-image-input"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                />
                <button
                  className="admin__btn"
                  disabled={uploadingImage}
                  onClick={() => document.getElementById('profile-image-input').click()}
                  style={{ cursor: uploadingImage ? 'not-allowed' : 'pointer' }}
                >
                  {uploadingImage ? '업로드 중...' : '사진 추가'}
                </button>
              </div>
            </div>

            <div className="admin__modal-grid">
              <div><p className="admin__modal-label">ID</p><p className="admin__modal-value">{selectedUser.id}</p></div>
              <div><p className="admin__modal-label">사용자 ID</p><p className="admin__modal-value">{selectedUser.userId}</p></div>
              <div><p className="admin__modal-label">실명</p><p className="admin__modal-value">{selectedUser.name || '-'}</p></div>
              <div><p className="admin__modal-label">닉네임</p><p className="admin__modal-value">{selectedUser.nickname || '-'}</p></div>
              <div><p className="admin__modal-label">이메일</p><p className="admin__modal-value">{selectedUser.email || '-'}</p></div>
              <div><p className="admin__modal-label">학번</p><p className="admin__modal-value">{selectedUser.studentNum || '-'}</p></div>
              <div><p className="admin__modal-label">학과</p><p className="admin__modal-value">{selectedUser.major || '-'}</p></div>
              <div><p className="admin__modal-label">생년월일</p><p className="admin__modal-value">{selectedUser.birth || '-'}</p></div>
              <div><p className="admin__modal-label">상태</p><p className="admin__modal-value">{selectedUser.status || '-'}</p></div>
              <div><p className="admin__modal-label">가입일</p><p className="admin__modal-value">{selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString() : '-'}</p></div>
              <div><p className="admin__modal-label">수정일</p><p className="admin__modal-value">{selectedUser.updatedAt ? new Date(selectedUser.updatedAt).toLocaleString() : '-'}</p></div>
              <div>
                <p className="admin__modal-label">권한</p>
                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                  {getUserRoles(selectedUser).map((role, idx) => (
                    <span key={idx} className={`admin__role ${role.includes('ADMIN') ? 'admin__role--admin' : 'admin__role--user'}`}>
                      {role}
                    </span>
                  ))}
                </div>

                <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
                  <select
                    className="admin__btn"
                    value={selectedRoleToGrant}
                    onChange={(e) => setSelectedRoleToGrant(e.target.value)}
                    disabled={grantingRole}
                    style={{ minWidth: 180, backgroundColor: '#fff', border: '1px solid #ddd' }}
                  >
                    <option value="">권한 선택</option>
                    {availableRoles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="admin__btn"
                    disabled={grantingRole || !selectedRoleToGrant}
                    onClick={() => handleGrantRole(selectedUser.id, selectedRoleToGrant)}
                  >
                    {grantingRole ? '부여 중...' : '권한 부여'}
                  </button>
                  <button
                    type="button"
                    className="admin__btn"
                    disabled={removingRole || !selectedRoleToGrant}
                    onClick={() => handleRemoveRole(selectedUser.id, selectedRoleToGrant)}
                  >
                    {removingRole ? '제거 중...' : '권한 제거'}
                  </button>
                </div>
              </div>
              <div style={{ gridColumn: 'span 2', marginTop: '10px' }}>
                <button
                  className="admin__btn--approve"
                  style={{ width: '100%', padding: '10px' }}
                  onClick={() => {
                    const studentNum = selectedUser.studentNum || selectedUser.userId;
                    navigate(`/admin/mileage`, { state: { studentId: studentNum } });
                  }}
                >
                  💰 이 사용자에게 마일리지 직접 지급하기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserInfo;
