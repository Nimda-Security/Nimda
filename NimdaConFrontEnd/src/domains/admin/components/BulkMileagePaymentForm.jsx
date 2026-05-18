import { useState } from 'react';

const BulkMileagePaymentForm = ({ onGrant, initialStudentId }) => {
  const [studentIds, setStudentIds] = useState([initialStudentId || '']);
  const [mileageAmount, setMileageAmount] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleStudentIdChange = (index, value) => {
    setStudentIds((prev) => prev.map((id, i) => (i === index ? value : id)));
  };

  const handleAddRow = () => setStudentIds((prev) => [...prev, '']);

  const handleRemoveRow = (index) => {
    if (studentIds.length === 1) return;
    setStudentIds((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    if (!mileageAmount || Number(mileageAmount) <= 0) {
      alert('올바른 마일리지 금액을 입력해 주세요.');
      return false;
    }
    if (!reason.trim()) {
      alert('사유를 입력해 주세요.');
      return false;
    }
    for (let i = 0; i < studentIds.length; i++) {
      if (!studentIds[i].trim()) {
        alert(`${i + 1}번째 학번을 입력해 주세요.`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    if (!window.confirm(`총 ${studentIds.length}명에게 마일리지를 지급합니다.\n계속하시겠습니까?`)) return;

    setLoading(true);
    try {
      const dataList = studentIds.map((studentId) => ({ studentId, mileageAmount, reason }));
      await onGrant(dataList);
      setStudentIds(['']);
      setMileageAmount('');
      setReason('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-[874px] bg-white shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] mt-4 rounded-sm overflow-hidden">

      {/* 공통 입력 영역 */}
      <div className="px-6 pt-6 pb-5 flex items-center gap-4 border-b border-stone-100">
        {/* 지급 마일리지 */}
        <div className="flex flex-col gap-1">
          <span className="text-xs text-gray-400 font-medium">지급 마일리지</span>
          <input
            type="number"
            className="w-36 h-9 px-3 text-sm border border-stone-300 rounded-md outline-none focus:border-rose-300 focus:ring-1 focus:ring-rose-100 transition"
            value={mileageAmount}
            placeholder="금액 입력"
            min={1}
            onChange={(e) => setMileageAmount(e.target.value)}
          />
        </div>

        <div className="w-px h-10 bg-stone-200 mt-4"></div>

        {/* 사유 */}
        <div className="flex flex-col gap-1 flex-1">
          <span className="text-xs text-gray-400 font-medium">지급 사유</span>
          <input
            type="text"
            className="w-full h-9 px-3 text-sm border border-stone-300 rounded-md outline-none focus:border-rose-300 focus:ring-1 focus:ring-rose-100 transition"
            value={reason}
            placeholder="사유를 입력하세요 (마이페이지에 그대로 노출됩니다)"
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
      </div>

      {/* 학번 목록 헤더 */}
      <div className="px-6 pt-4 pb-2 flex items-center justify-between">
        <span className="text-xs text-gray-400 font-medium">지급 대상 학번</span>
        <span className="text-xs text-gray-400">{studentIds.length}명</span>
      </div>

      {/* 학번 목록 */}
      <div className="flex flex-col gap-2 px-6 pb-4 max-h-[240px] overflow-y-auto">
        {studentIds.map((studentId, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="text-xs text-gray-300 w-5 text-right shrink-0">{index + 1}</span>
            <input
              type="text"
              className="flex-1 h-9 px-3 text-sm text-neutral-800 border border-stone-200 rounded-md outline-none focus:border-rose-300 focus:ring-1 focus:ring-rose-100 bg-stone-50 transition"
              value={studentId}
              placeholder="학번 입력"
              onChange={(e) => handleStudentIdChange(index, e.target.value)}
            />
            <button
              className="w-7 h-7 flex items-center justify-center rounded-full text-gray-300 hover:text-red-400 hover:bg-red-50 disabled:opacity-20 transition"
              onClick={() => handleRemoveRow(index)}
              disabled={studentIds.length === 1}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* 하단 버튼 영역 */}
      <div className="flex justify-between items-center px-6 py-4 border-t border-stone-100 bg-stone-50">
        <button
          className="h-9 px-4 border border-stone-300 rounded-md text-sm text-gray-500 hover:bg-white transition"
          onClick={handleAddRow}
        >
          + 행 추가
        </button>
        <button
          className="h-9 px-6 bg-rose-400 rounded-md text-white text-sm font-medium hover:bg-rose-500 disabled:opacity-50 transition"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? '지급 중...' : `${studentIds.length}명 일괄 지급`}
        </button>
      </div>
    </div>
  );
};

export default BulkMileagePaymentForm;