import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate, Outlet, RouterProvider } from "react-router-dom";
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
const NotFoundPage = lazy(async () => ({
  default: () => (
    <main className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-medium text-gray-700 mb-2">페이지를 찾을 수 없습니다</h2>
        <p className="text-gray-500 mb-8">요청한 주소를 확인하거나 홈으로 이동해주세요.</p>
        <a href="/" className="inline-block px-6 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 transition">
          홈으로
        </a>
      </div>
    </main>
  ),
}));

const RouterShell = () => (
  <>
    <ScrollToTop />
    <Suspense fallback={<div role="status" aria-live="polite">페이지를 불러오는 중...</div>}>
      <Outlet />
    </Suspense>
  </>
);

const router = createBrowserRouter([
  {
    element: <RouterShell />,
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/signup", element: <SignUp /> },
      { path: "/403", element: <ForbiddenPage /> },
      { path: "/", element: <Home /> },
      { path: "/problems", element: <ProblemsPage /> },
      { path: "/problems/:id", element: <ProblemDetail /> },
      { path: "/judging-status", element: <JudgingStatusPage /> },
      { path: "/scoreboard", element: <Scoreboard /> },
      { path: "/contest", element: <ContestHome /> },
      { path: "/user/:nickname", element: <UserProfilePage /> },
      { path: "/board/picture-board", element: <PhotoGalleryBoard boardSlug="picture-board" boardTitle="사진첩" /> },
      { path: "/board/banner", element: <PhotoGalleryBoard boardSlug="banner" boardTitle="배너" adminOnlyWrite={true} /> },
      { path: "/board/:boardType", element: <BoardRoutePage /> },
      { path: "/board/:boardType/:id", element: <BoardDetailPage /> },
      { path: "/mypage", element: <ProtectedRoute><MyPageMileage /></ProtectedRoute> },
      { path: "/mileage", element: <Navigate to="/board/point" replace /> },
      { path: "/problem-submit", element: <ProtectedRoute><ProblemSubmitPage /></ProtectedRoute> },
      { path: "/problem-create", element: <ProtectedRoute><ProblemCreatePage /></ProtectedRoute> },
      { path: "/problem-edit/:id", element: <ProtectedRoute><ProblemEditPage /></ProtectedRoute> },
      { path: "/board/:boardType/write", element: <ProtectedRoute><BoardWritePage /></ProtectedRoute> },
      { path: "/board/:boardType/edit/:id", element: <ProtectedRoute><BoardWritePage /></ProtectedRoute> },
      { path: "/admin", element: <ProtectedRoute requireAdmin={true}><AdminDashboard /></ProtectedRoute> },
      { path: "/admin/mileage", element: <ProtectedRoute requireAdmin={true}><AdminMileage /></ProtectedRoute> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);

const Router = () => <RouterProvider router={router} />;

export default Router;
