import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Logo from '@/components/icons/Logo';
import { getCurrentNickname, isAdmin } from '@/utils/jwt';
import { isLoggedIn, logoutAPI } from '@/api/auth';
import Logout from '@/components/icons/Logout.svg';

const Navbar: React.FC = () => {
  const [nickname, setNickname] = useState<string | null>(null);
  const [adminStatus, setAdminStatus] = useState(false);
  const [isLoggedInState, setIsLoggedInState] = useState(false);

  useEffect(() => {
    const currentNickname = getCurrentNickname();
    const adminCheck = isAdmin();
    const loggedIn = isLoggedIn();
    setNickname(currentNickname);
    setAdminStatus(adminCheck);
    setIsLoggedInState(loggedIn);
  }, []);

  const handleLogout = () => {
    logoutAPI();
    setNickname(null);
    setAdminStatus(false);
    setIsLoggedInState(false);
    window.location.href = '/login';
  };

  const displayNickname =
    nickname && nickname.length > 8
      ? `${nickname.substring(0, 7)}...`
      : nickname;

  return (
    <nav className="layout__header">
      <div className="layout__header-inner">
        {/* 왼쪽: 로고 */}
        <div style={{ flexShrink: 0 }}>
          <Link to="/">
            <Logo />
          </Link>
        </div>

        {/* 오른쪽: 로그인/회원가입 또는 유저 정보 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {isLoggedInState ? (
            <>
              {displayNickname && (
                <span style={{ fontSize: '14px', fontWeight: 500, color: '#1a1a1a' }}>
                  {displayNickname}
                </span>
              )}
              {adminStatus && (
                <Link
                  to="/admin"
                  style={{ padding: '4px', borderRadius: '6px' }}
                  title="관리자 대시보드"
                >
                  <img
                    src="/nav_setting.png"
                    alt="관리자 설정"
                    style={{ width: '20px', height: '20px' }}
                  />
                </Link>
              )}
              <button
                onClick={handleLogout}
                style={{
                  padding: '4px',
                  borderRadius: '6px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
                title="Logout"
              >
                <img src={Logout} alt="Logout" style={{ width: '20px', height: '20px' }} />
              </button>
            </>
          ) : (
            <>
              <Link
                to="/signup"
                style={{
                  fontSize: '14px',
                  color: '#828282',
                  textDecoration: 'none',
                }}
              >
                회원가입
              </Link>
              <Link
                to="/login"
                style={{
                  fontSize: '14px',
                  color: '#1a1a1a',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                로그인
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
