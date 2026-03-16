// Profile/ProfileSummary.tsx

import React from "react";

interface ProfileSummaryProps {
  userInfo: {
    name: string;
    id: string;
    stats: { label: string; value: string; isPrimary?: boolean }[];
  };
}

const ProfileSummary: React.FC<ProfileSummaryProps> = ({ userInfo }) => {
  return (
    // 1. 글자 영역: 세로 배치, 왼쪽 정렬
    <div className="flex flex-col items-start">
      {/* 닉네임: Heading/24px */}
      <h1 className="text-[24px] font-bold text-[#0C0C0C] leading-[120%] tracking-tight">
        {userInfo.name}
      </h1>

      {/* 아이디 */}
      <p className="text-[14px] text-[#8e8e8e] mt-1">
        {userInfo.id}
      </p>

      {/* 2. 통계 바: mt-6(24px) 간격, 가로 배치 */}
      <div className="flex items-center gap-5 mt-6 whitespace-nowrap">
        {userInfo.stats.map((stat, idx) => (
          <div key={idx} className="flex items-center text-[13px]">
            {/* 라벨 */}
            <span className="text-[#8e8e8e] mr-2">{stat.label}</span>
            {/* 수치: 보유 NC는 핑크색 */}
            <span className={`font-bold ${stat.isPrimary ? "text-[#d97399]" : "text-[#0C0C0C]"}`}>
              {stat.value}
            </span>
            {/* 구분선 (마지막 요소 제외) */}
            {idx !== userInfo.stats.length - 1 && (
              <div className="w-[1px] h-3 bg-[#eeeeee] ml-5" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileSummary;