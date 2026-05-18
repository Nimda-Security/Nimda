import { useNavigate, useLocation } from 'react-router-dom';
import NavBar from '@/components/Layout/Header/NavBar';
import Footer from '@/components/Layout/Footer';
import AdminSidebar from './components/AdminSidebar';
// import MileagePaymentForm from './components/MileagePaymentForm'; // 분리한 폼 임포트
// import { updatePointManual } from '@/api/point';
import BulkMileagePaymentForm from './components/BulkMileagePaymentForm.jsx';
import { updatePointManualBulk } from '@/api/point';

function AdminMileage() {
  const location = useLocation();
  const initialStudentId = location.state?.studentId || '';

  const handleBulkGrantSubmit = async (dataList) => {
    // dataList: [{ studentId, mileageAmount, reason }, ...]
    const requests = dataList.map(({ studentId, mileageAmount, reason }) => ({
      studentNum: studentId,
      description: reason,
      amount: Number(mileageAmount),
    }));

    const result = await updatePointManualBulk(requests);

    if (result.success) {
      alert(`[일괄 지급 성공]\n총 ${requests.length}명 지급 완료`);
    } else {
      alert(`[일괄 지급 실패]\n${result.message}`);
    }
  };

  return (
    <div className="layout">
      <NavBar />
      <div className="layout__body">
        <div className="admin">
          <AdminSidebar activeSection="mileage" activeSubSection="mileage" />

          <main className="admin__content">
            <div className="admin__header-row">
              <h2 className="admin__section-title">마일리지 일괄 지급</h2>
            </div>

            <BulkMileagePaymentForm
              onGrant={handleBulkGrantSubmit}
              initialStudentId={initialStudentId}
            />

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