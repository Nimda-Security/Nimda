import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import BlackLineButton from '@/components/Button/BlackLine';
import { useNavigate } from 'react-router-dom';
import { getAllUsersAPI, getAllGroupsAPI, createGroupAPI } from '@/api/admin/admin';
import { getAllProblemsAPI } from '@/api/problem';
import { getBoardListAPI, deleteBoardAPI } from '@/api/board';

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
  const [pendingUsers] = useState([
    { id: 1, nickname: 'user1', userId: 'user1', email: 'user1@example.com', createdAt: '2026-02-14' },
    { id: 2, nickname: 'user2', userId: 'user2', email: 'user2@example.com', createdAt: '2026-02-13' },
  ]);
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

  /**
   * 팀 목록 UI용 임시 로더
   * TODO: 실제 팀 목록 API 연동 시 교체
   */
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

  /**
   * 팀 생성 UI (임시)
   * TODO: 실제 팀 생성 API 연동
   */
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

  const menuItems = [
    { id: 'dashboard', label: '대시보드' },
    { id: 'users', label: '사용자 관리' }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <div>
            <h2 className="text-xl font-medium mb-8">대시보드</h2>
            <div className="border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-900 mb-4">관리 기능</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>문제 출제 및 관리</li>
                <li>사용자 권한 관리</li>
                <li>시스템 설정 변경</li>
                <li>로그 및 통계 확인</li>
              </ul>
            </div>
          </div>
        );
      case 'users':
        const getUserRoles = (user) => {
          if (!user.authorities || user.authorities.length === 0) {
            return [];
          }
          return user.authorities.map(auth => auth.authorityName || auth);
        };

        const hasRole = (user, role) => {
          const roles = getUserRoles(user);
          return roles.some(r => r.includes(role));
        };

        return (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-medium">사용자 관리</h2>
              <button
                onClick={loadUsers}
                disabled={loading}
                className="px-3 py-1.5 text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                {loading ? '로딩 중' : '새로고침'}
              </button>
            </div>

            {users.length > 0 ? (
              <div className="border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-white border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-700">
                        ID
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-700">
                        사용자명
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-700">
                        이메일
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-700">
                        가입일
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr
                        key={user.id}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => setSelectedUser(user)}
                      >
                        <td className="px-4 py-3 text-sm text-gray-900 text-center">
                          {user.id}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          <div className="flex items-center gap-2">
                            <span>{user.nickname || user.userId}</span>
                            {hasRole(user, 'ADMIN') && (
                              <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                                ADMIN
                              </span>
                            )}
                            {hasRole(user, 'USER') && (
                              <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                USER
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 text-center">
                          {user.email}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 text-center">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="border border-gray-200 p-8 text-center">
                <p className="text-sm text-gray-500 mb-4">사용자 목록이 비어있습니다.</p>
                <button
                  onClick={loadUsers}
                  className="px-3 py-1.5 text-sm border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  불러오기
                </button>
              </div>
            )}

            {/* 사용자 정보 모달 */}
            {selectedUser && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setSelectedUser(null)}>
                <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">사용자 정보</h3>
                    <button
                      onClick={() => setSelectedUser(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-600">ID</label>
                        <p className="text-sm font-medium">{selectedUser.id}</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">사용자 ID</label>
                        <p className="text-sm font-medium">{selectedUser.userId}</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">실명</label>
                        <p className="text-sm font-medium">{selectedUser.name || '-'}</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">닉네임</label>
                        <p className="text-sm font-medium">{selectedUser.nickname || '-'}</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">이메일</label>
                        <p className="text-sm font-medium">{selectedUser.email || '-'}</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">학번</label>
                        <p className="text-sm font-medium">{selectedUser.studentNum || '-'}</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">휴대폰 번호</label>
                        <p className="text-sm font-medium">{selectedUser.phoneNum || '-'}</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">학과</label>
                        <p className="text-sm font-medium">{selectedUser.major || '-'}</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">대학교</label>
                        <p className="text-sm font-medium">{selectedUser.universityName || '-'}</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">학년</label>
                        <p className="text-sm font-medium">{selectedUser.grade || '-'}</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">생년월일</label>
                        <p className="text-sm font-medium">{selectedUser.birth || '-'}</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">상태</label>
                        <p className="text-sm font-medium">{selectedUser.status || '-'}</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">가입일</label>
                        <p className="text-sm font-medium">
                          {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString() : '-'}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">수정일</label>
                        <p className="text-sm font-medium">
                          {selectedUser.updatedAt ? new Date(selectedUser.updatedAt).toLocaleString() : '-'}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">권한</label>
                        <div className="flex gap-2 mt-1">
                          {getUserRoles(selectedUser).map((role, idx) => (
                            <span
                              key={idx}
                              className={`px-2 py-0.5 text-xs font-medium rounded-full ${role.includes('ADMIN')
                                ? 'bg-red-100 text-red-800'
                                : 'bg-blue-100 text-blue-800'
                                }`}
                            >
                              {role}
                            </span>
                          ))}
                        </div>
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
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-medium">승인 대기 목록</h2>
            </div>

            {pendingUsers.length > 0 ? (
              <div className="border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-white border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-700">ID</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-700">닉네임</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-700">사용자 ID</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-700">이메일</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-700">신청일</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-700">작업</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pendingUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900 text-center">{user.id}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-center">{user.nickname}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 text-center">{user.userId}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 text-center">{user.email}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 text-center">{user.createdAt}</td>
                        <td className="px-4 py-3 text-sm text-center">
                          <div className="flex gap-2 justify-center">
                            <button className="px-3 py-1 text-xs bg-green-100 text-green-800 hover:bg-green-200 rounded">
                              승인
                            </button>
                            <button className="px-3 py-1 text-xs bg-red-100 text-red-800 hover:bg-red-200 rounded">
                              거부
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="border border-gray-200 p-8 text-center">
                <p className="text-sm text-gray-500">승인 대기 중인 사용자가 없습니다.</p>
              </div>
            )}
          </div>
        );
      case 'posts':
        const handleDeletePost = async (postId) => {
          if (!confirm('정말 이 게시글을 삭제하시겠습니까?')) {
            return;
          }

          try {
            const result = await deleteBoardAPI(postId);
            if (result.success) {
              alert('게시글이 삭제되었습니다.');
              loadPosts(); // 목록 새로고침
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
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-medium">글 관리</h2>
              <button
                onClick={loadPosts}
                disabled={postsLoading}
                className="px-3 py-1.5 text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                {postsLoading ? '로딩 중' : '새로고침'}
              </button>
            </div>

            {posts.length > 0 ? (
              <div className="border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-white border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-700">ID</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-700">제목</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-700">작성자</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-700">게시판 타입</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-700">작성일</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-700">작업</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {posts.map((post) => (
                      <tr key={post.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900 text-center">{post.id}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{post.title}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 text-center">{post.author?.nickname || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 text-center">{post.boardType || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 text-center">
                          {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-center">
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditPost(post);
                              }}
                              className="px-3 py-1 text-xs bg-blue-100 text-blue-800 hover:bg-blue-200 rounded"
                            >
                              수정
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeletePost(post.id);
                              }}
                              className="px-3 py-1 text-xs bg-red-100 text-red-800 hover:bg-red-200 rounded"
                            >
                              삭제
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="border border-gray-200 p-8 text-center">
                <p className="text-sm text-gray-500 mb-4">게시글이 없습니다.</p>
                <button
                  onClick={loadPosts}
                  className="px-3 py-1.5 text-sm border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  불러오기
                </button>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="flex min-h-screen">

        {/* Aside 영역 */}
        <aside className="w-56 border-r border-gray-200 p-6">

          <div className="mb-8">
            <h1 className="text-sm font-medium text-gray-900">관리자</h1>
            <button
              onClick={goBack}
              className="text-xs text-gray-500 hover:text-gray-900 mt-2"
            >
              메인으로
            </button>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full text-left px-3 py-2 text-sm transition-colors ${activeSection === item.id
                  ? 'text-gray-900 font-medium'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={() => {
                setActiveSection('pending');
              }}
              className={`w-full text-left px-3 py-2 text-sm transition-colors ${activeSection === 'pending'
                ? 'text-gray-900 font-medium'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              승인 대기 목록
              <span className="ml-2 px-1.5 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded">
                {pendingUsers.length}
              </span>
            </button>
            <button
              onClick={() => {
                setActiveSection('posts');
                loadPosts();
              }}
              className={`w-full text-left px-3 py-2 text-sm transition-colors ${activeSection === 'posts'
                ? 'text-gray-900 font-medium'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              글 관리
            </button>
          </nav>
        </aside>

        {/* 메인 콘텐츠 영역 */}
        <main className="flex-1 p-8 bg-white">
          {renderContent()}
        </main>

      </div>
    </Layout>
  );
}

export default AdminDashboard;
