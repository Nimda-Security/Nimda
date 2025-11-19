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

import ContestHome from "@/domains/Contest/Home";

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/problems" element={<ProblemsPage />} />
        <Route path="/problem-submit" element={<ProblemSubmitPage />} />
        <Route path="/problem-create" element={<ProblemCreatePage />} />
        <Route path="/problem-edit/:id" element={<ProblemEditPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/problem/:id" element={<ProblemDetail />} />
        <Route path="/judging-status" element={<JudgingStatusPage />} />
        <Route path="/scoreboard" element={<Scoreboard />} />

        <Route path="/contest" element={<ContestHome />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
