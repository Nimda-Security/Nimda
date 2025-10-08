import Layout from "@/components/Layout";
import { useNavigate } from "react-router-dom";
import BlackLineButton from "@/components/Button/BlackLine";

interface Problem {
  id: number;
  title: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  points: number;
  description: string;
}

function ProblemsPage() {
  const navigate = useNavigate();

  // 임시 문제 데이터 (추후 API로 대체)
  const problems: Problem[] = [
    {
      id: 1,
      title: "A + B",
      difficulty: "EASY",
      points: 100,
      description:
        "두 정수 A와 B를 입력받아 A+B를 출력하는 프로그램을 작성하시오.",
    },
    {
      id: 2,
      title: "Hello World",
      difficulty: "EASY",
      points: 50,
      description: "Hello World를 출력하는 프로그램을 작성하시오.",
    },
    {
      id: 3,
      title: "최댓값 구하기",
      difficulty: "MEDIUM",
      points: 200,
      description:
        "주어진 N개의 정수 중에서 최댓값을 구하는 프로그램을 작성하시오.",
    },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "EASY":
        return "text-green-600 bg-green-100";
      case "MEDIUM":
        return "text-yellow-600 bg-yellow-100";
      case "HARD":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case "EASY":
        return "쉬움";
      case "MEDIUM":
        return "보통";
      case "HARD":
        return "어려움";
      default:
        return "알 수 없음";
    }
  };

  const goToProblemSubmit = (problemId: number, problemTitle: string) => {
    navigate("/problem-submit", {
      state: {
        problemId,
        problemTitle,
      },
    });
  };

  const goBack = () => {
    navigate("/");
  };

  return (
    <Layout>
      <div className="min-h-screen bg-white" style={{ paddingTop: "32px" }}>
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-6xl mx-auto">
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-black">문제 모음</h1>
              <button
                onClick={goBack}
                className="text-gray-600 hover:text-black text-sm font-medium"
              >
                ← 메인으로 돌아가기
              </button>
            </div>

            {/* 문제 목록 */}
            <div className="space-y-4">
              {problems.map((problem) => (
                <div
                  key={problem.id}
                  className="bg-white border border-gray-300 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-lg font-semibold text-black">
                          {problem.id}. {problem.title}
                        </h2>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(problem.difficulty)}`}
                        >
                          {getDifficultyText(problem.difficulty)}
                        </span>
                        <span className="text-sm text-gray-600">
                          {problem.points}점
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm mb-4">
                        {problem.description}
                      </p>
                    </div>

                    <div className="ml-6">
                      <BlackLineButton
                        onClick={() =>
                          goToProblemSubmit(problem.id, problem.title)
                        }
                      >
                        문제 풀기
                      </BlackLineButton>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 안내 메시지 */}
            <div className="mt-8 p-4 bg-gray-50 border border-gray-200 text-center">
              <p className="text-gray-600 text-sm">
                💡 문제를 선택하면 코드 제출 페이지로 이동합니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default ProblemsPage;
