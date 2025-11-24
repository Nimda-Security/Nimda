// [New] Scoreboard 도메인 타입 정의
export type ProblemStatus =
  | "ACCEPTED"
  | "WRONG_ANSWER"
  | "NOT_SUBMITTED"
  | "JUDGING";

export interface ProblemScore {
  problemId: number;
  problemTitle: string;
  score: number;
  status: ProblemStatus;
  attemptCount: number;
  firstAcceptedAt?: string | null;
  timeFromStart?: number | null;
}

export interface ScoreboardEntry {
  rank: number;
  userId: number;
  nickname: string;
  totalScore: number;
  solvedCount: number;
  totalTime: number; // 나중을 위해 보관 (랭킹에는 사용 안 함)
  totalTimeMinutes: number; // 나중을 위해 보관 (랭킹에는 사용 안 함)
  totalAttemptCount: number; // 총 제출 횟수 (랭킹 정렬 2차 기준)
  problemScores: ProblemScore[];
}

export interface ProblemInfo {
  problemId: number;
  problemTitle: string;
  points: number;
}

export interface ScoreboardResponse {
  success: boolean;
  message: string;
  scoreboard: ScoreboardEntry[];
  problems: ProblemInfo[];
}

