import { useState, useEffect } from "react";
import Header from "@/components/Layout/Header/Navbar";
import Footer from "@/components/Layout/Footer";


// ✅ 수정된 경로: Components/Profile 폴더 내부의 ProfileSection을 호출합니다.
import ProfileSection from "./Components/Profile/ProfileSection";
import PointContent from "./Components/PointContent";

import { getUserBalance } from "@/api/point";
import { getMyTotalAttendanceCount } from "@/api/attendance";
import { getPushedBoardLikesCount } from "@/api/boardLike";
import { getCurrentUser } from "@/api/auth";

interface PointRecord {
  id: number;
  type: "earn" | "use" | "expire";
  description: string;
  amount: number;
  date: string;
}

type FilterType = "all" | "earn" | "use" | "expire";

function MyPagePoint() {
  const [activeTab, setActiveTab] = useState("points");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [userBalance, setUserBalance] = useState<number>(0);
  const [records, setRecords] = useState<PointRecord[]>([]);

  const [userProfile, setUserProfile] = useState({
    nickname: "User",
    userId: "",
    email: "",
    profileImage: "",
  });

  const [stats, setStats] = useState({
    visitCount: 0,
    likeCount: 0,
    postCount: 19,
    commentCount: 183,
  });

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const currentUser = getCurrentUser();
        if (currentUser) {
          setUserProfile({
            nickname: currentUser.nickname,
            userId: currentUser.userId,
            email: currentUser.email,
            profileImage: currentUser.profileImage || "",
          });
        }

        const [balanceRes, attendanceCount, boardLikeCount] = await Promise.all([
          getUserBalance(),
          getMyTotalAttendanceCount(),
          getPushedBoardLikesCount(),
        ]);

        if (balanceRes && balanceRes.success) {
          setUserBalance(balanceRes.currentBalance || 0);
          const sampleRecords: PointRecord[] = [
            { id: 1, type: "earn", description: "제1회 NIMDACON 참여", amount: 100, date: "03.03" },
            { id: 2, type: "earn", description: "초기 지원금", amount: 1334, date: "25.12.28" },
          ];
          setRecords(sampleRecords);
        }

        setStats(prev => ({
          ...prev,
          visitCount: attendanceCount,
          likeCount: boardLikeCount,
        }));
      } catch (error) {
        console.error("데이터 로드 중 오류 발생:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  const filteredRecords = activeFilter === "all" ? records : records.filter((r) => r.type === activeFilter);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage) || 1;
  const displayedRecords = filteredRecords.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // ✅ Profile 하위 컴포넌트들이 공통으로 사용할 데이터 규격
  const userInfo = {
    name: userProfile.nickname,
    id: userProfile.userId,
    profileImage: userProfile.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile.nickname}`,
    stats: [
      { label: "방문", value: String(stats.visitCount) },
      { label: "작성글", value: String(stats.postCount) },
      { label: "댓글", value: String(stats.commentCount) },
      { label: "누른 좋아요", value: String(stats.likeCount) },
      { label: "보유 NC", value: userBalance.toLocaleString(), isPrimary: true },
    ],
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans text-[#0c0c0c] flex flex-col">
      <Header />
      {/* 56px 상단바 여백 */}
      <div className="h-[56px] w-full" />

      <main className="flex-1 flex justify-center pt-10 pb-12 overflow-x-hidden">
        <div className="w-full max-w-[1050px] px-6">

          {/* ✅ 쪼개진 컴포넌트들의 부모 역할을 수행 */}
          <ProfileSection
            userInfo={userInfo}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />

          {activeTab === "points" && (
            <div className="mt-10">
              <PointContent
                loading={loading}
                userBalance={userBalance}
                activeFilter={activeFilter}
                setActiveFilter={setActiveFilter}
                setCurrentPage={setCurrentPage}
                displayedRecords={displayedRecords}
                totalPages={totalPages}
                currentPage={currentPage}
                handlePageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default MyPagePoint;