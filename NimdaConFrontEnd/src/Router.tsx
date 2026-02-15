import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginPage from "@/domains/User/Login/Page";
import SignUp from "@/domains/User/Register";
import ProblemSubmitPage from "@/domains/Contest/Problem/ProblemSubmit"; // [DEBUG] 테스트용 코드
import JudgingStatusPage from "@/domains/Contest/Problem/JudgingStatus";
import ProblemsPage from "@/domains/Contest/Problem/Problems";
import ProblemCreatePage from "@/domains/Contest/Problem/ProblemCreate";
import ProblemEditPage from "@/domains/Contest/Problem/ProblemEdit";
import AdminDashboard from "@/domains/admin/AdminDashboard.jsx";
import ProblemDetail from "@/domains/Contest/Problem/ProblemDetail/index.jsx";
import Home from "@/domains/Home";
import Scoreboard from "@/domains/Contest/Scoreboard";
import ProtectedRoute from "@/components/ProtectedRoute";
import ForbiddenPage from "@/domains/Error/403";

import ContestHome from "@/domains/Contest/Home";
import BoardListPage from "@/domains/Board/BoardList";
import BoardDetailPage from "@/domains/Board/BoardDetail";
import BoardWritePage from "@/domains/Board/BoardWrite";
import BoardEditPage from "@/domains/Board/BoardEdit";

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/403" element={<ForbiddenPage />} />
        <Route path="/problems" element={<ProblemsPage />} />
        <Route path="/problem-submit" element={<ProblemSubmitPage />} />
        <Route path="/problem-create" element={<ProblemCreatePage />} />
        <Route path="/problem-edit/:id" element={<ProblemEditPage />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/problems/:id" element={<ProblemDetail />} />
        <Route path="/judging-status" element={<JudgingStatusPage />} />
        <Route path="/scoreboard" element={<Scoreboard />} />

        <Route path="/contest" element={<ContestHome />} />

        {/* Board Routes */}
        <Route path="/board/:boardType" element={<BoardListPage />} />
        <Route path="/board/:boardType/:id" element={<BoardDetailPage />} />
        <Route path="/board/:boardType/write" element={<BoardWritePage />} />
        <Route path="/board/:boardType/edit/:id" element={<BoardEditPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
