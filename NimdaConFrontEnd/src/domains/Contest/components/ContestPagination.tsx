// MyPage Pagination(핑크 액센트)을 대회 페이지용 블랙 액센트로 복사·수정한 버전.
// currentPage/totalPages는 1-기반 — Spring Page(0-기반) 변환은 호출부에서 한다.

interface ContestPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const btnBase =
  'flex h-[30px] min-w-[30px] items-center justify-center rounded-full border p-0 text-[12px] font-semibold transition-[border-color,color,background-color] duration-150';
const btnIdle =
  'border-[#D4D4D4] bg-white text-[#737373] hover:border-[#0C0C0C] hover:text-[#0C0C0C]';
const btnActive = 'border-[#0C0C0C] bg-[rgba(12,12,12,0.08)] text-[#0C0C0C]';

const ContestPagination = ({ currentPage, totalPages, onPageChange }: ContestPaginationProps) => {
  if (totalPages <= 1) return null;

  const maxVisible = 5;
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  const end = Math.min(totalPages, start + maxVisible - 1);
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  const pages: number[] = [];
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <div className="mt-8 mb-2 flex justify-center items-center gap-[6px]">
      <button
        type="button"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        aria-label="이전 페이지"
        className={`${btnBase} ${btnIdle} disabled:cursor-not-allowed disabled:opacity-40`}
      >
        ‹
      </button>

      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onPageChange(p)}
          aria-current={currentPage === p ? 'page' : undefined}
          className={`${btnBase} ${currentPage === p ? btnActive : btnIdle}`}
        >
          {p}
        </button>
      ))}

      <button
        type="button"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        aria-label="다음 페이지"
        className={`${btnBase} ${btnIdle} disabled:cursor-not-allowed disabled:opacity-40`}
      >
        ›
      </button>
    </div>
  );
};

export default ContestPagination;
