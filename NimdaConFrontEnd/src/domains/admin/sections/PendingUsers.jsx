import React from 'react';

const PendingUsers = ({
  pendingUsers,
  pendingUsersLoading,
  loadPendingUsers,
  handleApproveUser,
  handleRejectUser,
}) => {
  return (
    <div>
      <div className="admin__header-row">
        <h2 className="admin__section-title">승인 대기 목록</h2>
        <button onClick={loadPendingUsers} disabled={pendingUsersLoading} className="admin__btn">
          {pendingUsersLoading ? '로딩 중' : '새로고침'}
        </button>
      </div>

      {pendingUsersLoading ? (
        <div className="admin__empty">로딩 중...</div>
      ) : pendingUsers.length > 0 ? (
        <div className="admin__table-wrap">
          <table className="admin__table">
            <thead>
              <tr>
                <th>ID</th>
                <th>닉네임</th>
                <th>사용자 ID</th>
                <th>이메일</th>
                <th>신청일</th>
                <th>작업</th>
              </tr>
            </thead>
            <tbody>
              {pendingUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.nickname || user.userId}</td>
                  <td>{user.userId}</td>
                  <td>{user.email}</td>
                  <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}</td>
                  <td>
                    <div className="admin__actions">
                      <button onClick={() => handleApproveUser(user.id)} className="admin__btn--approve">승인</button>
                      <button onClick={() => handleRejectUser(user.id)} className="admin__btn--reject">거부</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="admin__empty">승인 대기 중인 사용자가 없습니다.</div>
      )}
    </div>
  );
};

export default PendingUsers;
