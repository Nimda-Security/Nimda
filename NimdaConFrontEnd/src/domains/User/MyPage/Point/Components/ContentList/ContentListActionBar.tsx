import React from 'react';
import CheckBox from './CheckBox';

interface ContentListActionBarProps {
  allSelected: boolean;
  onToggleAll: () => void;
  onDelete: () => void;
  hasSelected: boolean;
}

const ContentListActionBar: React.FC<ContentListActionBarProps> = ({
  allSelected,
  onToggleAll,
  onDelete,
  hasSelected,
}) => {
  return (
    <div className="flex items-center justify-between h-[40px] px-8 mt-2">
      <div className="flex items-center gap-[12px]">
        <CheckBox checked={allSelected} onChange={onToggleAll} />
        <span
          className="text-[14px] font-medium text-[#737373] select-none cursor-pointer"
          onClick={onToggleAll}
        >
          전체선택
        </span>
      </div>

      {hasSelected && (
        <button
          onClick={onDelete}
          className="h-[32px] min-w-[68px] px-4 rounded-[4px] border border-[#d97399] bg-[#f5f5f5] text-[14px] font-medium text-[#d97399] leading-[150%]"
        >
          삭제
        </button>
      )}
    </div>
  );
};

export default ContentListActionBar;
