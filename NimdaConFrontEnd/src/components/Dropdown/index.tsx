import React from 'react';
import { Link } from 'react-router-dom';

interface DropdownItem {
  name: string;
  href: string;
}

interface DropdownProps {
  items: DropdownItem[];
}

const Dropdown: React.FC<DropdownProps> = ({ items }) => {
  return (
    <div className="absolute mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
      <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
        {items.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            role="menuitem"
          >
            {item.name}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Dropdown;
