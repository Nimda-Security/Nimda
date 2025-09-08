import React from 'react';
import BrandSection from './NavBar/BrandSection';
import UserActions from './NavBar/UserActions';

const NavBar: React.FC = () => {
  return (
    <nav className="h-16 border-b border-[#E0E0E0]">
      <div className="h-full px-4 flex items-center justify-between">
        <BrandSection />
        <UserActions />
      </div>
    </nav>
  );
};

export default NavBar;
