import React from 'react';
import Logout from '@/components/icons/Logout.svg';

interface RightProps {
  username: string | null;
  adminStatus: boolean;
  isLoggedIn: boolean;
  onLogout: () => void;
}

const Right: React.FC<RightProps> = ({
  username,
  adminStatus,
  isLoggedIn,
  onLogout,
}) => {
  return (
    <div className="hidden min-[820px]:flex items-center space-x-4">
      {isLoggedIn ? (
        <>
          {username && (
            <div className="text-sm text-gray-600">
              <span className="font-semibold">{username}</span>
            </div>
          )}

          {adminStatus && (
            <a
              href="/admin"
              className="p-2 rounded-md hover:bg-gray-100 transition-colors duration-200"
              title="관리자 대시보드"
            >
              <img
                src="/nav_setting.png"
                alt="관리자 설정"
                className="w-5 h-5"
              />
            </a>
          )}

          <button
            onClick={onLogout}
            className="p-1 rounded-md hover:bg-gray-100 transition-colors duration-200"
            title="Logout"
          >
            <img src={Logout} alt="Logout" className="w-5 h-5" />
          </button>
        </>
      ) : (
        <a
          href="/login"
          className="text-black hover:font-semibold hover:text-blue px-3 py-2 rounded-md text-sm font-medium"
        >
          Login
        </a>
      )}
    </div>
  );
};

export default Right;
