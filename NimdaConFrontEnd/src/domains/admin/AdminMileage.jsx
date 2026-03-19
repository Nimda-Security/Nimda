import React from 'react';
import NavBar from '@/components/Layout/Header/NavBar';
import Footer from '@/components/Layout/Footer';
import AdminSidebar from './components/AdminSidebar';
import MileagePaymentForm from './components/MileagePaymentForm'; // 분리한 폼 임포트
import { updatePointManual } from '@/api/point';

function AdminMileage() {
  // 실제 서버에 데이터를 보내는 로직
  const handleGrantSubmit = async (data) => {
    const { studentId, mileageAmount, reason } = data;

    // 이 시점에서 백엔드와 통신
    const result = await updatePointManual(studentId, reason, Number(mileageAmount));
    
    if (result.success) {
      alert(`[지급 성공]\n학번: ${studentId}\n금액: ${mileageAmount}\n사유: ${reason}`);
      // 입력 폼 초기화 로직은 상황에 따라 자식 컴포넌트에서 초기화하도록 하거나 상위 상태로 빼면 됩니다.
    } else {
      alert(`[지급 실패]\n${result.message}`);
    }
  };

  return (
    <div className="layout">
      <NavBar />
      <div className="layout__body">
        <div className="admin">
          {/* 사이드바 */}
          <AdminSidebar
            activeSection="mileage"
            activeSubSection="mileage"
          />

          {/* 메인 콘텐츠 영역 */}
          <main className="admin__content">
            <div className="admin__header-row">
              <h2 className="admin__section-title">마일리지 지급</h2>
            </div>

            {/* 분리된 입력 폼 컴포넌트 호출 */}
            <MileagePaymentForm onGrant={handleGrantSubmit} />

            {/* 하단 안내 사항 (필요시 추가) */}
            <div className="mt-8 text-sm text-gray-400">
              <p>· 정확한 학번을 입력했는지 다시 한번 확인해 주세요.</p>
              <p>· 사유는 사용자 마이페이지에 그대로 노출됩니다.</p>
            </div>
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default AdminMileage;