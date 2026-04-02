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
    <div className="mt-10 mb-6 flex justify-center items-center gap-2">
      <div className="flex gap-1.5">
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-9 h-9 rounded-lg text-[14px] font-bold transition-all flex items-center justify-center ${
              currentPage === p
                ? 'bg-[#D97399] text-white'
                : 'text-[#A3A3A3] hover:bg-white border border-transparent hover:border-[#D4D4D4]'
            }`}
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Pagination;
