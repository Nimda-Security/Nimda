import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getCurrentNickname } from "@/utils/jwt";
import { isLoggedIn } from "@/api/auth";
import { getAllCategoriesAPI } from "@/api/category";
import type { Category } from "@/domains/Board/types";

/* D-Day 더미 데이터 */
const ddayItems = [
  { id: 1, title: "1234567890", date: "26.00.00", dday: "D-31" },
  { id: 2, title: "가나다라마바사아자...", date: "26.02.12", dday: "D-9" },
  { id: 3, title: "ABCDEFG", date: "26.02.04", dday: "D-2" },
];

/* 오늘 방문자 더미 데이터 */
const visitors = [
  { id: 1, nickname: "닉네임", color: "#f06292" },
  { id: 2, nickname: "최대길이6자", color: "#ba68c8" },
  { id: 3, nickname: "가나다라마바", color: "#4fc3f7" },
  { id: 4, nickname: "개강하기싫다", color: "#81c784" },
  { id: 5, nickname: "왜6자까지냐", color: "#ffb74d" },
  { id: 6, nickname: "디자인편해서", color: "#a1887f" },
];

const Sidebar: React.FC = () => {
  const [nickname, setNickname] = useState<string | null>(null);
  const [isLoggedInState, setIsLoggedInState] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  // 카테고리를 트리 구조로 변환
  type CategoryWithChildren = Category & { children: CategoryWithChildren[] };

  const buildCategoryTree = (categories: Category[]): CategoryWithChildren[] => {
    const categoryMap = new Map<number, CategoryWithChildren>();
    const rootCategories: CategoryWithChildren[] = [];

    // 모든 카테고리를 맵에 추가
    categories.forEach(cat => {
      categoryMap.set(cat.id, { ...cat, children: [] });
    });

    // 부모-자식 관계 구성
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

    // sortOrder로 정렬
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
            width="52"
            height="56"
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
            {/* 로그인 상태: 통계 표시 */}
          </div>
        ) : (
          <>
            <p className="sidebar-profile__desc">
              로그인하고 내 프로필을 만들어 보세요
            </p>
            <Link to="/login" className="sidebar-profile__login-btn">
              로그인
            </Link>
            <Link to="/signup" className="sidebar-profile__signup-link">
              회원가입
            </Link>
          </>
        )}
      </div>

      {/* 구분선 */}
      <div className="sidebar-divider" />

      {/* 네비게이션 메뉴 */}
      <nav className="sidebar-nav">
        {categoriesLoading ? (
          <div style={{ padding: '16px', textAlign: 'center', color: '#999', fontSize: '14px' }}>
            카테고리 로딩 중...
          </div>
        ) : categoryTree.length > 0 ? (
          categoryTree.map((category) => (
            <CategorySection key={category.id} category={category} />
          ))
        ) : (
          <div style={{ padding: '16px', textAlign: 'center', color: '#999', fontSize: '14px' }}>
            카테고리가 없습니다.
          </div>
        )}
      </nav>

      {/* 구분선 */}
      <div className="sidebar-divider" />

      {/* D-DAY 섹션 */}
      <div className="sidebar-dday">
        <div className="sidebar-dday__header">
          <div className="sidebar-dday__year-month">
            <span className="sidebar-dday__year">2026</span>
            <span className="sidebar-dday__month">02</span>
          </div>
          <div className="sidebar-dday__list">
            {ddayItems.map((item) => (
              <div key={item.id} className="sidebar-dday__item">
                <div className="sidebar-dday__item-left">
                  <div className="sidebar-dday__item-dot" />
                  <div>
                    <p className="sidebar-dday__item-title">{item.title}</p>
                    <p className="sidebar-dday__item-date">{item.date}</p>
                  </div>
                </div>
                <span className="sidebar-dday__item-dday">{item.dday}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 구분선 */}
      <div className="sidebar-divider" />

      {/* 오늘 방문자 섹션 */}
      <div className="sidebar-visitors">
        <h3 className="sidebar-visitors__title">오늘 방문자</h3>
        <div className="sidebar-visitors__grid">
          {visitors.map((visitor) => (
            <div key={visitor.id} className="sidebar-visitors__item">
              <div
                className="sidebar-visitors__avatar"
                style={{ backgroundColor: visitor.color }}
              />
              <span className="sidebar-visitors__name">
                {visitor.nickname}
              </span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};

/* 카테고리 섹션 컴포넌트 */
type CategoryWithChildren = Category & { children: CategoryWithChildren[] };

interface CategorySectionProps {
  category: CategoryWithChildren;
}

const CategorySection: React.FC<CategorySectionProps> = ({ category }) => {
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = category.children && category.children.length > 0;

  // 하위 카테고리 아이템 렌더링 (3단 카테고리는 부모 페이지의 탭으로 이동)
  const renderCategoryItems = (items: CategoryWithChildren[]) => {
    return items.map((item) => {
      const itemHasChildren = item.children && item.children.length > 0;

      return (
        <React.Fragment key={item.id}>
          <li className="sidebar-section__item">
            <Link to={`/board/${item.slug}`} className="sidebar-section__link">
              {item.name}
            </Link>
          </li>
          {/* 3단 카테고리: 부모(2단) 페이지로 이동하면서 해당 탭 선택 */}
          {itemHasChildren && item.children.map((child) => (
            <li
              key={child.id}
              className="sidebar-section__item sidebar-section__item--depth"
              style={{ paddingLeft: '48px' }}
            >
              <Link to={`/board/${item.slug}?tab=${child.slug}`} className="sidebar-section__link">
                {child.name}
              </Link>
            </li>
          ))}
        </React.Fragment>
      );
    });
  };

  return (
    <div className="sidebar-section">
      <button
        className="sidebar-section__header"
        onClick={() => hasChildren ? setIsOpen(!isOpen) : undefined}
      >
        {hasChildren ? (
          <>
            <span className="sidebar-section__title">{category.name}</span>
            <span
              className={`sidebar-section__arrow ${isOpen ? "sidebar-section__arrow--open" : ""}`}
            >
              ▾
            </span>
          </>
        ) : (
          <Link to={`/board/${category.slug}`} className="sidebar-section__title sidebar-section__title--link">
            {category.name}
          </Link>
        )}
      </button>
      {hasChildren && isOpen && (
        <ul className="sidebar-section__list">
          {renderCategoryItems(category.children)}
        </ul>
      )}
    </div>
  );
};

export default Sidebar;
