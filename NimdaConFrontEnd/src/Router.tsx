import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import PhotoGalleryBoard from "@/domains/Board/PhotoGalleryBoard";
import UserProfilePage from "@/domains/User/UserProfile";

// [추가] 관리자 마일리지 지급 페이지 컴포넌트 임포트
import AdminMileage from "@/domains/admin/AdminMileage.jsx";

const Router = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* 기본 서비스 경로 */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUp />} />

        {/* 마이페이지 경로 (정상 연결 확인) */}
        <Route path="/mypage" element={<MyPageMileage />} />

        <Route path="/403" element={<ForbiddenPage />} />
        <Route path="/problems" element={<ProblemsPage />} />
        <Route path="/problem-submit" element={<ProblemSubmitPage />} />
        <Route path="/problem-create" element={<ProblemCreatePage />} />
        <Route path="/problem-edit/:id" element={<ProblemEditPage />} />
        <Route path="/problems/:id" element={<ProblemDetail />} />
        <Route path="/judging-status" element={<JudgingStatusPage />} />
        <Route path="/scoreboard" element={<Scoreboard />} />
        <Route path="/contest" element={<ContestHome />} />

        {/* 관리자 관련 경로 - ProtectedRoute로 보호 */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* 관리자 마일리지 지급 페이지 경로 추가 */}
        <Route
          path="/admin/mileage"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminMileage />
            </ProtectedRoute>
          }
        />

        {/* 유저 공개 프로필 */}
        <Route path="/user/:nickname" element={<UserProfilePage />} />

        {/* 게시판 관련 경로 */}
        {/* 사진첩은 갤러리 뷰 전용 컴포넌트 사용 */}
        <Route path="/board/picture-board" element={<PhotoGalleryBoard />} />
        <Route path="/board/:boardType" element={<BoardListPage />} />
        <Route path="/board/:boardType/:id" element={<BoardDetailPage />} />
        <Route path="/board/:boardType/write" element={<BoardWritePage />} />
        <Route path="/board/:boardType/edit/:id" element={<BoardWritePage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;