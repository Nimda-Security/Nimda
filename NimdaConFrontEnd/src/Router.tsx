import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import ScrollToTop from "@/components/ScrollToTop";

// 기존 임포트 항목들
import LoginPage from "@/domains/User/Login/Page";
import SignUp from "@/domains/User/Register";
import MyPageMileage from "@/domains/User/MyPage/Point/index"; // /mypage 연결 컴포넌트
import ProblemSubmitPage from "@/domains/Contest/Problem/ProblemSubmit";
import JudgingStatusPage from "@/domains/Contest/Problem/JudgingStatus";
import ProblemsPage from "@/domains/Contest/Problem/Problems";
import ProblemCreatePage from "@/domains/Contest/Problem/ProblemCreate";
import ProblemEditPage from "@/domains/Contest/Problem/ProblemEdit";
import AdminDashboard from "@/domains/admin/AdminDashboard.jsx";
import ProblemDetail from "@/domains/Contest/Problem/ProblemDetail";
import Home from "@/domains/Home";
import Scoreboard from "@/domains/Contest/Scoreboard";
import ProtectedRoute from "@/components/ProtectedRoute";
import ForbiddenPage from "@/domains/Error/403";

import ContestLanding from "@/domains/Contest/Landing";
import BoardRoutePage from "@/domains/Board/BoardRoute";
import BoardDetailPage from "@/domains/Board/BoardDetail";
import BoardWritePage from "@/domains/Board/BoardWrite";
import BoardEditPage from "@/domains/Board/BoardEdit";
import PhotoGalleryBoard from "@/domains/Board/PhotoGalleryBoard";
import UserProfilePage from "@/domains/User/UserProfile";

// [추가] 관리자 마일리지 지급 페이지 컴포넌트 임포트
import AdminMileage from "@/domains/admin/AdminMileage.jsx";

// 구 /problems/:id → /contest/problems/:id 리다이렉트용
const ProblemDetailRedirect = () => {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={`/contest/problems/${id}`} replace />;
};

const Router = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* 인증 불필요 경로 */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/403" element={<ForbiddenPage />} />

        {/* 게스트 접근 가능 경로 */}
        <Route path="/" element={<Home />} />
        <Route path="/judging-status" element={<JudgingStatusPage />} />
        <Route path="/scoreboard" element={<Scoreboard />} />

        {/* 대회 (NIMDACON) */}
        <Route path="/contest" element={<ContestLanding />} />
        <Route
          path="/contest/problems"
          element={
            <ProtectedRoute>
              <ProblemsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/contest/problems/:id"
          element={
            <ProtectedRoute>
              <ProblemDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/contest/submit/:id"
          element={
            <ProtectedRoute>
              <ProblemSubmitPage />
            </ProtectedRoute>
          }
        />

        {/* 구 대회 URL 리다이렉트 */}
        <Route path="/problems" element={<Navigate to="/contest/problems" replace />} />
        <Route path="/problems/:id" element={<ProblemDetailRedirect />} />
        <Route path="/problem-submit" element={<Navigate to="/contest/problems" replace />} />
        <Route path="/user/:nickname" element={<UserProfilePage />} />
        <Route path="/board/picture-board" element={<PhotoGalleryBoard boardSlug="picture-board" boardTitle="사진첩" />} />
        <Route path="/board/banner" element={<PhotoGalleryBoard boardSlug="banner" boardTitle="배너" adminOnlyWrite={true} />} />
        <Route path="/board/:boardType" element={<BoardRoutePage />} />
        <Route path="/board/:boardType/:id" element={<BoardDetailPage />} />

        {/* 로그인 필수 경로 */}
        <Route path="/mypage" element={<ProtectedRoute><MyPageMileage /></ProtectedRoute>} />
        <Route path="/problem-create" element={<ProtectedRoute><ProblemCreatePage /></ProtectedRoute>} />
        <Route path="/problem-edit/:id" element={<ProtectedRoute><ProblemEditPage /></ProtectedRoute>} />
        <Route path="/board/:boardType/write" element={<ProtectedRoute><BoardWritePage /></ProtectedRoute>} />
        <Route path="/board/:boardType/edit/:id" element={<ProtectedRoute><BoardWritePage /></ProtectedRoute>} />

        {/* 관리자 관련 경로 */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/mileage"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminMileage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
