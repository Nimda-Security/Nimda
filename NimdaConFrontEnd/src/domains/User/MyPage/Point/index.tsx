import { useState, useEffect } from 'react';
import Header from '@/components/Layout/Header/NavBar';
import Footer from '@/components/Layout/Footer';

import ProfileSection from './Components/Profile/ProfileSection';
import PointContent from './Components/PointContent';
import UserInfoContent from './Components/UserInfoContent';
import MyCommentsContent from './Components/MyCommentsContent';
import MyPostsContent from './Components/MyPostsContent';
import LikedPostsContent from './Components/LikedPostsContent';

import { getUserBalance } from '@/api/point';
import { getMyTotalAttendanceCount } from '@/api/attendance';
import { getPushedBoardLikesCount } from '@/api/boardLike';
import { getCurrentUser, getMyPageInfo } from '@/api/auth';
import { getMyBoardCountAPI } from '@/api/board';
import { getMyCommentCountAPI } from '@/api/comment';

function MyPagePoint() {
  const [activeTab, setActiveTab] = useState('points');
  const [loading, setLoading] = useState(true);

  const [userBalance, setUserBalance] = useState<number>(0);

  const [userProfile, setUserProfile] = useState({
    nickname: 'User',
    userId: '',
    email: '',
    profileImage: '',
    profileDecoration: '',
    roles: [] as string[],
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

        // localStorage에서 기본값 설정
        const currentUser = getCurrentUser();
        if (currentUser) {
          setUserProfile({
            nickname: currentUser.nickname,
            userId: currentUser.userId,
            email: currentUser.email,
            profileImage: currentUser.profileImage || '',
            profileDecoration: currentUser.profileDecoration || '',
            roles: currentUser.roles || [],
          });
        }

        const [
          balanceRes,
          attendanceCount,
          boardLikeCount,
          myPostCount,
          myCommentCount,
          myPageRes,
        ] = await Promise.all([
          getUserBalance(),
          getMyTotalAttendanceCount(),
          getPushedBoardLikesCount(),
          getMyBoardCountAPI(),
          getMyCommentCountAPI(),
          getMyPageInfo(),
        ]);

        // 서버에서 받은 프로필 정보로 갱신 (S3 Presigned URL 포함)
        if (myPageRes.success && myPageRes.data) {
          const d = myPageRes.data as Record<string, unknown>;
          setUserProfile({
            nickname: (d.nickname as string) || currentUser?.nickname || 'User',
            userId: (d.userId as string) || currentUser?.userId || '',
            email: (d.email as string) || currentUser?.email || '',
            profileImage: (d.profileImage as string) || '',
            profileDecoration:
              (d.profileDecoration as string) ||
              currentUser?.profileDecoration ||
              '',
            roles:
              (d.roles as string[] | undefined) ||
              currentUser?.roles ||
              [],
          });
        }

        if (balanceRes && balanceRes.success) {
          const amount =
            (balanceRes as any).data?.totalAmount ??
            balanceRes.currentBalance ??
            0;
          setUserBalance(amount);
        }

        setStats({
          visitCount: attendanceCount || 0,
          likeCount: boardLikeCount || 0,
          postCount: myPostCount || 0,
          commentCount: myCommentCount || 0,
        });
      } catch (error) {
        console.error('데이터 로드 중 오류 발생:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  const userInfo = {
    name: userProfile.nickname,
    id: userProfile.userId,
    profileImage: userProfile.profileImage || '/default_user_profile.svg',
    profileDecoration: userProfile.profileDecoration || '',
    roles: userProfile.roles,
    stats: [
      { label: '방문', value: String(stats.visitCount) },
      { label: '작성글', value: String(stats.postCount) },
      { label: '댓글', value: String(stats.commentCount) },
      { label: '누른 좋아요', value: String(stats.likeCount) },
      {
        label: '보유 NC',
        value: userBalance.toLocaleString(),
        isPrimary: true,
      },
    ],
  };

  const handleProfileImageChange = (newUrl: string) => {
    setUserProfile((prev) => ({ ...prev, profileImage: newUrl }));
  };

  const handleProfileDecorationChange = (newDecoration: string | null) => {
    setUserProfile((prev) => ({
      ...prev,
      profileDecoration: newDecoration || '',
    }));
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-['Pretendard',sans-serif] text-[#0c0c0c] flex flex-col">
      <Header />
      <div className="h-[88px] w-full" />

      <main className="layout-page-main">
        <div className="w-full max-w-[960px]">
          {/* 상단 프로필 및 탭 메뉴 */}
          <ProfileSection
            userInfo={userInfo}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onProfileImageChange={handleProfileImageChange}
            onProfileDecorationChange={handleProfileDecorationChange}
          />

          {/* 2. 💡 강제 간격 조정 (mt-6 대신 독립적인 div로 24px 확보) */}
          <div className="h-[24px] w-full" />

          {/* 3. 하단 콘텐츠 영역 */}
          <div className="w-full">
            {activeTab === 'profile' && <UserInfoContent loading={loading} />}

            {activeTab === 'my_posts' && <MyPostsContent />}

            {activeTab === 'my_comments' && <MyCommentsContent />}

            {activeTab === 'liked_posts' && <LikedPostsContent />}

            {activeTab === 'points' && (
              <PointContent loading={loading} userBalance={userBalance} />
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default MyPagePoint;
