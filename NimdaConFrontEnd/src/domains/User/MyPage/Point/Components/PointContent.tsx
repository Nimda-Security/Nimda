import React from "react";

interface PointContentProps {
  loading: boolean;
  userBalance: number;
  activeFilter: string;
  setActiveFilter: (filter: any) => void;
  setCurrentPage: (page: number) => void;
  displayedRecords: any[];
  totalPages: number;
  currentPage: number;
  handlePageChange: (page: number) => void;
}

const PointContent: React.FC<PointContentProps> = ({
  loading,
  userBalance,
  activeFilter,
  setActiveFilter,
  setCurrentPage,
  displayedRecords,
  totalPages,
  currentPage,
  handlePageChange,
}) => {
  return (
    <div className="bg-white border border-[#e5e7eb] rounded-xl overflow-hidden shadow-sm">
      {/* 보유 포인트 요약 */}
      <div className="p-8 border-b border-[#f1f1f1] flex gap-20">
        <div>
          <p className="text-[13px] text-[#8e8e8e] mb-2">보유 마일리지</p>
          <p className="text-[28px] font-bold text-[#0c0c0c]">
            {userBalance.toLocaleString()} <span className="text-[18px] font-medium ml-1">NC</span>
          </p>
        </div>
        <div>
          <p className="text-[13px] text-[#8e8e8e] mb-2">적립 예정</p>
          <p className="text-[28px] font-bold text-[#8e8e8e]">
            10 <span className="text-[18px] font-medium ml-1">NC</span>
          </p>
        </div>
      </div>

      {/* 필터 바 */}
      <div className="px-8 py-4 bg-[#fafafa] border-b border-[#f1f1f1] flex gap-4">
        {["all", "earn", "use", "expire"].map((f) => (
          <button
            key={f}
            onClick={() => { setActiveFilter(f); setCurrentPage(1); }}
            className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition-all ${
              activeFilter === f ? "bg-[#d97399] text-white" : "bg-white border border-[#e5e7eb] text-[#8e8e8e]"
            }`}
          >
            {f === "all" ? "전체" : f === "earn" ? "적립" : f === "use" ? "사용" : "만료"}
          </button>
        ))}
      </div>

      {/* 내역 리스트 */}
      <div className="min-h-[400px]">
        {loading ? (
          <div className="flex justify-center items-center h-[400px] text-[#8e8e8e]">로딩 중...</div>
        ) : displayedRecords.length > 0 ? (
          displayedRecords.map((record) => (
            <div key={record.id} className="px-8 py-6 border-b border-[#f8f9fa] flex justify-between items-center hover:bg-[#fcfcfc]">
              <div>
                <p className="text-[15px] font-medium text-[#0c0c0c] mb-1">{record.description}</p>
                <p className="text-[13px] text-[#bebebe]">{record.date}</p>
              </div>
              <p className={`text-[16px] font-bold ${record.amount > 0 ? "text-[#d97399]" : "text-[#0c0c0c]"}`}>
                {record.amount > 0 ? `+${record.amount}` : record.amount} NC
              </p>
            </div>
          ))
        ) : (
          <div className="flex justify-center items-center h-[400px] text-[#bebebe]">포인트 내역이 없습니다.</div>
        )}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="py-8 flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => handlePageChange(p)}
              className={`w-8 h-8 rounded-md text-[13px] font-medium ${
                currentPage === p ? "bg-[#d97399] text-white" : "text-[#8e8e8e] hover:bg-gray-100"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PointContent;