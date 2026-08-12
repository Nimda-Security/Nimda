import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '@/components/icons/Logo';
import {
  logoutAPI,
  getMyPageInfo,
  validateSession,
  PROFILE_UPDATED_EVENT,
} from '@/api/auth';
import Logout from '@/components/icons/Logout.svg';
import NotificationBell from '@/components/Notification/NotificationBell';
import Avatar from '@/components/Avatar/Avatar';

type AuthStatus = 'unknown' | 'loading' | 'authenticated' | 'anonymous';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const [authStatus, setAuthStatus] = useState<AuthStatus>('unknown');
  const [adminStatus, setAdminStatus] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadAuthState = async () => {
      setAuthStatus('loading');
      try {
        const session = await validateSession();
        if (session.status !== 'authenticated') {
          if (!cancelled) {
            setAdminStatus(false);
            setProfileImage(null);
            setAuthStatus('anonymous');
          }
          return;
        }

        const result = await getMyPageInfo();
        if (!result.success || !result.data) {
          if (!cancelled) {
            setAdminStatus(false);
            setProfileImage(null);
            setAuthStatus('anonymous');
          }
          return;
        }

        if (!cancelled) {
          setProfileImage(result.data.profileImage ?? null);
          setAdminStatus(session.roles.includes('ROLE_ADMIN'));
          setAuthStatus('authenticated');
        }
      } catch {
        if (!cancelled) {
          setAdminStatus(false);
          setProfileImage(null);
          setAuthStatus('anonymous');
        }
      }
    };

    void loadAuthState();

    const handleProfileUpdated = (event: Event) => {
      const detail = (event as CustomEvent<Record<string, unknown> | null>).detail;
      const updatedProfileImage = detail?.profileImage;
      setProfileImage(
        typeof updatedProfileImage === 'string' ? updatedProfileImage : null
      );
    };

    window.addEventListener(PROFILE_UPDATED_EVENT, handleProfileUpdated);
    return () => {
      cancelled = true;
      window.removeEventListener(PROFILE_UPDATED_EVENT, handleProfileUpdated);
    };
  }, []);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    setAuthStatus('loading');
    setAdminStatus(false);
    setProfileImage(null);

    try {
      const serverLogoutSucceeded = await logoutAPI();
      if (!serverLogoutSucceeded) {
        alert('서버 로그아웃을 확인하지 못했습니다. 다시 로그인하기 전에 네트워크를 확인해주세요.');
      }
    } finally {
      window.location.assign('/login');
    }
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
          {authStatus === 'authenticated' ? (
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
                disabled={isLoggingOut}
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
          ) : authStatus === 'anonymous' ? (
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
          ) : null}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
