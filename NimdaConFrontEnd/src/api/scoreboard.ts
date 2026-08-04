// MOCK — 백엔드에 스코어보드/문제별 통계 API가 없다.
// async 시그니처를 유지해 두었으므로 실제 엔드포인트가 생기면 이 파일만 교체하면 된다.

export interface ScoreboardEntry {
  rank: number;
  team: string;
  score: number;
  timeLabel: string;
  memoryLabel: string;
  submittedAt: string;
}

export interface ProblemStat {
  code: string;
  title: string;
  submissions: number;
  accepted: number;
  rate: string;
}

const MOCK_SCOREBOARD: ScoreboardEntry[] = [
  { rank: 1, team: 'nuyoes', score: 500, timeLabel: '0.42 s', memoryLabel: '96 MB', submittedAt: '03/21 12:34:00' },
  { rank: 2, team: '두기짱', score: 480, timeLabel: '0.51 s', memoryLabel: '102 MB', submittedAt: '03/21 12:41:12' },
  { rank: 3, team: '햄스터', score: 460, timeLabel: '0.63 s', memoryLabel: '118 MB', submittedAt: '03/21 12:52:08' },
  { rank: 4, team: '요리개물', score: 420, timeLabel: '0.88 s', memoryLabel: '124 MB', submittedAt: '03/21 13:04:31' },
  { rank: 5, team: '화들짝가나디', score: 400, timeLabel: '1.02 s', memoryLabel: '131 MB', submittedAt: '03/21 13:15:47' },
  { rank: 6, team: '꼬꼬꼬', score: 360, timeLabel: '1.24 s', memoryLabel: '140 MB', submittedAt: '03/21 13:28:02' },
  { rank: 7, team: '체스하실분', score: 300, timeLabel: '1.51 s', memoryLabel: '152 MB', submittedAt: '03/21 13:39:55' },
  { rank: 8, team: 'blue1', score: 260, timeLabel: '1.88 s', memoryLabel: '161 MB', submittedAt: '03/21 13:47:20' },
  { rank: 9, team: '닉네임', score: 200, timeLabel: '2.10 s', memoryLabel: '173 MB', submittedAt: '03/21 13:58:41' },
  { rank: 10, team: 'gdb만세', score: 180, timeLabel: '2.31 s', memoryLabel: '180 MB', submittedAt: '03/21 14:05:12' },
  { rank: 11, team: '세그폴트', score: 150, timeLabel: '2.55 s', memoryLabel: '190 MB', submittedAt: '03/21 14:18:44' },
  { rank: 12, team: 'oob읽기', score: 120, timeLabel: '2.78 s', memoryLabel: '201 MB', submittedAt: '03/21 14:32:09' },
];

const MOCK_PROBLEM_STATS: ProblemStat[] = [
  { code: 'A', title: '진짜 두기를 찾아봐', submissions: 38, accepted: 27, rate: '71.0%' },
  { code: 'B', title: '님다 코인 정산', submissions: 26, accepted: 11, rate: '42.3%' },
  { code: 'C', title: '카르텔 접근 권한', submissions: 21, accepted: 7, rate: '33.3%' },
  { code: 'D', title: '스터디 시간표 짜기', submissions: 14, accepted: 3, rate: '21.4%' },
  { code: 'E', title: '방문자 로그 압축', submissions: 9, accepted: 1, rate: '11.1%' },
  { code: 'F', title: '배지 그래프 순회', submissions: 4, accepted: 0, rate: '0.0%' },
];

/** MOCK: 전체 순위 — 실제 API가 생기면 이 함수 본문만 교체 */
export const getScoreboardAPI = async (): Promise<{
  success: boolean;
  message: string;
  entries: ScoreboardEntry[];
}> => {
  return { success: true, message: '데모 데이터', entries: MOCK_SCOREBOARD };
};

/** MOCK: 문제별 통계 — 실제 API가 생기면 이 함수 본문만 교체 */
export const getProblemStatsAPI = async (): Promise<{
  success: boolean;
  message: string;
  stats: ProblemStat[];
}> => {
  return { success: true, message: '데모 데이터', stats: MOCK_PROBLEM_STATS };
};
