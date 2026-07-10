import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '@/components/icons/Logo';
import { isAdmin } from '@/utils/jwt';
import {
  isLoggedIn,
  logoutAPI,
  getMyPageInfo,
  validateSession,
  PROFILE_UPDATED_EVENT,
} from '@/api/auth';
import Logout from '@/components/icons/Logout.svg';
import NotificationBell from '@/components/Notification/NotificationBell';
import Avatar from '@/components/Avatar/Avatar';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const [adminStatus, setAdminStatus] = useState(() => isAdmin());
  const [isLoggedInState, setIsLoggedInState] = useState(() => isLoggedIn());
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    const loggedIn = isLoggedIn();

    if (loggedIn) {
      // 서버에 세션 유효성 검증 — 만료 시 로컬 상태만 초기화 (강제 리다이렉트 없음)
      validateSession().then((ok) => {
        if (!ok) {
          setAdminStatus(false);
          setIsLoggedInState(false);
          return;
        }
        getMyPageInfo().then((result) => {
          if (result.success && result.data) {
            setProfileImage(result.data.profileImage ?? null);
          }
        });
      });
    }

    const handleProfileUpdated = (event: Event) => {
      const detail = (event as CustomEvent<Record<string, unknown> | null>).detail;
      const updatedProfileImage = detail?.profileImage;
      setProfileImage(
        typeof updatedProfileImage === 'string' ? updatedProfileImage : null
      );
    };

    window.addEventListener(PROFILE_UPDATED_EVENT, handleProfileUpdated);
    return () => {
      window.removeEventListener(PROFILE_UPDATED_EVENT, handleProfileUpdated);
    };
  }, []);

  const handleLogout = () => {
    logoutAPI();
    setAdminStatus(false);
    setIsLoggedInState(false);
    window.location.href = '/login';
  };

  const handleProfileClick = () => {
    navigate('/mypage');
  };


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
              {/* 알림 */}
              <NotificationBell />

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

              {/* 프로필 이미지 */}
              <button
                onClick={handleProfileClick}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  overflow: 'hidden',
                  boxShadow: '0px 0px 2px rgba(0, 0, 0, 0.25)',
                }}
                title="마이페이지"
              >
                <Avatar
                  src={profileImage}
                  alt="프로필"
                  size="100%"
                  className="w-full h-full border-0"
                />
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
