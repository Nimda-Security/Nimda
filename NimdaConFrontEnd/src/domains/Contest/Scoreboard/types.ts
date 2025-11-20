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
  totalTime: number;
  totalTimeMinutes: number;
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

