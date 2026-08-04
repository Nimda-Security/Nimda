// 전체 순위 탭 — MOCK 스코어보드 (백엔드 API 없음)

import { useEffect, useState } from 'react';
import { getScoreboardAPI } from '@/api/scoreboard';
import type { ScoreboardEntry } from '@/api/scoreboard';
import { getCurrentNickname } from '@/utils/jwt';
import ContestPagination from '../components/ContestPagination';

const PAGE_SIZE = 10;

const medalClass = (rank: number) =>
  rank === 1
    ? 'contest-table__medal-1'
    : rank === 2
      ? 'contest-table__medal-2'
      : rank === 3
        ? 'contest-table__medal-3'
        : 'contest-table__num';

const LeaderboardTable = () => {
  const [entries, setEntries] = useState<ScoreboardEntry[]>([]);
  const [page, setPage] = useState(1);
  const myNickname = getCurrentNickname();

  useEffect(() => {
    getScoreboardAPI().then((result) => {
      if (result.success) setEntries(result.entries);
    });
  }, []);

  const totalPages = Math.max(1, Math.ceil(entries.length / PAGE_SIZE));
  const visible = entries.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <p style={{ fontSize: 12, color: '#8b8b8b', margin: '0 0 12px' }}>
        데모 데이터 — 스코어보드 API가 준비되면 실시간 순위로 교체됩니다.
      </p>
      <table className="contest-table">
        <thead>
          <tr>
            <th style={{ width: 64 }}>순위</th>
            <th>제출 TEAM</th>
            <th style={{ width: 90 }}>점수</th>
            <th style={{ width: 90 }}>시간</th>
            <th style={{ width: 100 }}>메모리</th>
            <th style={{ width: 150 }}>제출 시간</th>
          </tr>
        </thead>
        <tbody>
          {visible.map((entry) => (
            <tr key={entry.rank} className={entry.team === myNickname ? 'contest-table__me' : undefined}>
              <td className={medalClass(entry.rank)}>{entry.rank}</td>
              <td
                className="contest-table__strong"
                style={entry.team === myNickname ? { color: '#4a7fcc' } : undefined}
              >
                {entry.team}
              </td>
              <td className="contest-table__strong contest-mono">{entry.score}</td>
              <td className="contest-mono">{entry.timeLabel}</td>
              <td className="contest-mono">{entry.memoryLabel}</td>
              <td className="contest-mono">{entry.submittedAt}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <ContestPagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
};

export default LeaderboardTable;
