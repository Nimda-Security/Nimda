import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
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
    <div className="mt-14 mb-6 flex justify-center items-center gap-[6px]">
      <button
        type="button"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        aria-label="이전 페이지"
        className="flex h-[30px] min-w-[30px] items-center justify-center rounded-full border border-[#D4D4D4] bg-white p-0 text-[12px] font-semibold text-[#737373] transition-[border-color,color,background-color] duration-150 hover:border-[#D97399] hover:text-[#D97399] disabled:cursor-not-allowed disabled:opacity-40"
      >
        ‹
      </button>

      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onPageChange(p)}
          aria-current={currentPage === p ? 'page' : undefined}
          className={`flex h-[30px] min-w-[30px] items-center justify-center rounded-full border p-0 text-[12px] font-semibold transition-[border-color,color,background-color] duration-150 ${
            currentPage === p
              ? 'border-[#D97399] bg-[rgba(217,115,153,0.08)] text-[#D97399]'
              : 'border-[#D4D4D4] bg-white text-[#737373] hover:border-[#D97399] hover:text-[#D97399]'
          }`}
        >
          {p}
        </button>
      ))}

      <button
        type="button"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        aria-label="다음 페이지"
        className="flex h-[30px] min-w-[30px] items-center justify-center rounded-full border border-[#D4D4D4] bg-white p-0 text-[12px] font-semibold text-[#737373] transition-[border-color,color,background-color] duration-150 hover:border-[#D97399] hover:text-[#D97399] disabled:cursor-not-allowed disabled:opacity-40"
      >
        ›
      </button>
    </div>
  );
};

export default Pagination;
