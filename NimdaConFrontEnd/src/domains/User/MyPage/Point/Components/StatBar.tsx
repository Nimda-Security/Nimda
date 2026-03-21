// StatBar.tsx
import React from "react";

interface StatBarProps {
  stats: { label: string; value: string; isPrimary?: boolean }[];
}

const StatBar: React.FC<StatBarProps> = ({ stats }) => {
  return (
    <div className="flex items-center gap-4 text-[13px] px-[32px] mt-4">
      {stats.map((stat, idx) => (
        <div key={idx} className="flex items-center">
          <span className="text-[#8e8e8e] mr-2">{stat.label}</span>
          <span className={`font-bold ${stat.isPrimary ? "text-[#d97399]" : "text-[#0c0c0c]"}`}>
            {stat.value}
          </span>
          {idx !== stats.length - 1 && (
            <div className="w-[1px] h-3 bg-[#e0e0e0] ml-4" /> // 세로 구분선
          )}
        </div>
      ))}
    </div>
  );
};

export default StatBar;