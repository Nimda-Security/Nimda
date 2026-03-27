// Profile/ProfileSummary.tsx

import React from 'react';

interface ProfileSummaryProps {
  userInfo: {
    name: string;
    id: string;
    stats: { label: string; value: string; isPrimary?: boolean }[];
  };
}

const maskUserId = (userId?: string) => {
  if (!userId) return '-';
  if (userId.length <= 3) return userId; // 3글자 이하인 경우 그대로 노출 (또는 정책에 따라 변경)

  const prefix = userId.substring(0, 3); // 앞 3자리 추출
  const mask = '*'.repeat(userId.length - 3); // 나머지 길이만큼 * 생성

  return prefix + mask;
};

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
        {maskUserId(userInfo.id)}
      </p>

      {/* 2. 통계 바: mt-6(24px) 간격, 가로 배치 */}
      {/* 통계 수치 바 영역 */}
      <div className="flex items-center gap-[32px] mt-6 whitespace-nowrap">
        {/* gap-[32px]: 항목(방문, 작성글 등) 사이의 간격을 넓혔습니다. */}

        {userInfo.stats.map((stat, idx) => (
          <div key={idx} className="flex items-center text-[13px] gap-[8px]">
            {/* 라벨 (방문, 작성글 등) */}
            <span className="text-[#8e8e8e] font-medium">{stat.label}</span>

            {/* 실제 수치 */}
            <span
              className={`font-bold ${stat.isPrimary ? 'text-[#d97399]' : 'text-[#0C0C0C]'}`}
            >
              {stat.value}
            </span>

            {/* 구분선: 항목 사이 간격이 넓어졌으므로 구분선 여백도 ml-[32px]로 맞춤 */}
            {idx !== userInfo.stats.length - 1 && (
              <div className="w-[1px] h-[12px] bg-[#eeeeee] ml-[32px]" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileSummary;
