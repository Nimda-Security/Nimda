import React from 'react';
import Layout from '@/components/Layout';
import BlackLineButton from '@/components/Button/BlackLine';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const navigate = useNavigate();

  const goToProblemCreate = () => {
    navigate('/problem-create');
  };

  const goToUserManagement = () => {
    alert('사용자 관리 기능 (구현 예정)');
  };

  const goToSystemSettings = () => {
    alert('시스템 설정 기능 (구현 예정)');
  };

  const goBack = () => {
    navigate('/');
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">관리자 대시보드</h1>
          <button
            onClick={goBack}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          >
            ← 메인으로
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 문제 관리 */}
          <div className="bg-white p-6 rounded-lg shadow-md border">
            <h3 className="text-xl font-semibold mb-4">문제 관리</h3>
            <p className="text-gray-600 mb-4">문제 출제, 수정, 삭제</p>
            <BlackLineButton onClick={goToProblemCreate} className="w-full">
              문제 출제
            </BlackLineButton>
          </div>

          {/* 사용자 관리 */}
          <div className="bg-white p-6 rounded-lg shadow-md border">
            <h3 className="text-xl font-semibold mb-4">사용자 관리</h3>
            <p className="text-gray-600 mb-4">사용자 목록, 권한 관리</p>
            <BlackLineButton onClick={goToUserManagement} className="w-full">
              사용자 관리
            </BlackLineButton>
          </div>

          {/* 시스템 설정 */}
          <div className="bg-white p-6 rounded-lg shadow-md border">
            <h3 className="text-xl font-semibold mb-4">시스템 설정</h3>
            <p className="text-gray-600 mb-4">시스템 설정, 로그 관리</p>
            <BlackLineButton onClick={goToSystemSettings} className="w-full">
              시스템 설정
            </BlackLineButton>
          </div>
        </div>

        {/* 관리자 전용 정보 */}
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
    </Layout>
  );
}

export default AdminDashboard;
