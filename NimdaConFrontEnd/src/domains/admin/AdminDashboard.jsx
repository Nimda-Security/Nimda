import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import BlackLineButton from '@/components/Button/BlackLine';
import { useNavigate } from 'react-router-dom';
import { getAllUsersAPI, getAllGroupsAPI, createGroupAPI } from '@/api/admin/admin';
import { getAllProblemsAPI } from '@/api/problem';

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

  const menuItems = [
    { id: 'dashboard', label: '대시보드' },
    { id: 'problems', label: '문제 관리' },
    { id: 'users', label: '사용자 관리' },
    { id: 'teams', label: '팀 관리' }
  ];

  const renderContent = () => {
    switch(activeSection) {
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
      case 'problems':
        return (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-medium">문제 관리</h2>
              <div className="flex gap-2">
                <button
                  onClick={loadProblems}
                  disabled={problemsLoading}
                  className="px-3 py-1.5 text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  {problemsLoading ? '로딩 중' : '새로고침'}
                </button>
                <button
                  onClick={goToProblemCreate}
                  className="px-3 py-1.5 text-sm bg-black text-white hover:bg-gray-900"
                >
                  새 문제
                </button>
              </div>
            </div>
            
            {problems.length > 0 ? (
              <div className="border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-white border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">
                        ID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">
                        제목
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">
                        난이도
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">
                        언어
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">
                        테스트 케이스
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">
                        생성일
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {problems.map((problem) => (
                      <tr 
                        key={problem.id} 
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => goToProblemDetail(problem.id)}
                      >
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {problem.id}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          <div className="max-w-xs truncate" title={problem.title}>
                            {problem.title}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {problem.difficulty}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {problem.language}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {problem.testCases ? problem.testCases.length : 0}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {problem.createdAt ? new Date(problem.createdAt).toLocaleDateString() : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="border border-gray-200 p-8 text-center">
                <p className="text-sm text-gray-500 mb-4">등록된 문제가 없습니다.</p>
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={loadProblems}
                    className="px-3 py-1.5 text-sm border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    불러오기
                  </button>
                  <button
                    onClick={goToProblemCreate}
                    className="px-3 py-1.5 text-sm bg-black text-white hover:bg-gray-900"
                  >
                    새 문제
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      case 'users':
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
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">
                        ID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">
                        사용자명
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">
                        이메일
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">
                        가입일
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {user.id}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {user.nickname || user.userId}
                          {(user.nickname === 'admin' || user.userId === 'admin') && (
                            <span className="ml-2 text-xs text-gray-500">
                              ADMIN
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {user.email}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
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
          </div>
        );
      case 'teams':
        return (
          <div className="space-y-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-medium">팀 관리</h2>
              <button
                onClick={loadTeams}
                disabled={teamsLoading}
                className="px-3 py-1.5 text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                {teamsLoading ? '로딩 중' : '새로고침'}
              </button>
            </div>

            <div className="border border-gray-200 p-6 mb-8">
              <h3 className="text-sm font-medium text-gray-900 mb-4">새 팀 생성</h3>
              <form className="space-y-4" onSubmit={handleCreateTeam}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">팀 이름</label>
                    <input
                      type="text"
                      value={newTeamName}
                      onChange={(e) => setNewTeamName(e.target.value)}
                      className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-gray-900"
                      placeholder="팀 이름"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">최대 인원</label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={newTeamMaxMembers}
                      onChange={(e) => setNewTeamMaxMembers(Number(e.target.value))}
                      className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-gray-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">초대 코드</label>
                    <input
                      type="text"
                      value={newTeamCode}
                      onChange={(e) => setNewTeamCode(e.target.value)}
                      className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-gray-900"
                      placeholder="ABCD-1234"
                    />
                  </div>
                  <div className="flex items-end space-x-2">
                    <span className="text-xs text-gray-600 mb-1">공개 여부</span>
                    <button
                      type="button"
                      onClick={() => setNewTeamPublic(true)}
                      className={`px-3 py-2 text-sm border ${
                        newTeamPublic ? 'bg-black text-white border-black' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      공개
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewTeamPublic(false)}
                      className={`px-3 py-2 text-sm border ${
                        !newTeamPublic ? 'bg-black text-white border-black' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      비공개
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={creatingTeam}
                    className="px-3 py-1.5 text-sm bg-black text-white hover:bg-gray-900 disabled:opacity-50"
                  >
                    {creatingTeam ? '생성 중' : '생성'}
                  </button>
                </div>
              </form>
            </div>

            <div>
              {teams.length > 0 ? (
                <div className="border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-white border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">팀 이름</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">팀장</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">멤버</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">공개 여부</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">생성일</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {teams.map((team) => (
                        <tr key={team.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">{team.id}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{team.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{team.leader}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {team.members} / {team.maxMembers}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {team.isPublic ? '공개' : '비공개'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{team.createdAt}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="border border-gray-200 p-8 text-center">
                  <p className="text-sm text-gray-500 mb-4">팀 데이터를 불러오려면 버튼을 클릭하세요.</p>
                  <button
                    onClick={loadTeams}
                    disabled={teamsLoading}
                    className="px-3 py-1.5 text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    {teamsLoading ? '로딩 중' : '불러오기'}
                  </button>
                </div>
              )}
            </div>
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
                className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                  activeSection === item.id
                    ? 'text-gray-900 font-medium'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {item.label}
              </button>
            ))}
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
