import React, { useState, useEffect } from 'react';
import NavBar from '@/components/Layout/Header/NavBar';
import Footer from '@/components/Layout/Footer';
import { useNavigate } from 'react-router-dom';
import { getAllUsersAPI, getAllGroupsAPI, createGroupAPI, getPendingUsersAPI, approveUserAPI, rejectUserAPI } from '@/api/admin/admin';
import { getAllProblemsAPI } from '@/api/problem';
import { getBoardListAPI, deleteBoardAPI } from '@/api/board';
import './AdminDashboard.css';

function AdminDashboard() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [problemsLoading, setProblemsLoading] = useState(false);
  const [teams, setTeams] = useState([]);
  const [teamsLoading, setTeamsLoading] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamMaxMembers, setNewTeamMaxMembers] = useState(5);
  const [newTeamPublic, setNewTeamPublic] = useState(true);
  const [newTeamCode, setNewTeamCode] = useState('');
  const [creatingTeam, setCreatingTeam] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [pendingUsersLoading, setPendingUsersLoading] = useState(false);
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);

  const goToProblemCreate = () => {
    navigate('/problem-create');
  };

  const goToProblemDetail = (problemId) => {
    navigate(`/problems/${problemId}`, {
      state: { from: 'admin' }
    });
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const result = await getAllUsersAPI();
      if (result.success) {
        setUsers(result.users || []);
      } else {
        alert('사용자 목록을 불러오는데 실패했습니다: ' + result.message);
      }
    } catch (error) {
      console.error('사용자 목록 로드 오류:', error);
      alert('사용자 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const loadProblems = async () => {
    setProblemsLoading(true);
    try {
      const result = await getAllProblemsAPI();
      if (result.success) {
        setProblems(result.problems || []);
      } else {
        alert('문제 목록을 불러오는데 실패했습니다: ' + result.message);
      }
    } catch (error) {
      console.error('문제 목록 로드 오류:', error);
      alert('문제 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setProblemsLoading(false);
    }
  };

  const loadTeams = async () => {
    setTeamsLoading(true);
    try {
      const result = await getAllGroupsAPI();
      if (result.success) {
        const mapped = (result.groups || []).map((group) => ({
          id: group.groupId,
          name: group.groupName,
          leader: group.creatorUserId
            ? `사용자 #${group.creatorUserId}`
            : '알 수 없음',
          members: group.activeMemberCount ?? 0,
          maxMembers: group.maxMembers,
          isPublic: group.isPublic,
          createdAt: group.createdAt
            ? new Date(group.createdAt).toISOString().slice(0, 10)
            : '-',
          participationCode: group.participationCode,
        }));
        setTeams(mapped);
      } else {
        alert(result.message || '팀 목록을 불러오지 못했습니다.');
      }
    } catch (error) {
      console.error('팀 목록 로드 오류:', error);
      alert('팀 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setTeamsLoading(false);
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!newTeamName.trim()) {
      alert('팀 이름을 입력해주세요.');
      return;
    }
    const currentUserStr = localStorage.getItem('user');
    const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
    if (!currentUser?.id) {
      alert('로그인 정보가 없습니다. 다시 로그인해주세요.');
      return;
    }

    setCreatingTeam(true);
    try {
      const payload = {
        groupName: newTeamName,
        maxMembers: newTeamMaxMembers,
        participationCode: newTeamCode || undefined,
        isPublic: newTeamPublic,
        creatorUserId: currentUser.id,
      };
      const result = await createGroupAPI(payload);
      if (result.success && result.group) {
        alert('팀이 생성되었습니다.');
        setTeams((prev) => [
          {
            id: result.group.groupId,
            name: result.group.groupName,
            leader: currentUser.nickname || currentUser.userId || '관리자',
            members: 1,
            maxMembers: result.group.maxMembers,
            isPublic: result.group.isPublic,
            createdAt: result.group.createdAt
              ? new Date(result.group.createdAt).toISOString().slice(0, 10)
              : new Date().toISOString().slice(0, 10),
            participationCode: result.group.participationCode,
          },
          ...prev,
        ]);
        setNewTeamName('');
        setNewTeamMaxMembers(5);
        setNewTeamPublic(true);
        setNewTeamCode('');
      } else {
        alert(result.message || '팀 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('팀 생성 오류:', error);
      alert('팀 생성 중 오류가 발생했습니다.');
    } finally {
      setCreatingTeam(false);
    }
  };

  const goToSystemSettings = () => {
    alert('시스템 설정 기능 (구현 예정)');
  };

  const goBack = () => {
    navigate('/');
  };

  const loadPosts = async () => {
    setPostsLoading(true);
    try {
      const result = await getBoardListAPI({ boardType: 'NEWS', page: 0, size: 20 });
      if (result.success) {
        setPosts(result.posts || []);
      } else {
        alert('게시글 목록을 불러오는데 실패했습니다: ' + result.message);
      }
    } catch (error) {
      console.error('게시글 목록 로드 오류:', error);
      alert('게시글 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setPostsLoading(false);
    }
  };

  const loadPendingUsers = async () => {
    setPendingUsersLoading(true);
    try {
      const result = await getPendingUsersAPI();
      if (result.success) {
        setPendingUsers(result.users || []);
      } else {
        alert('승인 대기 사용자 목록을 불러오는데 실패했습니다: ' + result.message);
      }
    } catch (error) {
      console.error('승인 대기 사용자 목록 로드 오류:', error);
      alert('승인 대기 사용자 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setPendingUsersLoading(false);
    }
  };

  const handleApproveUser = async (userId) => {
    if (!confirm('이 사용자를 승인하시겠습니까?')) return;
    try {
      const result = await approveUserAPI(userId);
      if (result.success) {
        alert('사용자가 승인되었습니다.');
        loadPendingUsers();
        loadUsers();
      } else {
        alert(result.message || '사용자 승인에 실패했습니다.');
      }
    } catch (error) {
      console.error('사용자 승인 오류:', error);
      alert('사용자 승인 중 오류가 발생했습니다.');
    }
  };

  const handleRejectUser = async (userId) => {
    if (!confirm('이 사용자의 승인을 거부하시겠습니까?')) return;
    try {
      const result = await rejectUserAPI(userId);
      if (result.success) {
        alert('사용자 승인이 거부되었습니다.');
        loadPendingUsers();
        loadUsers();
      } else {
        alert(result.message || '사용자 거부에 실패했습니다.');
      }
    } catch (error) {
      console.error('사용자 거부 오류:', error);
      alert('사용자 거부 중 오류가 발생했습니다.');
    }
  };

  useEffect(() => {
    if (activeSection === 'pending') {
      loadPendingUsers();
    }
  }, [activeSection]);

  const menuItems = [
    { id: 'dashboard', label: '대시보드' },
    { id: 'users', label: '사용자 관리' }
  ];

  const getUserRoles = (user) => {
    if (!user.authorities || user.authorities.length === 0) return [];
    return user.authorities.map(auth => auth.authorityName || auth);
  };

  const hasRole = (user, role) => {
    return getUserRoles(user).some(r => r.includes(role));
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <div>
            <h2 className="admin__section-title">대시보드</h2>
            <div className="admin__info-box">
              <h3>관리 기능</h3>
              <ul>
                <li>문제 출제 및 관리</li>
                <li>사용자 권한 관리</li>
                <li>시스템 설정 변경</li>
                <li>로그 및 통계 확인</li>
              </ul>
            </div>
          </div>
        );

      case 'users':
        return (
          <div>
            <div className="admin__header-row">
              <h2 className="admin__section-title" style={{ marginBottom: 0 }}>사용자 관리</h2>
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
                      <tr key={user.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedUser(user)}>
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

            {/* 사용자 정보 모달 */}
            {selectedUser && (
              <div className="admin__modal-overlay" onClick={() => setSelectedUser(null)}>
                <div className="admin__modal" onClick={(e) => e.stopPropagation()}>
                  <div className="admin__modal-header">
                    <h3>사용자 정보</h3>
                    <button className="admin__modal-close" onClick={() => setSelectedUser(null)}>✕</button>
                  </div>
                  <div className="admin__modal-grid">
                    <div><p className="admin__modal-label">ID</p><p className="admin__modal-value">{selectedUser.id}</p></div>
                    <div><p className="admin__modal-label">사용자 ID</p><p className="admin__modal-value">{selectedUser.userId}</p></div>
                    <div><p className="admin__modal-label">실명</p><p className="admin__modal-value">{selectedUser.name || '-'}</p></div>
                    <div><p className="admin__modal-label">닉네임</p><p className="admin__modal-value">{selectedUser.nickname || '-'}</p></div>
                    <div><p className="admin__modal-label">이메일</p><p className="admin__modal-value">{selectedUser.email || '-'}</p></div>
                    <div><p className="admin__modal-label">학번</p><p className="admin__modal-value">{selectedUser.studentNum || '-'}</p></div>
                    <div><p className="admin__modal-label">휴대폰 번호</p><p className="admin__modal-value">{selectedUser.phoneNum || '-'}</p></div>
                    <div><p className="admin__modal-label">학과</p><p className="admin__modal-value">{selectedUser.major || '-'}</p></div>
                    <div><p className="admin__modal-label">대학교</p><p className="admin__modal-value">{selectedUser.universityName || '-'}</p></div>
                    <div><p className="admin__modal-label">학년</p><p className="admin__modal-value">{selectedUser.grade || '-'}</p></div>
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
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'pending':
        return (
          <div>
            <div className="admin__header-row">
              <h2 className="admin__section-title" style={{ marginBottom: 0 }}>승인 대기 목록</h2>
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

      case 'posts':
        const handleDeletePost = async (postId) => {
          if (!confirm('정말 이 게시글을 삭제하시겠습니까?')) return;
          try {
            const result = await deleteBoardAPI(postId);
            if (result.success) {
              alert('게시글이 삭제되었습니다.');
              loadPosts();
            } else {
              alert(result.message || '게시글 삭제에 실패했습니다.');
            }
          } catch (error) {
            console.error('게시글 삭제 오류:', error);
            alert('게시글 삭제 중 오류가 발생했습니다.');
          }
        };

        const handleEditPost = (post) => {
          navigate(`/board/${post.boardType}/edit/${post.id}`);
        };

        return (
          <div>
            <div className="admin__header-row">
              <h2 className="admin__section-title" style={{ marginBottom: 0 }}>글 관리</h2>
              <button onClick={loadPosts} disabled={postsLoading} className="admin__btn">
                {postsLoading ? '로딩 중' : '새로고침'}
              </button>
            </div>

            {posts.length > 0 ? (
              <div className="admin__table-wrap">
                <table className="admin__table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>제목</th>
                      <th>작성자</th>
                      <th>게시판 타입</th>
                      <th>작성일</th>
                      <th>작업</th>
                    </tr>
                  </thead>
                  <tbody>
                    {posts.map((post) => (
                      <tr key={post.id}>
                        <td>{post.id}</td>
                        <td style={{ textAlign: 'left' }}>{post.title}</td>
                        <td>{post.author?.nickname || '-'}</td>
                        <td>{post.boardType || '-'}</td>
                        <td>{post.createdAt ? new Date(post.createdAt).toLocaleDateString() : '-'}</td>
                        <td>
                          <div className="admin__actions">
                            <button onClick={(e) => { e.stopPropagation(); handleEditPost(post); }} className="admin__btn--edit">수정</button>
                            <button onClick={(e) => { e.stopPropagation(); handleDeletePost(post.id); }} className="admin__btn--reject">삭제</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="admin__empty">
                <p style={{ marginBottom: 16 }}>게시글이 없습니다.</p>
                <button onClick={loadPosts} className="admin__btn">불러오기</button>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="layout">
      <NavBar />
      <div className="layout__body">
        <div className="admin">

          {/* Sidebar */}
          <aside className="admin__sidebar">
            <h1 className="admin__sidebar-title">관리자</h1>
            <button onClick={goBack} className="admin__sidebar-back">메인으로</button>

            <nav className="admin__nav">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`admin__nav-item ${activeSection === item.id ? 'admin__nav-item--active' : ''}`}
                >
                  {item.label}
                </button>
              ))}
              <button
                onClick={() => setActiveSection('pending')}
                className={`admin__nav-item ${activeSection === 'pending' ? 'admin__nav-item--active' : ''}`}
              >
                승인 대기 목록
                <span className="admin__badge">{pendingUsers.length}</span>
              </button>
              <button
                onClick={() => { setActiveSection('posts'); loadPosts(); }}
                className={`admin__nav-item ${activeSection === 'posts' ? 'admin__nav-item--active' : ''}`}
              >
                글 관리
              </button>
            </nav>
          </aside>

          {/* Content */}
          <main className="admin__content">
            {renderContent()}
          </main>

        </div>
      </div>
      <Footer />
    </div>
  );
}

export default AdminDashboard;
