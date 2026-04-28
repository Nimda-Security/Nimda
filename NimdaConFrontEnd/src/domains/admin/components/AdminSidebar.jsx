import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AdminSidebar = ({ activeSection, activeSubSection, setActiveSection, setActiveSubSection, pendingUsersCount }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavClick = (section, subSection) => {
    if (setActiveSection) setActiveSection(section);
    if (setActiveSubSection) setActiveSubSection(subSection);
  };

  return (
    <aside className="admin__sidebar">
      <div className="admin__sidebar-header">
        <h1 className="admin__sidebar-title">Manage</h1>
      </div>

      <nav className="admin__nav">
        {/* 유저 정보 관리 */}
        <div className="admin__nav-section">
          <button
            onClick={() => handleNavClick('user-info', null)}
            className={`admin__nav-section-title ${activeSection === 'user-info' ? 'admin__nav-section-title--active' : ''}`}
          >
            유저 정보 관리
          </button>
          <div className="admin__nav-subsection">
            <button
              onClick={() => handleNavClick('user-info', 'user-info')}
              className={`admin__nav-item ${activeSection === 'user-info' && activeSubSection === 'user-info' ? 'admin__nav-item--active' : ''}`}
            >
              유저 정보
            </button>
            <button
              onClick={() => handleNavClick('pending', 'pending')}
              className={`admin__nav-item ${activeSection === 'pending' ? 'admin__nav-item--active' : ''}`}
            >
              승인 대기 목록
              {pendingUsersCount > 0 && <span className="admin__badge">{pendingUsersCount}</span>}
            </button>
            <button
              onClick={() => handleNavClick('mileage', null)}
              className={`admin__nav-item ${activeSection === 'mileage' ? 'admin__nav-item--active' : ''}`}
            >
              마일리지 지급
            </button>
          </div>
        </div>

        {/* 프로필 장식 관리 */}
        <div className="admin__nav-section">
          <button
            onClick={() => handleNavClick('profile-decorations', null)}
            className={`admin__nav-section-title ${activeSection === 'profile-decorations' ? 'admin__nav-section-title--active' : ''}`}
          >
            프로필 장식 관리
          </button>
          <div className="admin__nav-subsection">
            <button
              onClick={() => handleNavClick('profile-decorations', 'profile-decorations')}
              className={`admin__nav-item ${activeSection === 'profile-decorations' ? 'admin__nav-item--active' : ''}`}
            >
              배지 등록
            </button>
          </div>
        </div>

        {/* 글 관리 */}
        <div className="admin__nav-section">
          <button
            onClick={() => handleNavClick('posts', null)}
            className={`admin__nav-section-title ${activeSection === 'posts' ? 'admin__nav-section-title--active' : ''}`}
          >
            글 관리
          </button>
          <div className="admin__nav-subsection">
            <button
              onClick={() => handleNavClick('posts', 'posts-edit')}
              className={`admin__nav-item ${activeSection === 'posts' && activeSubSection === 'posts-edit' ? 'admin__nav-item--active' : ''}`}
            >
              포스트 수정/삭제
            </button>
            <button
              onClick={() => handleNavClick('pin-post', 'pin-post')}
              className={`admin__nav-item ${activeSection === 'pin-post' ? 'admin__nav-item--active' : ''}`}
            >
              게시글 고정
            </button>
          </div>
        </div>

        {/* 카테고리 관리 */}
        <div className="admin__nav-section">
          <button
            onClick={() => handleNavClick('category-order', null)}
            className={`admin__nav-section-title ${activeSection === 'category-order' || activeSection === 'category-edit' || activeSection === 'category-deactivate' || activeSection === 'tag-management' ? 'admin__nav-section-title--active' : ''}`}
          >
            카테고리 관리
          </button>
          <div className="admin__nav-subsection">
            <button
              onClick={() => handleNavClick('category-order', 'category-order')}
              className={`admin__nav-item ${activeSection === 'category-order' ? 'admin__nav-item--active' : ''}`}
            >
              순서 설정
            </button>
            <button
              onClick={() => handleNavClick('tag-management', 'tag-management')}
              className={`admin__nav-item ${activeSection === 'tag-management' ? 'admin__nav-item--active' : ''}`}
            >
              태그 관리
            </button>
            <button
              onClick={() => handleNavClick('category-deactivate', 'category-deactivate')}
              className={`admin__nav-item ${activeSection === 'category-deactivate' ? 'admin__nav-item--active' : ''}`}
            >
              카테고리 비활성화
            </button>
          </div>
        </div>
      </nav>
    </aside>
  );
};

export default AdminSidebar;
