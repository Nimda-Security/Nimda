import React, { useState, useEffect } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { getCurrentNickname, hasRole, isAdmin } from "@/utils/jwt";
import { isLoggedIn } from "@/api/auth";
import { getAllCategoriesAPI } from "@/api/category";
import { getMyTotalAttendanceCount, getTodayVisitors, type AttendanceLog } from "@/api/attendance";
import { getMyBoardCountAPI } from "@/api/board";
import { getMyCommentCountAPI } from "@/api/comment";
import { getPushedBoardLikesCount } from "@/api/boardLike";
import { getUserBalance } from "@/api/point";
import type { Category } from "@/domains/Board/types";
import ChevronDown from "@/components/icons/ChevronDown";



const Sidebar: React.FC = () => {
  const [nickname, setNickname] = useState<string | null>(null);
  const [isLoggedInState, setIsLoggedInState] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  // 실시간 오늘 방문자 상태 (백엔드 DTO: { id, userName } 매핑)
  const [todayVisitors, setTodayVisitors] = useState<AttendanceLog[]>([]);

  // 프로필 통계 상태
  const [visitCount, setVisitCount] = useState(0);
  const [boardCount, setBoardCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [likeCount, setLikeCount] = useState(0);
  const [coinBalance, setCoinBalance] = useState(0);
  const [activeVisitorTab, setActiveVisitorTab] = useState<'today' | 'weekly'>('today');

  // 카테고리를 트리 구조로 변환
  type CategoryWithChildren = Category & { children: CategoryWithChildren[] };

  const buildCategoryTree = (categories: Category[]): CategoryWithChildren[] => {
    const categoryMap = new Map<number, CategoryWithChildren>();
    const rootCategories: CategoryWithChildren[] = [];

    categories.forEach(cat => {
      categoryMap.set(cat.id, { ...cat, children: [] });
    });

    categories.forEach(cat => {
      const category = categoryMap.get(cat.id);
      if (cat.parentId && categoryMap.has(cat.parentId)) {
        const parent = categoryMap.get(cat.parentId);
        if (parent && category) {
          parent.children.push(category);
        }
      } else {
        if (category) {
          rootCategories.push(category);
        }
      }
    });

    const sortCategories = (cats: CategoryWithChildren[]): CategoryWithChildren[] => {
      return cats.sort((a, b) => a.sortOrder - b.sortOrder).map(cat => ({
        ...cat,
        children: sortCategories(cat.children)
      }));
    };

    return sortCategories(rootCategories);
  };

  useEffect(() => {
    const currentNickname = getCurrentNickname();
    const loggedIn = isLoggedIn();
    setNickname(currentNickname);
    setIsLoggedInState(loggedIn);
  }, []);

  // 오늘 방문자 데이터 로드 (실시간 API 연동)
  useEffect(() => {
    const loadTodayVisitors = async () => {
      try {
        const data = await getTodayVisitors();
        setTodayVisitors(data);
      } catch (error) {
        console.error("오늘 방문자 로드 실패:", error);
      }
    };

    loadTodayVisitors();
  }, []);

  // 로그인 상태일 때 프로필 통계 API 호출
  useEffect(() => {
    if (!isLoggedInState) return;

    const loadProfileStats = async () => {
      try {
        const [visits, boards, comments, likes, balance] = await Promise.all([
          getMyTotalAttendanceCount(),
          getMyBoardCountAPI(),
          getMyCommentCountAPI(),
          getPushedBoardLikesCount(),
          getUserBalance(),
        ]);

        setVisitCount(visits);
        setBoardCount(boards);
        setCommentCount(comments);
        setLikeCount(likes);
        if (balance.success) {
          setCoinBalance(balance.currentBalance || 0);
        }
      } catch (error) {
        console.error('프로필 통계 로드 오류:', error);
      }
    };

    loadProfileStats();
  }, [isLoggedInState]);

  useEffect(() => {
    const loadCategories = async () => {
      setCategoriesLoading(true);
      try {
        const allCategories = await getAllCategoriesAPI();
        setCategories(allCategories);
      } catch (error) {
        console.error('카테고리 목록 로드 오류:', error);
      } finally {
        setCategoriesLoading(false);
      }
    };

    loadCategories();
  }, []);

  const categoryTree = buildCategoryTree(categories);

  // "카르텔" 카테고리: ROLE_CARTEL 또는 ROLE_ADMIN이 아니면 사이드바에서 숨김
  const canAccessCartel = hasRole('ROLE_CARTEL') || isAdmin();
  const filteredCategoryTree = canAccessCartel
    ? categoryTree
    : categoryTree.filter(cat => cat.name !== '카르텔');

  return (
    <aside className="layout__sidebar">
      {/* 유저 프로필 영역 */}
      <div className="sidebar-profile">
        <div className="sidebar-profile__avatar">
          <svg
            width="42"
            height="46"
            viewBox="0 0 52 56"
            fill="none"
            stroke="#a3a3a3"
            strokeWidth="2"
          >
            <path d="M44 48v-4a8 8 0 0 0-8-8H16a8 8 0 0 0-8 8v4" />
            <circle cx="26" cy="16" r="8" />
          </svg>
        </div>
        <p className="sidebar-profile__name">
          {isLoggedInState && nickname ? nickname : "게스트"}
        </p>
        {isLoggedInState ? (
          <div className="sidebar-profile__stats">
            <div className="sidebar-profile__stat-item">
              <div className="sidebar-profile__stat-icon">
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="7" cy="4.5" r="2.5" stroke="#0C0C0C" strokeWidth="1.5" />
                  <path d="M2.5 12.5C2.5 10.3 4.5 9 7 9s4.5 1.3 4.5 3.5" stroke="#0C0C0C" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <span className="sidebar-profile__stat-label">방문</span>
              <span className="sidebar-profile__stat-value"><strong>{visitCount}</strong> 회</span>
            </div>
            <div className="sidebar-profile__stat-item">
              <div className="sidebar-profile__stat-icon">
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.5 2.5h-9a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1z" stroke="#0C0C0C" strokeWidth="1.5" />
                  <path d="M4.5 5.5h5M4.5 8h5M4.5 10.5h3" stroke="#0C0C0C" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <span className="sidebar-profile__stat-label">작성 게시글</span>
              <span className="sidebar-profile__stat-value"><strong>{boardCount}</strong> 개</span>
            </div>
            <div className="sidebar-profile__stat-item">
              <div className="sidebar-profile__stat-icon">
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.5 2.5h-11v8h4l3 2.5v-2.5h4v-8z" stroke="#0C0C0C" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="sidebar-profile__stat-label">작성 댓글</span>
              <span className="sidebar-profile__stat-value"><strong>{commentCount}</strong> 개</span>
            </div>
            <div className="sidebar-profile__stat-item">
              <div className="sidebar-profile__stat-icon">
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 12.5l-1-.9C3.4 9 1.5 7.3 1.5 5.2a2.8 2.8 0 0 1 2.8-2.8c1.6 0 2.6 1 3.2 1.6.6-.6 1.6-1.6 3.2-1.6a2.8 2.8 0 0 1 2.8 2.8c0 2.1-1.9 3.8-4.5 6.4l-1 .9z" stroke="#0C0C0C" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="sidebar-profile__stat-label">누른 좋아요</span>
              <span className="sidebar-profile__stat-value"><strong>{likeCount}</strong> 개</span>
            </div>
            <div className="sidebar-profile__stat-item">
              <div className="sidebar-profile__stat-icon">
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="7" cy="7" r="6" stroke="#0C0C0C" strokeWidth="1.5" />
                  <path d="M7 4.5v5M4.5 7h5" stroke="#0C0C0C" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <span className="sidebar-profile__stat-label">보유 코인</span>
              <span className="sidebar-profile__stat-value"><strong>{coinBalance}</strong> NC</span>
            </div>
          </div>
        ) : (
          <>
            <p className="sidebar-profile__desc">로그인하고 내 프로필을 만들어 보세요</p>
            <Link to="/login" className="sidebar-profile__login-btn">로그인</Link>
            <Link to="/signup" className="sidebar-profile__signup-link">회원가입</Link>
          </>
        )}
      </div>

      <div className="sidebar-divider" />

      {/* 네비게이션 메뉴 */}
      <nav className="sidebar-nav">
        {categoriesLoading ? (
          <div style={{ padding: '16px', textAlign: 'center', color: '#999', fontSize: '14px' }}>카테고리 로딩 중...</div>
        ) : filteredCategoryTree.length > 0 ? (
          filteredCategoryTree.map((category) => (
            <CategorySection key={category.id} category={category} />
          ))
        ) : (
          <div style={{ padding: '16px', textAlign: 'center', color: '#999', fontSize: '14px' }}>카테고리가 없습니다.</div>
        )}
      </nav>

      <div className="sidebar-divider" />

      {/* 오늘 방문자 섹션 - 탭 UI 포함 */}
      <div className="sidebar-visitors">
        {/* 오늘 방문자 / 일일랭킹 탭 */}
        <div className="sidebar-visitors__tabs">
          <button
            type="button"
            className={`sidebar-visitors__tab${activeVisitorTab === 'today' ? ' sidebar-visitors__tab--active' : ''}`}
            onClick={() => setActiveVisitorTab('today')}
          >
            오늘 방문자
          </button>
          <button
            type="button"
            className={`sidebar-visitors__tab${activeVisitorTab === 'weekly' ? ' sidebar-visitors__tab--active' : ''}`}
            onClick={() => setActiveVisitorTab('weekly')}
          >
            일간랭킹
          </button>
        </div>
        {/* 목록 영역 */}
        <div className="sidebar-visitors__list">
          {activeVisitorTab === 'today' ? (
            todayVisitors.length > 0 ? (
              todayVisitors.map((visitor) => (
                <div key={visitor.id} className="sidebar-visitors__item">
                  <div className="sidebar-visitors__avatar">
                    <img 
                      src={visitor.profileImageUrl || "/default_user_profile.png"} 
                      alt="avatar" 
                    />
                  </div>
                  <span className="sidebar-visitors__name">
                    {visitor.userName || "익명"}
                  </span>
                </div>
              ))
            ) : (
            <p className="sidebar-visitors__empty">아직 방문자가 없습니다.</p>
            )
          ) : (
            <p className="sidebar-visitors__empty">추후 업데이트 예정입니다.</p>
          )}
        </div>
      </div>
    </aside>
  );
};

/* 카테고리 섹션 컴포넌트 */
interface CategorySectionProps {
  category: any;
}

const CategorySection: React.FC<CategorySectionProps> = ({ category }) => {
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = category.children && category.children.length > 0;

  const location = useLocation();
  const [searchParams] = useSearchParams();
  const currentTab = searchParams.get('tab');

  const externalLinks: Record<string, string> = {
    '동아리 소개': 'https://app.nimda.kr',
    'NIMDA BOJ': 'https://www.acmicpc.net/group/25046',
    'BOJ': 'https://www.acmicpc.net/group/25046',
    'solved.ac': 'https://solved.ac/',
  };

  const renderCategoryItems = (items: any[]) => {
    return items.map((item) => {
      const itemHasChildren = item.children && item.children.length > 0;
      const isParentActive = location.pathname === `/board/${item.slug}` && !currentTab;
      
      const displayName = item.name === 'BOJ' ? 'NIMDA BOJ' : item.name;
      const extUrl = externalLinks[item.name] || externalLinks[displayName];

      return (
        <React.Fragment key={item.id}>
          <li className={`sidebar-section__item ${isParentActive ? 'sidebar-section__item--active' : ''}`}>
            {extUrl ? (
              <a href={extUrl} target="_blank" rel="noopener noreferrer" className="sidebar-section__link">{displayName}</a>
            ) : (
              <Link to={`/board/${item.slug}`} className="sidebar-section__link">{displayName}</Link>
            )}
          </li>
          {itemHasChildren && item.children.map((child: any) => {
            const isChildActive = location.pathname === `/board/${item.slug}` && currentTab === child.slug;
            const childDisplayName = child.name === 'BOJ' ? 'NIMDA BOJ' : child.name;
            const extChildUrl = externalLinks[child.name] || externalLinks[childDisplayName];
            return (
              <li key={child.id} className={`sidebar-section__item sidebar-section__item--depth ${isChildActive ? 'sidebar-section__item--active' : ''}`} style={{ paddingLeft: '48px' }}>
                {extChildUrl ? (
                  <a href={extChildUrl} target="_blank" rel="noopener noreferrer" className="sidebar-section__link">{childDisplayName}</a>
                ) : (
                  <Link to={`/board/${item.slug}?tab=${child.slug}`} className="sidebar-section__link">{childDisplayName}</Link>
                )}
              </li>
            );
          })}
        </React.Fragment>
      );
    });
  };

  return (
    <div className="sidebar-section">
      <button className="sidebar-section__header" onClick={() => hasChildren ? setIsOpen(!isOpen) : undefined}>
        {hasChildren ? (
          <>
            <span className="sidebar-section__title">{category.name}</span>
            <span className={`sidebar-section__arrow ${isOpen ? "sidebar-section__arrow--open" : ""}`}>
              <ChevronDown />
            </span>
          </>
        ) : (
          <Link to={`/board/${category.slug}`} className="sidebar-section__title sidebar-section__title--link">{category.name}</Link>
        )}
      </button>
      {hasChildren && isOpen && (
        <ul className="sidebar-section__list">{renderCategoryItems(category.children)}</ul>
      )}
    </div>
  );
};

export default Sidebar;