import React from 'react';
import BrandSection from './NavBar/BrandSection';
import UserActions from './NavBar/UserActions';

const NavBar: React.FC = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-[#E0E0E0] bg-white">
      <div className="h-full px-4 xl:px-6 max-w-7xl mx-auto flex items-center justify-between">
        <BrandSection />
        <UserActions />
      </div>
    </nav>
  );
};

export default NavBar;
