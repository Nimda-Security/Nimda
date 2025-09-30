import { BrowserRouter, Routes, Route } from "react-router-dom";

import App from "@/App";
import LoginPage from "@/domains/User/Login/Page";
import SignUp from "@/domains/User/Register";
import ProblemSubmitPage from "@/domains/Test/ProblemSubmit"; // [DEBUG] 테스트용 코드
import JudgingStatusPage from "@/domains/Test/JudgingStatus";
import ProblemsPage from "@/domains/Test/Problems";
import ProblemCreatePage from "@/domains/Test/ProblemCreate/ProblemCreate.jsx";
import AdminDashboard from "@/domains/admin/AdminDashboard.jsx";
import Home from "@/domains/Home";

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/problems" element={<ProblemsPage />} />
        <Route path="/problem-submit" element={<ProblemSubmitPage />} />
        <Route path="/problem-create" element={<ProblemCreatePage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/judging-status" element={<JudgingStatusPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
