import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "@/components/ScrollToTop";
import ProtectedRoute from "@/components/ProtectedRoute";

const LoginPage = lazy(() => import("@/domains/User/Login/Page"));
const SignUp = lazy(() => import("@/domains/User/Register"));
const MyPageMileage = lazy(() => import("@/domains/User/MyPage/Point/index"));
const ProblemSubmitPage = lazy(() => import("@/domains/Contest/Problem/ProblemSubmit"));
const JudgingStatusPage = lazy(() => import("@/domains/Contest/Problem/JudgingStatus"));
const ProblemsPage = lazy(() => import("@/domains/Contest/Problem/Problems"));
const ProblemCreatePage = lazy(() => import("@/domains/Contest/Problem/ProblemCreate"));
const ProblemEditPage = lazy(() => import("@/domains/Contest/Problem/ProblemEdit"));
const AdminDashboard = lazy(() => import("@/domains/admin/AdminDashboard.jsx"));
const ProblemDetail = lazy(() => import("@/domains/Contest/Problem/ProblemDetail/index.jsx"));
const Home = lazy(() => import("@/domains/Home"));
const Scoreboard = lazy(() => import("@/domains/Contest/Scoreboard"));
const ForbiddenPage = lazy(() => import("@/domains/Error/403"));
const ContestHome = lazy(() => import("@/domains/Contest/Home"));
const BoardRoutePage = lazy(() => import("@/domains/Board/BoardRoute"));
const BoardDetailPage = lazy(() => import("@/domains/Board/BoardDetail"));
const BoardWritePage = lazy(() => import("@/domains/Board/BoardWrite"));
const PhotoGalleryBoard = lazy(() => import("@/domains/Board/PhotoGalleryBoard"));
const UserProfilePage = lazy(() => import("@/domains/User/UserProfile"));
const AdminMileage = lazy(() => import("@/domains/admin/AdminMileage.jsx"));

const Router = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Suspense fallback={<div role="status" aria-live="polite">페이지를 불러오는 중...</div>}>
      <Routes>
        {/* 인증 불필요 경로 */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/403" element={<ForbiddenPage />} />

        {/* 게스트 접근 가능 경로 */}
        <Route path="/" element={<Home />} />
        <Route path="/problems" element={<ProblemsPage />} />
        <Route path="/problems/:id" element={<ProblemDetail />} />
        <Route path="/judging-status" element={<JudgingStatusPage />} />
        <Route path="/scoreboard" element={<Scoreboard />} />
        <Route path="/contest" element={<ContestHome />} />
        <Route path="/user/:nickname" element={<UserProfilePage />} />
        <Route path="/board/picture-board" element={<PhotoGalleryBoard boardSlug="picture-board" boardTitle="사진첩" />} />
        <Route path="/board/banner" element={<PhotoGalleryBoard boardSlug="banner" boardTitle="배너" adminOnlyWrite={true} />} />
        <Route path="/board/:boardType" element={<BoardRoutePage />} />
        <Route path="/board/:boardType/:id" element={<BoardDetailPage />} />

        {/* 로그인 필수 경로 */}
        <Route path="/mypage" element={<ProtectedRoute><MyPageMileage /></ProtectedRoute>} />
        <Route path="/problem-submit" element={<ProtectedRoute><ProblemSubmitPage /></ProtectedRoute>} />
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
      </Suspense>
    </BrowserRouter>
  );
};

export default Router;
