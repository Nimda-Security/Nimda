import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '@/components/icons/Logo';
import { getCurrentNickname, isAdmin } from '@/utils/jwt';
import { isLoggedIn, logoutAPI } from '@/api/auth';
import Logout from '@/components/icons/Logout.svg';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
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

  const handleProfileClick = () => {
    navigate('/mypage');
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
              {/* 알림 아이콘 (미구현) */}
              <button
                style={{
                  padding: '8px',
                  borderRadius: '50%',
                  background: 'rgba(0, 0, 0, 0.05)',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                disabled
                title="알림 (준비중)"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </button>

              {/* 관리자 설정 아이콘 */}
              {adminStatus && (
                <Link
                  to="/admin"
                  style={{ padding: '8px', borderRadius: '6px' }}
                  title="관리자 대시보드"
                >
                  <img
                    src="/nav_setting.png"
                    alt="관리자 설정"
                    style={{ width: '20px', height: '20px' }}
                  />
                </Link>
              )}

              {/* 프로필: 검정색 원 */}
              <button
                onClick={handleProfileClick}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#0c0c0c',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0px 0px 2px rgba(0, 0, 0, 0.25)',
                }}
                title="마이페이지"
              >
                <span style={{ color: 'white', fontSize: '14px', fontWeight: 'bold' }}>
                  {displayNickname ? displayNickname[0].toUpperCase() : 'U'}
                </span>
              </button>

              {/* 로그아웃 버튼 */}
              <button
                onClick={handleLogout}
                style={{
                  padding: '8px',
                  borderRadius: '6px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title="로그아웃"
              >
                <img src={Logout} alt="로그아웃" style={{ width: '20px', height: '20px' }} />
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
