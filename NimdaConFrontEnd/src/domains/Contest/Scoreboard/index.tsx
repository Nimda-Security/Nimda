import { useCallback, useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { useNavigate } from "react-router-dom";
import ScoreboardTable from "./ScoreboardTable";
import { getScoreboardAPI } from "@/api/scoreboard";
import type {
  ProblemInfo,
  ScoreboardEntry,
} from "./types";

const REFRESH_INTERVAL_MS = 15000; // [New] 15초 간격 자동 새로고침

function ScoreboardPage() {
  const navigate = useNavigate();

  // [New] 스코어보드 데이터 상태
  const [entries, setEntries] = useState<ScoreboardEntry[]>([]);
  const [problems, setProblems] = useState<ProblemInfo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | undefined>();
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState<boolean>(false);

  const goBack = () => {
    navigate("/");
  };

  // [New] API 호출 함수
  const fetchScoreboard = useCallback(async () => {
    setIsLoading(true);
    const result = await getScoreboardAPI();

    if (!result.success) {
      setError(result.message);
      setEntries([]);
      setProblems([]);
      setIsLoading(false);
      return;
    }

    setEntries(result.scoreboard);
    setProblems(result.problems);
    setError(null);
    setIsLoading(false);
    setLastUpdated(new Date());
  }, []);

  useEffect(() => {
    fetchScoreboard();
  }, [fetchScoreboard]);

  useEffect(() => {
    if (!autoRefreshEnabled) {
      return;
    }
    const interval = setInterval(fetchScoreboard, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [autoRefreshEnabled, fetchScoreboard]);

  const handleToggleAutoRefresh = () => {
    setAutoRefreshEnabled((prev) => !prev);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-white" style={{ paddingTop: "32px" }}>
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-6xl mx-auto">
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-black">SCORE BOARD</h1>
                <p className="text-sm text-gray-500">
                  {autoRefreshEnabled
                    ? "15초마다 자동 갱신되는 실시간 스코어"
                    : "자동 새로고침 꺼짐 (직접 새로고침 가능)"}
                </p>
              </div>
              <button
                onClick={goBack}
                className="text-gray-600 hover:text-black text-sm font-medium"
              >
                ← 메인으로 돌아가기
              </button>
            </div>

            {/* 자동 새로고침 제어 */}
            <div className="mb-4 flex items-center gap-3">
              <button
                onClick={handleToggleAutoRefresh}
                className={`rounded-md px-4 py-2 text-sm font-semibold ${
                  autoRefreshEnabled
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {autoRefreshEnabled ? "자동 새로고침 ON" : "자동 새로고침 OFF"}
              </button>
              <button
                onClick={fetchScoreboard}
                disabled={isLoading}
                className="rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              >
                {isLoading ? "불러오는 중..." : "지금 새로고침"}
              </button>
            </div>

            {/* 에러 안내 */}
            {error && (
              <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* [New] 실시간 스코어보드 테이블 */}
            <ScoreboardTable
              entries={entries}
              problems={problems}
              isLoading={isLoading}
              lastUpdated={lastUpdated}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default ScoreboardPage;
