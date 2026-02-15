import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getCurrentNickname } from "@/utils/jwt";
import { isLoggedIn } from "@/api/auth";

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

  useEffect(() => {
    const currentNickname = getCurrentNickname();
    const loggedIn = isLoggedIn();
    setNickname(currentNickname);
    setIsLoggedInState(loggedIn);
  }, []);

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
        <SidebarSection title="새 소식" items={["공지사항", "결산 내역"]} />
        <SidebarSection
          title="학술 게시판"
          items={["멘토멘티", "스터디", "자료실"]}
        />
        <SidebarSection
          title="커뮤니티"
          items={["자유게시판", "사진첩", "구인구직", "카르텔"]}
        />
        <SidebarSection title="대회" items={["대회 목록", "내용"]} />
        <SidebarSection
          title="바로가기"
          items={["NIMDA 랜딩 페이지", "BOJ", "solved.ac"]}
        />
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

/* 사이드바 섹션 컴포넌트 */
interface SidebarSectionProps {
  title: string;
  items: string[];
}

const SidebarSection: React.FC<SidebarSectionProps> = ({ title, items }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="sidebar-section">
      <button
        className="sidebar-section__header"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="sidebar-section__title">{title}</span>
        <span
          className={`sidebar-section__arrow ${
            isOpen ? "sidebar-section__arrow--open" : ""
          }`}
        >
          ▾
        </span>
      </button>
      {isOpen && (
        <ul className="sidebar-section__list">
          {items.map((item) => (
            <li key={item} className="sidebar-section__item">
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Sidebar;
