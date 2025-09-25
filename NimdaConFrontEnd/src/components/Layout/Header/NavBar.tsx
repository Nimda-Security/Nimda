import React, { useState } from "react";
import Logo from "@/components/icons/Logo";

interface MenuItem {
  name: string;
  href: string;
}

interface NavbarProps {
  menuItems: MenuItem[];
}

import MobileMenuButton from "@/components/Button/MobileMenuBtn";

const Navbar: React.FC<NavbarProps> = ({ menuItems }) => {
  // 모바일 메뉴의 열림/닫힘 상태를 관리하는 state
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-[#E0E0E0] bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Logo />
          </div>

          {/* 데스크탑 메뉴 */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {menuItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-black hover:font-semibold hover:text-blue px-3 py-2 rounded-md text-sm font-medium"
                >
                  {item.name}
                </a>
              ))}
            </div>
          </div>

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
            {menuItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
              >
                {item.name}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
