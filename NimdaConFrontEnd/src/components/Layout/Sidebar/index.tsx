import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getCurrentNickname } from "@/utils/jwt";
import { isLoggedIn } from "@/api/auth";
import { getAllCategoriesAPI } from "@/api/category";
import { getMyTotalAttendanceCount, getTodayVisitors, type AttendanceLog } from "@/api/attendance";
import { getMyBoardCountAPI } from "@/api/board";
import { getMyCommentCountAPI } from "@/api/comment";
import { getPushedBoardLikesCount } from "@/api/boardLike";
import { getUserBalance } from "@/api/point";
import type { Category } from "@/domains/Board/types";



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
  const [activeVisitorTab, setActiveVisitorTab] = useState<'today' | 'monthly'>('today');

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
                <svg width="12" height="12" viewBox="0 0 13 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6.5 0C2.91 0 0 2.91 0 6.5C0 10.09 2.91 13 6.5 13C10.09 13 13 10.09 13 6.5C13 2.91 10.09 0 6.5 0ZM6.5 11.5C4.29 11.5 2.5 9.71 2.5 7.5C2.5 5.29 4.29 3.5 6.5 3.5C8.71 3.5 10.5 5.29 10.5 7.5C10.5 9.71 8.71 11.5 6.5 11.5Z" fill="#0C0C0C" />
                </svg>
              </div>
              <span className="sidebar-profile__stat-label">방문</span>
              <span className="sidebar-profile__stat-value"><strong>{visitCount}</strong> 회</span>
            </div>
            <div className="sidebar-profile__stat-item">
              <div className="sidebar-profile__stat-icon">
                <svg width="12" height="12" viewBox="0 0 13 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 0H13V14H0V0Z" fill="#0C0C0C" />
                </svg>
              </div>
              <span className="sidebar-profile__stat-label">작성 게시글</span>
              <span className="sidebar-profile__stat-value"><strong>{boardCount}</strong> 개</span>
            </div>
            <div className="sidebar-profile__stat-item">
              <div className="sidebar-profile__stat-icon">
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 0C3.13 0 0 3.13 0 7C0 10.87 3.13 14 7 14C10.87 14 14 10.87 14 7C14 3.13 10.87 0 7 0ZM7 12C4.24 12 2 9.76 2 7C2 4.24 4.24 2 7 2C9.76 2 12 4.24 12 7C12 9.76 9.76 12 7 12Z" fill="#0C0C0C" />
                </svg>
              </div>
              <span className="sidebar-profile__stat-label">작성 댓글</span>
              <span className="sidebar-profile__stat-value"><strong>{commentCount}</strong> 개</span>
            </div>
            <div className="sidebar-profile__stat-item">
              <div className="sidebar-profile__stat-icon">
                <svg width="12" height="12" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 14L6.5 12.5C2.5 8.5 0 6.5 0 4C0 1.5 2 0 4 0C5.5 0 6.5 0.5 8 2C9.5 0.5 10.5 0 12 0C14 0 16 1.5 16 4C16 6.5 13.5 8.5 9.5 12.5L8 14Z" fill="#0C0C0C" />
                </svg>
              </div>
              <span className="sidebar-profile__stat-label">누른 좋아요</span>
              <span className="sidebar-profile__stat-value"><strong>{likeCount}</strong> 개</span>
            </div>
            <div className="sidebar-profile__stat-item">
              <div className="sidebar-profile__stat-icon">
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 0C3.13 0 0 3.13 0 7C0 10.87 3.13 14 7 14C10.87 14 14 10.87 14 7C14 3.13 10.87 0 7 0ZM7 12C4.24 12 2 9.76 2 7C2 4.24 4.24 2 7 2C9.76 2 12 4.24 12 7C12 9.76 9.76 12 7 12Z" fill="#0C0C0C" />
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
        ) : categoryTree.length > 0 ? (
          categoryTree.map((category) => (
            <CategorySection key={category.id} category={category} />
          ))
        ) : (
          <div style={{ padding: '16px', textAlign: 'center', color: '#999', fontSize: '14px' }}>카테고리가 없습니다.</div>
        )}
      </nav>



      {/* 오늘 방문자 섹션 - 탭 UI 포함 */}
      <div className="sidebar-visitors">
        {/* 오늘 방문자 / 월간랭킹 탭 */}
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
            className={`sidebar-visitors__tab${activeVisitorTab === 'monthly' ? ' sidebar-visitors__tab--active' : ''}`}
            onClick={() => setActiveVisitorTab('monthly')}
          >
            월간랭킹
          </button>
        </div>
        {/* 방문자 목록 */}
        <div className="sidebar-visitors__list">
          {todayVisitors.length > 0 ? (
            todayVisitors.map((visitor) => (
              <div key={visitor.id} className="sidebar-visitors__item">
                <div
                  className="sidebar-visitors__avatar"
                  style={{ backgroundColor: "var(--color-gray-200)" }}
                />
                <span className="sidebar-visitors__name">
                  {visitor.userName || "익명"}
                </span>
              </div>
            ))
          ) : (
            <p style={{ fontSize: '12px', color: '#999', padding: '8px 0', textAlign: 'center' }}>
              아직 방문자가 없습니다.
            </p>
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

  const renderCategoryItems = (items: any[]) => {
    return items.map((item) => {
      const itemHasChildren = item.children && item.children.length > 0;
      return (
        <React.Fragment key={item.id}>
          <li className="sidebar-section__item">
            <Link to={`/board/${item.slug}`} className="sidebar-section__link">{item.name}</Link>
          </li>
          {itemHasChildren && item.children.map((child: any) => (
            <li key={child.id} className="sidebar-section__item sidebar-section__item--depth" style={{ paddingLeft: '48px' }}>
              <Link to={`/board/${item.slug}?tab=${child.slug}`} className="sidebar-section__link">{child.name}</Link>
            </li>
          ))}
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
            <span className={`sidebar-section__arrow ${isOpen ? "sidebar-section__arrow--open" : ""}`}>▾</span>
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