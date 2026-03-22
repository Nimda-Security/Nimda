import React from "react";
import CheckBox from "./CheckBox";

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
    // 리스트와 수직 라인을 맞추기 위해 px-[15px] 유지
    <div className="flex items-center justify-between h-[40px] px-[15px] mt-2">
      <div className="flex items-center">
        <CheckBox checked={allSelected} onChange={onToggleAll} />
        {/* 디자인 시안처럼 텍스트를 안으로 밀어넣기 위해 ml-[20px] 적용 */}
        <span
          className="ml-[20px] text-[14px] font-medium text-[#737373] select-none cursor-pointer"
          onClick={onToggleAll}
        >
          전체선택
        </span>
      </div>

      {hasSelected && (
        <button
          onClick={onDelete}
          className="h-[24px] px-3 rounded-[4px] border border-[#d97399] bg-[#f5f5f5] text-[14px] font-medium text-[#d97399] leading-[150%]"
        >
          삭제
        </button>
      )}
    </div>
  );
};

export default ContentListActionBar;