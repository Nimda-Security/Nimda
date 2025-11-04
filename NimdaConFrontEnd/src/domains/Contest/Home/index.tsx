import "@/App.css";
import Layout from "@/components/Layout";
import Countdown from "./components/Countdown";
import { useNavigate } from "react-router-dom";

function ContestHome() {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center h-full pt-12">
        <Countdown />
        <div className="flex gap-4 mt-8">
          <button
            onClick={() => navigate("/problems")}
            className="px-6 py-3 bg-black text-white font-semibold rounded-lg shadow-md hover:bg-gray-800 transition-colors"
          >
            문제 바로가기
          </button>
          <button
            onClick={() => navigate("/judging-status")}
            className="px-6 py-3 bg-black text-white font-semibold rounded-lg shadow-md hover:bg-gray-800 transition-colors"
          >
            제출 현황
          </button>
          <button
            onClick={() => navigate("/scoreboard")}
            className="px-6 py-3 bg-black text-white font-semibold rounded-lg shadow-md hover:bg-gray-800 transition-colors"
          >
            스코어보드
          </button>
        </div>
      </div>
    </Layout>
  );
}

export default ContestHome;
