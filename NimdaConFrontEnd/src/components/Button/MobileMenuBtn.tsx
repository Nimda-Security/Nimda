import React from "react";
import HamburgerIcon from "@/components/icons/HamburgerIcon";
import CloseIcon from "@/components/icons/Close";

interface MobileMenuButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

const MobileMenuButton: React.FC<MobileMenuButtonProps> = ({
  isOpen,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      type="button"
      className="inline-flex items-center justify-center p-2 rounded-md text-black hover:text-white hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
      aria-controls="mobile-menu"
      aria-expanded={isOpen}
    >
      <span className="sr-only">Open main menu</span>
      {!isOpen ? <HamburgerIcon /> : <CloseIcon />}
    </button>
  );
};

export default MobileMenuButton;
