import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Layout/Header/NavBar';
import Footer from '@/components/Layout/Footer';
import ProfileSummary from '@/domains/User/MyPage/Point/Components/Profile/ProfileSummary';
import Avatar from '@/components/Avatar/Avatar';
import ContentListItem from '@/domains/User/MyPage/Point/Components/ContentList/ContentListItem';
import Pagination from '@/domains/User/MyPage/Point/Components/ContentList/Pagination';
import {
  getUserProfileByNickname,
  getUserBoardsAPI,
  getUserCommentsByNickname,
  getUserLikedBoardsByNickname,
  getUserPointBalanceByNickname,
  getUserPointDetailsByNickname,
} from '@/api/user';
import type {
  UserPublicProfile,
  UserComment,
  LikedBoard,
  PointHistoryItem,
} from '@/api/user';

type TabKey = 'profile' | 'my_posts' | 'my_comments' | 'liked_posts' | 'points';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'profile', label: '회원정보' },
  { key: 'my_posts', label: '작성글' },
  { key: 'my_comments', label: '작성 댓글' },
  { key: 'liked_posts', label: '좋아요한 글' },
  { key: 'points', label: '마일리지' },
];

const ITEMS_PER_PAGE = 8;

const formatShortDate = (dateStr?: string): string => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return `${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
};

const formatFullDate = (dateStr?: string): string => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
};

interface BoardItem {
  id: number;
  title: string;
  createdAt?: string;
  likeCount?: number;
  commentCount?: number;
  category?: { name: string; slug?: string };
}

function EmptyNotice({ message }: { message: string }) {
  return (
    <div
      className="border border-[#d4d4d4] rounded-[4px] bg-[#f5f5f5]"
      style={{
        display: 'flex',
        width: '100%',
        height: '360px',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <span
        style={{
          color: '#A3A3A3',
          fontFamily: 'Pretendard',
          fontSize: '16px',
          fontWeight: 500,
        }}
      >
        {message}
      </span>
    </div>
  );
}

function PublicListPagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <>
      <div className="h-[12px]" />
      <div className="mt-[8px] h-[40px]" aria-hidden="true" />
      <div style={{ marginBottom: '24px' }}>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
        <div className="h-[24px] w-full" aria-hidden="true" />
      </div>
    </>
  );
}

function ProfileInfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '16px 0',
        borderBottom: '1px solid #f0f0f0',
        gap: '16px',
      }}
    >
      <span
        style={{
          minWidth: '120px',
          color: '#8E8E8E',
          fontFamily: 'Pretendard',
          fontSize: '14px',
          fontWeight: 500,
        }}
      >
        {label}
      </span>
      <span
        style={{
          color: '#0C0C0C',
          fontFamily: 'Pretendard',
          fontSize: '14px',
          fontWeight: 400,
        }}
      >
        {value}
      </span>
    </div>
  );
}

export default function UserProfilePage() {
  const { nickname } = useParams<{ nickname: string }>();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<UserPublicProfile | null>(null);
  const [boards, setBoards] = useState<BoardItem[]>([]);
  const [comments, setComments] = useState<UserComment[]>([]);
  const [likedBoards, setLikedBoards] = useState<LikedBoard[]>([]);
  const [pointBalance, setPointBalance] = useState<number>(0);
  const [pointDetails, setPointDetails] = useState<PointHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('my_posts');
  const [boardsPage, setBoardsPage] = useState(1);
  const [commentsPage, setCommentsPage] = useState(1);
  const [likedPage, setLikedPage] = useState(1);
  const [pointFilter, setPointFilter] = useState<
    'all' | 'earn' | 'use' | 'expire'
  >('all');

  useEffect(() => {
    if (!nickname) return;
    setLoading(true);
    setNotFound(false);
    setBoardsPage(1);
    setCommentsPage(1);
    setLikedPage(1);
    setPointFilter('all');

    Promise.all([
      getUserProfileByNickname(nickname),
      getUserBoardsAPI(nickname),
      getUserCommentsByNickname(nickname),
      getUserLikedBoardsByNickname(nickname),
      getUserPointBalanceByNickname(nickname),
      getUserPointDetailsByNickname(nickname),
    ])
      .then(
        ([
          profileData,
          boardData,
          commentData,
          likedData,
          balanceData,
          detailsData,
        ]) => {
          if (!profileData) {
            setNotFound(true);
          } else {
            setProfile(profileData);
            setBoards(boardData as BoardItem[]);
            setComments(commentData);
            setLikedBoards(likedData);
            setPointBalance(balanceData);
            setPointDetails(detailsData);
          }
        }
      )
      .finally(() => setLoading(false));
  }, [nickname]);

  /* ── 로딩 ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] font-['Pretendard',sans-serif] flex flex-col">
        <Header />
        <div className="h-[88px]" />
        <main className="flex-1 flex items-center justify-center">
          <span className="text-[#a3a3a3] text-[16px]">
            프로필을 불러오는 중...
          </span>
        </main>
        <Footer />
      </div>
    );
  }

  /* ── 404 ── */
  if (notFound || !profile) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] font-['Pretendard',sans-serif] flex flex-col">
        <Header />
        <div className="h-[88px]" />
        <main className="flex-1 flex flex-col items-center justify-center gap-4">
          <span className="text-[#a3a3a3] text-[16px]">
            존재하지 않는 사용자입니다.
          </span>
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2 border border-[#d4d4d4] rounded-[6px] text-[14px] text-[#444] bg-white"
          >
            뒤로 가기
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  /* ── 페이지네이션 계산 ── */
  const totalBoardPages = Math.max(
    1,
    Math.ceil(boards.length / ITEMS_PER_PAGE)
  );
  const displayedBoards = boards.slice(
    (boardsPage - 1) * ITEMS_PER_PAGE,
    boardsPage * ITEMS_PER_PAGE
  );
  const totalCommentPages = Math.max(
    1,
    Math.ceil(comments.length / ITEMS_PER_PAGE)
  );
  const displayedComments = comments.slice(
    (commentsPage - 1) * ITEMS_PER_PAGE,
    commentsPage * ITEMS_PER_PAGE
  );

  const userInfo = {
    name: profile.nickname,
    id: '',
    stats: [
      { label: '작성글', value: String(boards.length) },
      { label: '댓글', value: String(comments.length) },
      { label: '좋아요', value: String(likedBoards.length) },
    ],
  };

  /* ── 좋아요한 글 페이지네이션 ── */
  const totalLikedPages = Math.max(
    1,
    Math.ceil(likedBoards.length / ITEMS_PER_PAGE)
  );
  const displayedLiked = likedBoards.slice(
    (likedPage - 1) * ITEMS_PER_PAGE,
    likedPage * ITEMS_PER_PAGE
  );

  /* ── 마일리지 필터 ── */
  const filteredPoints = pointDetails.filter((item) => {
    if (pointFilter === 'all') return true;
    if (pointFilter === 'earn') return item.amount > 0;
    if (pointFilter === 'use') return item.amount < 0;
    if (pointFilter === 'expire') return item.type === 'expire';
    return true;
  });

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div
            className="border border-[#d4d4d4] rounded-[4px] bg-white"
            style={{ padding: '8px 24px' }}
          >
            <ProfileInfoRow label="닉네임" value={profile.nickname} />
            {profile.bojId && (
              <ProfileInfoRow label="BOJ 아이디" value={profile.bojId} />
            )}
            {profile.major && (
              <ProfileInfoRow label="전공" value={profile.major} />
            )}
            {profile.email && (
              <ProfileInfoRow label="이메일" value={profile.email} />
            )}
            {profile.createdAt && (
              <ProfileInfoRow
                label="가입일"
                value={formatFullDate(profile.createdAt)}
              />
            )}
          </div>
        );

      case 'my_posts':
        if (boards.length === 0)
          return <EmptyNotice message="작성한 게시글이 없습니다." />;
        return (
          <>
            <div className="border border-[#d4d4d4] rounded-[4px] bg-transparent overflow-hidden">
              {displayedBoards.map((board, idx) => (
                <ContentListItem
                  key={board.id}
                  item={{
                    id: board.id,
                    text: board.title,
                    likeCount: board.likeCount ?? 0,
                    commentCount: board.commentCount,
                    date: formatShortDate(board.createdAt),
                  }}
                  checked={false}
                  onToggle={() => {}}
                  isLast={idx === displayedBoards.length - 1}
                  onClick={() =>
                    navigate(
                      `/board/${board.category?.slug || 'all'}/${board.id}`
                    )
                  }
                  mode="arrow"
                />
              ))}
            </div>
            <PublicListPagination
              currentPage={boardsPage}
              totalPages={totalBoardPages}
              onPageChange={setBoardsPage}
            />
          </>
        );

      case 'my_comments':
        if (comments.length === 0)
          return <EmptyNotice message="작성한 댓글이 없습니다." />;
        return (
          <>
            <div className="border border-[#d4d4d4] rounded-[4px] bg-transparent overflow-hidden">
              {displayedComments.map((comment, idx) => (
                <ContentListItem
                  key={comment.id}
                  item={{
                    id: comment.id,
                    text: comment.context,
                    likeCount: comment.likeCount,
                    date: comment.createdAt,
                  }}
                  checked={false}
                  onToggle={() => {}}
                  isLast={idx === displayedComments.length - 1}
                  onClick={() => navigate(`/board/view/${comment.boardId}`)}
                  mode="arrow"
                />
              ))}
            </div>
            <PublicListPagination
              currentPage={commentsPage}
              totalPages={totalCommentPages}
              onPageChange={setCommentsPage}
            />
          </>
        );

      case 'liked_posts':
        if (likedBoards.length === 0)
          return <EmptyNotice message="좋아요한 게시글이 없습니다." />;
        return (
          <>
            <div className="border border-[#d4d4d4] rounded-[4px] bg-transparent overflow-hidden">
              {displayedLiked.map((board, idx) => (
                <ContentListItem
                  key={board.id}
                  item={{
                    id: board.id,
                    text: board.title,
                    likeCount: board.likeCount ?? 0,
                    commentCount: board.commentCount ?? 0,
                    date: formatShortDate(board.createdAt),
                    thumbnailUrl: board.filepath || undefined,
                    authorNickname: board.authorNickname,
                    authorProfileImage: board.authorProfileImage,
                    authorProfileDecoration: board.authorProfileDecoration,
                  }}
                  checked={false}
                  onToggle={() => {}}
                  isLast={idx === displayedLiked.length - 1}
                  onClick={() => navigate(`/board/view/${board.id}`)}
                  mode="arrow"
                />
              ))}
            </div>
            <PublicListPagination
              currentPage={likedPage}
              totalPages={totalLikedPages}
              onPageChange={setLikedPage}
            />
          </>
        );

      case 'points':
        return (
          <div
            style={{
              width: '100%',
              borderRadius: '4px',
              border: '1px solid #D4D4D4',
              display: 'flex',
              flexDirection: 'column',
              marginBottom: '48px',
            }}
          >
            {/* 잔액 + 필터 */}
            <div
              style={{
                paddingTop: '32px',
                paddingLeft: '32px',
                paddingRight: '24px',
              }}
            >
              <div>
                <p className="text-[14px] font-medium leading-[150%] text-[#D97399] mb-1 tracking-tight">
                  보유 마일리지
                </p>
                <div
                  className="flex items-baseline"
                  style={{ columnGap: '4px' }}
                >
                  <span className="text-[24px] font-bold leading-[120%] text-[#0C0C0C] tracking-[-0.03em]">
                    {pointBalance.toLocaleString()}
                  </span>
                  <span className="text-[16px] font-medium leading-[150%] text-[#0C0C0C] tracking-tight">
                    NC
                  </span>
                </div>
              </div>
              {/* 필터 버튼 */}
              <div className="flex gap-2" style={{ marginTop: '32px' }}>
                {[
                  { key: 'all', label: '전체' },
                  { key: 'earn', label: '적립' },
                  { key: 'use', label: '사용' },
                  { key: 'expire', label: '만료' },
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => {
                      setPointFilter(f.key as typeof pointFilter);
                    }}
                    className={`text-[14px] font-[600] leading-[150%] text-center transition-all flex items-center justify-center ${
                      pointFilter === f.key
                        ? 'text-[#F5F5F5]'
                        : 'border-[1.5px] border-[#D97399] text-[#D97399]'
                    }`}
                    style={{
                      width: '49px',
                      height: '28px',
                      borderRadius: '8px',
                      background:
                        pointFilter === f.key ? '#D97399' : 'transparent',
                      border:
                        pointFilter === f.key
                          ? '1px solid #D97399'
                          : '1.5px solid #D97399',
                      cursor: 'pointer',
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            {/* 거래 내역 */}
            <div
              style={{
                paddingLeft: '24px',
                paddingRight: '24px',
                marginTop: '24px',
                maxHeight: '576px',
                overflowY: 'auto',
              }}
            >
              {filteredPoints.length > 0 ? (
                <div className="flex flex-col">
                  {filteredPoints.map((record, index) => (
                    <div
                      key={record.id || index}
                      style={{
                        width: '100%',
                        height: '72px',
                        flexShrink: 0,
                        borderTop: '1px solid #D4D4D4',
                        borderBottom: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        paddingLeft: '24px',
                        paddingRight: '24px',
                      }}
                    >
                      <div
                        className={`w-2 h-2 rounded-full flex-shrink-0 ${record.type === 'expire' ? 'bg-[#D4D4D4]' : 'bg-[#D97399]'}`}
                      />
                      <div className="flex-grow">
                        <p className="text-[14px] font-[500] leading-[150%] text-[#000]">
                          {record.description}
                        </p>
                        <p className="text-[12px] font-normal text-[#A3A3A3] leading-[150%] mt-0.5">
                          {record.date}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <p
                          className={`text-[20px] font-bold leading-[150%] ${
                            record.amount > 0
                              ? 'text-[#D97399]'
                              : 'text-[#0C0C0C]'
                          }`}
                        >
                          {record.amount > 0
                            ? `+${record.amount.toLocaleString()}`
                            : record.amount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  className="flex flex-col items-center justify-center text-[#A3A3A3]"
                  style={{
                    minHeight: '300px',
                    marginTop: '20px',
                    paddingTop: '48px',
                    paddingBottom: '48px',
                    boxSizing: 'border-box',
                  }}
                >
                  <p className="text-[14px] font-medium">
                    거래 내역이 없습니다.
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-['Pretendard',sans-serif] text-[#0c0c0c] flex flex-col">
      <Header />
      <div className="h-[88px] w-full" />

      <main className="layout-page-main">
        <div className="w-full max-w-[960px]">
          <div className="w-full flex flex-col gap-[36px]">
            {/* 아바타 + 기본 정보 */}
            <div className="inline-flex pl-8 pr-[510px] items-start gap-6">
              <Avatar
                src={profile.profileImage}
                decorationKey={profile.profileDecoration}
                size={96}
                wrapperClassName="user-profile-avatar-wrap"
                className="user-profile-avatar"
                decorationScale={1.18}
                reserveDecorationSpace
              />
              <ProfileSummary userInfo={userInfo} />
            </div>

            {/* 탭 바 */}
            <div className="w-full flex items-center gap-8 border-b border-[#e5e5e5] bg-transparent">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      rowGap: '12px',
                      paddingBottom: 0,
                      lineHeight: 1.25,
                    }}
                    className={`text-[16px] whitespace-nowrap font-['Pretendard'] ${isActive ? 'font-bold text-[#d97399]' : 'font-medium text-[#8e8e8e] hover:text-[#0c0c0c]'}`}
                  >
                    <span>{tab.label}</span>
                    <div
                      style={{ marginBottom: '-1px' }}
                      className={`w-full h-[3px] ${
                        isActive ? 'bg-[#D97399]' : 'bg-transparent'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="h-[24px] w-full" />

          <div className="w-full">{renderTabContent()}</div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
