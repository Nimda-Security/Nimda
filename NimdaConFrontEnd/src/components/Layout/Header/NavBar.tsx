import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Logo from "@/components/icons/Logo";
import Logout from "@/components/icons/Logout.svg";
import { getCurrentUsername, isAdmin } from "@/utils/jwt";
import { isLoggedIn, logoutAPI } from "@/api/auth";

interface MenuItem {
  name: string;
  href: string;
}

interface NavbarProps {
  menuItems: MenuItem[];
}

import MobileMenuButton from "@/components/Button/MobileMenuBtn";
import Dropdown from "@/components/Dropdown";
import Right from "./Right";

const Navbar: React.FC<NavbarProps> = ({ menuItems }) => {
  // 모바일 메뉴의 열림/닫힘 상태를 관리하는 state
  const [isOpen, setIsOpen] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [adminStatus, setAdminStatus] = useState(false);
  const [isLoggedInState, setIsLoggedInState] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const dropdownItems: { [key: string]: { name: string; href: string }[] } = {
    대회: [
      { name: "문제", href: "/problems" },
      { name: "채점 현황", href: "/judging-status" },
      { name: "대회 지난 대회", href: "/past-contests" },
      { name: "랭킹", href: "/ranking" },
    ],
    바로가기: [
      { name: "NIMDA Github", href: "https://github.com/osam-nimda" },
      { name: "OSAM", href: "https://www.osam.kr/" },
    ],
  };

  useEffect(() => {
    const currentUser = getCurrentUsername();
    const adminCheck = isAdmin();
    const loggedIn = isLoggedIn();
    setUsername(currentUser);
    setAdminStatus(adminCheck);
    setIsLoggedInState(loggedIn);
  }, []);

  // 로그아웃 핸들러
  const handleLogout = () => {
    logoutAPI();
    setUsername(null);
    setAdminStatus(false);
    setIsLoggedInState(false);
    // 로그인 페이지로 리다이렉트
    window.location.href = "/login";
  };

  // 임시 팝업 생성
  const handleMenuClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    itemName: string
  ) => {
    const itemsToShowAlert = [
      "동아리 소개",
      "새 소식",
      "학술 게시판",
      "커뮤니티",
    ];
    if (itemsToShowAlert.includes(itemName)) {
      e.preventDefault();
      alert("준비 중입니다.");
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-[#E0E0E0] bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link to="/">
              <Logo />
            </Link>
          </div>

          {/* 데스크탑 메뉴 - Login 제외하고 가운데 정렬 */}
          <div className="hidden md:block flex-1">
            <div className="flex justify-center items-baseline space-x-4">
              {menuItems
                .filter((item) => item.name !== "Login")
                .map((item) => (
                  <div
                    key={item.name}
                    className="relative"
                    onMouseEnter={() => setActiveDropdown(item.name)}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <a
                      href={item.href}
                      onClick={(e) => handleMenuClick(e, item.name)} // 임시 팝업 생성
                      className="text-black hover:font-semibold hover:text-blue px-3 py-2 rounded-md text-sm font-medium"
                    >
                      {item.name}
                    </a>
                    {activeDropdown === item.name &&
                      dropdownItems[item.name] && (
                        <Dropdown items={dropdownItems[item.name]} />
                      )}
                  </div>
                ))}
            </div>
          </div>

          {/* 오른쪽 영역 - 사용자 정보, 관리자 대시보드, 로그인 */}
          <Right
            isLoggedIn={isLoggedInState}
            username={username}
            adminStatus={adminStatus}
            onLogout={handleLogout}
          />

          {/* 모바일 햄버거 버튼 */}
          <div className="-mr-2 flex md:hidden">
            <MobileMenuButton
              isOpen={isOpen}
              onClick={() => setIsOpen(!isOpen)}
            />
          </div>
        </div>
      </div>

      {/* 4. 모바일 메뉴 (isOpen 상태에 따라 보임/숨김 처리) */}
      {isOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="bg-black px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {/* 로그인한 경우 사용자명 표시 */}
            {isLoggedInState && username && (
              <div className="text-gray-300 px-3 py-2 text-sm">
                <span className="font-semibold">{username}</span>
              </div>
            )}

            {/* 메뉴 아이템들 (Login 제외) */}
            {menuItems
              .filter((item) => item.name !== "Login")
              .map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={(e) => handleMenuClick(e, item.name)} // 임시 팝업 생성
                  className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                >
                  {item.name}
                </a>
              ))}

            {/* 로그인/로그아웃 버튼 */}
            {isLoggedInState ? (
              <button
                onClick={handleLogout}
                className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium w-full text-left"
              >
                Logout
              </button>
            ) : (
              menuItems
                .filter((item) => item.name === "Login")
                .map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                  >
                    {item.name}
                  </a>
                ))
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
