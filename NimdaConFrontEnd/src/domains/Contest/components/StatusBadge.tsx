import type { SubmissionStatus } from '@/api/submission';
import { SUBMISSION_STATUS_LABELS } from '@/api/submission';

// 피그마 팔레트 기반 상태별 색 (Tailwind 전역 토큰 충돌을 피해 직접 지정)
const STATUS_COLORS: Record<SubmissionStatus, string> = {
  PENDING: '#8b8b8b',
  JUDGING: '#4a7fcc',
  ACCEPTED: '#5cb85c',
  WRONG_ANSWER: '#d64454',
  TIME_LIMIT_EXCEEDED: '#e17654',
  MEMORY_LIMIT_EXCEEDED: '#e17654',
  COMPILE_ERROR: '#e8b446',
  RUNTIME_ERROR: '#8b6bb7',
};

export const SolveBadge = ({ state }: { state: 'solved' | 'tried' | null }) => {
  if (!state) return null;
  const solved = state === 'solved';
  const color = solved ? '#5cb85c' : '#d64454';
  return (
    <span className="contest-badge" style={{ color, background: `${color}24` }}>
      {solved ? '해결' : '시도'}
    </span>
  );
};

/** 제출 상태 배지 (PENDING/JUDGING은 진행 중 표시) */
const StatusBadge = ({ status }: { status: SubmissionStatus }) => {
  const color = STATUS_COLORS[status] ?? '#8b8b8b';
  return (
    <span className="contest-badge" style={{ color, background: `${color}24` }}>
      {SUBMISSION_STATUS_LABELS[status] ?? status}
    </span>
  );
};

export default StatusBadge;
