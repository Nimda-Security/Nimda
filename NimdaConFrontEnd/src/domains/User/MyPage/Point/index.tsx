import { useState, useEffect } from "react";
import Header from "@/components/Layout/Header/NavBar";
import Footer from "@/components/Layout/Footer";

import ProfileSection from "./Components/Profile/ProfileSection";
import PointContent from "./Components/PointContent";
import UserInfoContent from "./Components/UserInfoContent";
import MyCommentsContent from "./Components/MyCommentsContent";
import MyPostsContent from "./Components/MyPostsContent";
import LikedPostsContent from "./Components/LikedPostsContent";

import { getUserBalance } from "@/api/point";
import { getMyTotalAttendanceCount } from "@/api/attendance";
import { getPushedBoardLikesCount } from "@/api/boardLike";
import { getCurrentUser } from "@/api/auth";
import { getMyBoardCountAPI } from '@/api/board';
import { getMyCommentCountAPI } from '@/api/comment';

type FilterType = "all" | "earn" | "use" | "expire";

function MyPagePoint() {
  const [activeTab, setActiveTab] = useState("points");
  const [loading, setLoading] = useState(true);

  const [userBalance, setUserBalance] = useState<number>(0);

  const [userProfile, setUserProfile] = useState({
    nickname: "User",
    userId: "",
    email: "",
    profileImage: "",
  });

  const [stats, setStats] = useState({
    visitCount: 0,
    likeCount: 0,
    postCount: 0,
    commentCount: 0,
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

        const [balanceRes, attendanceCount, boardLikeCount, myPostCount, myCommentCount] = await Promise.all([
          getUserBalance(),
          getMyTotalAttendanceCount(),
          getPushedBoardLikesCount(),
          getMyBoardCountAPI(),
          getMyCommentCountAPI(),
        ]);

        if (balanceRes && balanceRes.success) {
          const amount = balanceRes.data?.totalAmount ?? balanceRes.currentBalance ?? 0;
          setUserBalance(amount);
        }

        setStats({
          visitCount: attendanceCount || 0,
          likeCount: boardLikeCount || 0,
          postCount: myPostCount || 0,
          commentCount: myCommentCount || 0,
        });

      } catch (error) {
        console.error("데이터 로드 중 오류 발생:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

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
    <div className="min-h-screen bg-[#F5F5F5] font-['Pretendard',sans-serif] text-[#0c0c0c] flex flex-col">
      <Header />
      <div className="h-[56px] w-full" />

      <main className="flex-1 flex justify-center pt-10 pb-12 overflow-x-hidden">
        <div className="w-full max-w-[1200px] px-[120px]">
          {/* 상단 프로필 및 탭 메뉴 */}
          <ProfileSection
            userInfo={userInfo}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />

          {/* 2. 💡 강제 간격 조정 (mt-6 대신 독립적인 div로 24px 확보) */}
          <div className="h-[24px] w-full" /> 

          {/* 3. 하단 콘텐츠 영역 */}
          <div className="w-full">
            {activeTab === "profile" && (
              <UserInfoContent loading={loading} />
            )}

            {activeTab === "my_posts" && <MyPostsContent />}

            {activeTab === "my_comments" && <MyCommentsContent />}

            {activeTab === "liked_posts" && <LikedPostsContent />}

            {activeTab === "points" && (
              <PointContent
                loading={loading}
                userBalance={userBalance}
              />
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default MyPagePoint;