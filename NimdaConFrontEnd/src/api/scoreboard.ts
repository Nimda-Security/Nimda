// [New] 스코어보드 API 호출 유틸
import type { ScoreboardResponse } from "@/domains/Contest/Scoreboard/types";

// API 루트와 엔드포인트를 분리해서 원하는 주소로 쉽게 변경할 수 있도록 함
const API_BASE_URL = (
  import.meta.env.DEV
    ? "/api"
    : import.meta.env.VITE_API_BASE_URL ?? "/api"
).replace(/\/$/, "");
const SCOREBOARD_ENDPOINT =
  import.meta.env.VITE_SCOREBOARD_ENDPOINT ?? "/scoreboard";
  
/**
 * GET /api/scoreboard
 * - 15초 폴링 기반으로 호출 예정
 */
export const getScoreboardAPI = async (): Promise<ScoreboardResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}${SCOREBOARD_ENDPOINT}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "스코어보드 조회에 실패했습니다.");
    }

    return {
      success: result.success ?? true,
      message: result.message ?? "스코어보드를 불러왔습니다.",
      scoreboard: result.scoreboard ?? [],
      problems: result.problems ?? [],
    };
  } catch (error) {
    console.error("스코어보드 API 오류:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "스코어보드 데이터를 불러올 수 없습니다.",
      scoreboard: [],
      problems: [],
    };
  }
};

