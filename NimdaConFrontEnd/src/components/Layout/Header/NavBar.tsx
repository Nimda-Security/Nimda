import React from "react";
import Logo from "@/components/icons/Logo";
import Right from "./UserName";

const NavBar: React.FC = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-[#E0E0E0] bg-white">
      <div className="h-full w-3/4 px-4 xl:px-6 mx-auto flex items-center justify-between">
        <Logo />
        <Right />
      </div>
    </nav>
  );
};

export default NavBar;
