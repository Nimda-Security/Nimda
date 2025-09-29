import "./App.css";
import Layout from "@/components/Layout";
import BlackLineButton from "@/components/Button/BlackLine";
import { useNavigate } from "react-router-dom";

import { getCurrentUsername, isAdmin } from "@/utils/jwt"; // 현재 로그인한 유저 출력
import { useState, useEffect } from "react";

function App() {
  const navigate = useNavigate();
  
  const [username, setUsername] = useState(null);
  const [adminStatus, setAdminStatus] = useState(false);

  useEffect(() => {
    const currentUser = getCurrentUsername();
    const adminCheck = isAdmin();
    setUsername(currentUser);
    setAdminStatus(adminCheck);
  }, []);

  const goToLogIn = () => {
    navigate("/login");
  };

  const goToProblemCreate = () => {
    navigate("/problem-create");
  };

  const goToJudgingStatus = () => {
    navigate("/judging-status");
  };

  const goToProblems = () => {
    navigate("/problems");
  };

  const goToAdmin = () => {
    navigate("/admin");
  };

  return (
    <Layout>
      <div className="flex flex-col items-center gap-4">
        {/* 현재 로그인한 사용자 표시 */}
        {username ? (
          <div className="text-lg font-semibold text-gray-700 mb-2">
            안녕하세요, {username}님! 👋
          </div>
        ) : (
          <div className="text-lg font-semibold text-gray-500 mb-2">
            로그인이 필요합니다
          </div>
        )}
        
        <BlackLineButton onClick={goToLogIn}>Login</BlackLineButton>
        <BlackLineButton onClick={goToProblems}>[테스트페이지] 문제 모음</BlackLineButton>
        <BlackLineButton onClick={goToProblemCreate}>[관리자] 문제 출제</BlackLineButton>
        <BlackLineButton onClick={goToJudgingStatus}>[테스트페이지] 제출현황</BlackLineButton>
        
        {/* 관리자만 보이는 버튼 */}
        {adminStatus && (
          <BlackLineButton onClick={goToAdmin} className="bg-red-100 border-red-300 text-red-700 hover:bg-red-200">
            🔧 관리자 대시보드
          </BlackLineButton>
        )}
      </div>
    </Layout>
  );
}

export default App;
