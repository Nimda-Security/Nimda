import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import BlackLineButton from '@/components/Button/BlackLine';
import { useNavigate } from 'react-router-dom';
import { getAllUsersAPI } from '@/api/admin/admin';
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
    navigate(`/problem/${problemId}`);
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
      await new Promise((resolve) => setTimeout(resolve, 600));
      setTeams([
        {
          id: 1,
          name: '알고리즘 고수들',
          leader: 'admin',
          members: 4,
          maxMembers: 5,
          isPublic: true,
          createdAt: '2025-02-10',
        },
        {
          id: 2,
          name: 'NIMDA TEAM',
          leader: 'seoyun',
          members: 5,
          maxMembers: 8,
          isPublic: false,
          createdAt: '2025-01-22',
        },
      ]);
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
    setCreatingTeam(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      const mockTeam = {
        id: Date.now(),
        name: newTeamName || '새 팀',
        leader: 'admin',
        members: 1,
        maxMembers: newTeamMaxMembers,
        isPublic: newTeamPublic,
        createdAt: new Date().toISOString().slice(0, 10),
        participationCode: newTeamCode || 'TEMP-CODE',
      };
      setTeams((prev) => [mockTeam, ...prev]);
      setNewTeamName('');
      setNewTeamMaxMembers(5);
      setNewTeamPublic(true);
      setNewTeamCode('');
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
    { id: 'dashboard', label: '대시보드', icon: '📊' },
    { id: 'problems', label: '문제 관리', icon: '📝' },
    { id: 'users', label: '사용자 관리', icon: '👥' },
    { id: 'teams', label: '팀 관리', icon: '🧩' }
  ];

  const renderContent = () => {
    switch(activeSection) {
      case 'dashboard':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6">관리자 대시보드</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            </div>

            <div className="mt-8 bg-gray-100 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">관리자 전용 기능</h3>
              <ul className="text-gray-700 space-y-1">
                <li>• 문제 출제 및 관리</li>
                <li>• 사용자 권한 관리</li>
                <li>• 시스템 설정 변경</li>
                <li>• 로그 및 통계 확인</li>
              </ul>
            </div>
          </div>
        );
      case 'problems':
        return (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">문제 관리</h2>
              <div className="flex gap-2">
                <button
                  onClick={loadProblems}
                  disabled={problemsLoading}
                  className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-900 disabled:opacity-50"
                >
                  {problemsLoading ? '로딩 중...' : '문제 목록 새로고침'}
                </button>
                <button
                  onClick={goToProblemCreate}
                  className="px-4 py-2 border border-black text-black rounded-md hover:bg-black hover:text-white"
                >
                  새 문제 출제
                </button>
              </div>
            </div>
            
            {problems.length > 0 ? (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        제목
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        난이도
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        언어
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        테스트 케이스
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        생성일
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        상태
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {problems.map((problem) => (
                      <tr 
                        key={problem.id} 
                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => goToProblemDetail(problem.id)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {problem.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="max-w-xs truncate" title={problem.title}>
                            {problem.title}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="px-2 py-1 text-xs rounded-full bg-gray-200 text-gray-800">
                            {problem.difficulty}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="px-2 py-1 text-xs rounded-full bg-gray-200 text-gray-800">
                            {problem.language}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {problem.testCases ? problem.testCases.length : 0}개
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {problem.createdAt ? new Date(problem.createdAt).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="px-2 py-1 text-xs rounded-full bg-gray-200 text-gray-800">
                            활성
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <p className="text-gray-500 mb-4">등록된 문제가 없습니다.</p>
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={loadProblems}
                    className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-900"
                  >
                    문제 목록 불러오기
                  </button>
                  <button
                    onClick={goToProblemCreate}
                    className="px-4 py-2 border border-black text-black rounded-md hover:bg-black hover:text-white"
                  >
                    첫 문제 출제하기
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
              <h2 className="text-2xl font-bold">사용자 관리</h2>
              <button
                onClick={loadUsers}
                disabled={loading}
                className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-900 disabled:opacity-50"
              >
                {loading ? '로딩 중...' : '사용자 목록 새로고침'}
              </button>
            </div>
            
            {users.length > 0 ? (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        사용자명
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        이메일
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        가입일
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        상태
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="px-2 py-1 text-xs rounded-full bg-gray-200 text-gray-900">
                            {user.username}
                            {user.username === 'admin' && (
                              <span className="ml-1 text-[11px] uppercase tracking-wide text-gray-500">
                                ADMIN
                              </span>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="px-2 py-1 text-xs rounded-full bg-gray-200 text-gray-900">
                            활성
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <p className="text-gray-500 mb-4">사용자 목록이 비어있습니다.</p>
                <button
                  onClick={loadUsers}
                  className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-900"
                >
                  사용자 목록 불러오기
                </button>
              </div>
            )}
          </div>
        );
      case 'teams':
        return (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">팀 관리</h2>
              <button
                onClick={loadTeams}
                disabled={teamsLoading}
                className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-900 disabled:opacity-50"
              >
                {teamsLoading ? '로딩 중...' : '팀 목록 새로고침'}
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4">새 팀 생성</h3>
              <form className="space-y-4" onSubmit={handleCreateTeam}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">팀 이름</label>
                    <input
                      type="text"
                      value={newTeamName}
                      onChange={(e) => setNewTeamName(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gray-400"
                      placeholder="팀 이름을 입력하세요"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">최대 인원</label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={newTeamMaxMembers}
                      onChange={(e) => setNewTeamMaxMembers(Number(e.target.value))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gray-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">초대 코드</label>
                    <input
                      type="text"
                      value={newTeamCode}
                      onChange={(e) => setNewTeamCode(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gray-400"
                      placeholder="예: ABCD-1234"
                    />
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-600">공개 여부</span>
                    <button
                      type="button"
                      onClick={() => setNewTeamPublic(true)}
                      className={`px-3 py-2 rounded-md border ${
                        newTeamPublic ? 'bg-black text-white border-black' : 'border-gray-300 text-gray-700'
                      }`}
                    >
                      공개
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewTeamPublic(false)}
                      className={`px-3 py-2 rounded-md border ${
                        !newTeamPublic ? 'bg-black text-white border-black' : 'border-gray-300 text-gray-700'
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
                    className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-900 disabled:opacity-50"
                  >
                    {creatingTeam ? '생성 중...' : '팀 생성'}
                  </button>
                </div>
              </form>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">팀 목록</h3>
                <button
                  onClick={loadTeams}
                  disabled={teamsLoading}
                  className="px-4 py-2 border border-black text-black rounded-md hover:bg-black hover:text-white disabled:opacity-50"
                >
                  {teamsLoading ? '로딩 중...' : '팀 목록 불러오기'}
                </button>
              </div>

              {teams.length > 0 ? (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">팀 이름</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">팀장</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">멤버</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">공개 여부</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">생성일</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {teams.map((team) => (
                        <tr key={team.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{team.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{team.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{team.leader}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {team.members} / {team.maxMembers}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className="px-2 py-1 text-xs rounded-full bg-gray-200 text-gray-800">
                              {team.isPublic ? '공개' : '비공개'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{team.createdAt}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-white p-8 rounded-lg shadow-md text-center">
                  <p className="text-gray-500 mb-4">팀 데이터를 불러오려면 버튼을 클릭하세요.</p>
                  <button
                    onClick={loadTeams}
                    disabled={teamsLoading}
                    className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-900 disabled:opacity-50"
                  >
                    {teamsLoading ? '로딩 중...' : '팀 목록 불러오기'}
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
        <aside className="w-64 bg-gray-800 text-white p-6">

          <div className="mb-8">
            <h1 className="text-xl font-bold">관리자 패널</h1>
            <button
              onClick={goBack}
              className="text-sm text-gray-300 hover:text-white mt-2"
            >
              ← 메인으로 돌아가기
            </button>
          </div>
          
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  activeSection === item.id
                    ? 'bg-white text-black'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* 메인 콘텐츠 영역 */}
        <main className="flex-1 p-8 bg-gray-50">
          {renderContent()}
        </main>

      </div>
    </Layout>
  );
}

export default AdminDashboard;
