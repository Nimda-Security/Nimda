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

  const goToSystemSettings = () => {
    alert('시스템 설정 기능 (구현 예정)');
  };

  const goBack = () => {
    navigate('/');
  };

  const menuItems = [
    { id: 'dashboard', label: '대시보드', icon: '📊' },
    { id: 'problems', label: '문제 관리', icon: '📝' },
    { id: 'users', label: '사용자 관리', icon: '👥' }
  ];

  const renderContent = () => {
    switch(activeSection) {
      case 'dashboard':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6">관리자 대시보드</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            </div>

            <div className="mt-8 bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">관리자 전용 기능</h3>
              <ul className="text-blue-700 space-y-1">
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
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {problemsLoading ? '로딩 중...' : '문제 목록 새로고침'}
                </button>
                <button
                  onClick={goToProblemCreate}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
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
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            problem.difficulty === 'EASY' 
                              ? 'bg-green-100 text-green-800'
                              : problem.difficulty === 'MEDIUM'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {problem.difficulty}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
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
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
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
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    문제 목록 불러오기
                  </button>
                  <button
                    onClick={goToProblemCreate}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
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
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
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
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            user.username === 'admin' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {user.username}
                            {user.username === 'admin' && ' (관리자)'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
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
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  사용자 목록 불러오기
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
                    ? 'bg-blue-600 text-white'
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
