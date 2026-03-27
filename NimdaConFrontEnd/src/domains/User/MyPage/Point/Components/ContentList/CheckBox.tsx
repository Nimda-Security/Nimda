import React from 'react';

interface CheckBoxProps {
  checked: boolean;
  onChange: () => void;
}

const CheckBox: React.FC<CheckBoxProps> = ({ checked, onChange }) => {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
      // 1. leading-none과 flex를 조합해 내부 SVG가 정확히 중앙에 오도록 함
      // 2. h-[16px]가 리스트의 h-[52px] 안에서 중앙에 오도록 고정
      className={`relative w-[18px] h-[18px] rounded-[4px] flex-shrink-0 flex items-center justify-center transition-all leading-none ${
        checked ? 'bg-[#d97399]' : 'border border-[#d4d4d4] bg-[#f5f5f5]'
      }`}
    >
      {checked && (
        <svg
          width="12"
          height="12"
          viewBox="0 0 10 10"
          fill="none"
          className="block" // SVG 주변 유령 여백 제거
        >
          <path
            d="M2 5L4.5 7.5L8 3"
            stroke="white"
            strokeWidth="1.8" // 선을 조금 더 선명하게
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
};

export default CheckBox;
