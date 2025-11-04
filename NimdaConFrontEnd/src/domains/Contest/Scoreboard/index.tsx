import Layout from "@/components/Layout";
import { useNavigate } from "react-router-dom";

function ScoreboardPage() {
  const navigate = useNavigate();

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
              <h1 className="text-2xl font-bold text-black">SCORE BOARD</h1>
              <button
                onClick={goBack}
                className="text-gray-600 hover:text-black text-sm font-medium"
              >
                ← 메인으로 돌아가기
              </button>
            </div>

            {/* 스코어보드 콘텐츠 (임시) */}
            <div className="bg-white border border-gray-300 p-6">
              <p className="text-center text-gray-500">
                스코어보드 정보가 여기에 표시됩니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default ScoreboardPage;
