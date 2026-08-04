// 문제별 통계 탭 — MOCK (백엔드 통계 API 없음)

import { useEffect, useState } from 'react';
import { getProblemStatsAPI } from '@/api/scoreboard';
import type { ProblemStat } from '@/api/scoreboard';

const ProblemStats = () => {
  const [stats, setStats] = useState<ProblemStat[]>([]);

  useEffect(() => {
    getProblemStatsAPI().then((result) => {
      if (result.success) setStats(result.stats);
    });
  }, []);

  return (
    <div>
      <p style={{ fontSize: 12, color: '#8b8b8b', margin: '0 0 12px' }}>
        데모 데이터 — 문제별 통계 API가 준비되면 실측치로 교체됩니다.
      </p>
      <table className="contest-table">
        <thead>
          <tr>
            <th style={{ width: 64 }}>번호</th>
            <th>문제</th>
            <th style={{ width: 90 }}>제출</th>
            <th style={{ width: 90 }}>정답</th>
            <th style={{ width: 100 }}>정답률</th>
          </tr>
        </thead>
        <tbody>
          {stats.map((stat) => (
            <tr key={stat.code}>
              <td className="contest-table__num contest-mono">{stat.code}</td>
              <td className="contest-table__strong">{stat.title}</td>
              <td className="contest-mono">{stat.submissions}</td>
              <td className="contest-mono">{stat.accepted}</td>
              <td className="contest-mono">{stat.rate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProblemStats;
