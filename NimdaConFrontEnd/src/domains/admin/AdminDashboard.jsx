import React, { useState, useEffect } from 'react';
import NavBar from '@/components/Layout/Header/NavBar';
import Footer from '@/components/Layout/Footer';
import { useNavigate } from 'react-router-dom';
import { getAllUsersAPI, getPendingUsersAPI, approveUserAPI, rejectUserAPI } from '@/api/admin/admin';
import { getBoardListAPI, deleteBoardAPI } from '@/api/board';
import { getAllCategoriesAdminAPI, updateCategoryAPI } from '@/api/category';
import './AdminDashboard.css';

function AdminDashboard() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('category-order');
  const [activeSubSection, setActiveSubSection] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [pendingUsersLoading, setPendingUsersLoading] = useState(false);
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const goBack = () => {
    navigate('/');
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const result = await getAllUsersAPI();
      if (result.success) {
        setUsers(result.users || []);
      } else {
        alert('사용자 목록을 불러오는데 실패했습니다: ' + result.message);
      }
    } catch (error) {
      console.error('사용자 목록 로드 오류:', error);
      alert('사용자 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const loadPosts = async () => {
    setPostsLoading(true);
    try {
      const result = await getBoardListAPI({ slug: 'news', page: 0, size: 20 });
      if (result.success) {
        setPosts(result.posts || []);
      } else {
        alert('게시글 목록을 불러오는데 실패했습니다: ' + result.message);
      }
    } catch (error) {
      console.error('게시글 목록 로드 오류:', error);
      alert('게시글 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setPostsLoading(false);
    }
  };

  const loadPendingUsers = async () => {
    setPendingUsersLoading(true);
    try {
      const result = await getPendingUsersAPI();
      if (result.success) {
        setPendingUsers(result.users || []);
      } else {
        alert('승인 대기 사용자 목록을 불러오는데 실패했습니다: ' + result.message);
      }
    } catch (error) {
      console.error('승인 대기 사용자 목록 로드 오류:', error);
      alert('승인 대기 사용자 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setPendingUsersLoading(false);
    }
  };

  const loadCategories = async () => {
    setCategoriesLoading(true);
    try {
      const allCategories = await getAllCategoriesAdminAPI();
      setCategories(allCategories);
    } catch (error) {
      console.error('카테고리 목록 로드 오류:', error);
      alert('카테고리 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setCategoriesLoading(false);
    }
  };

  const handleApproveUser = async (userId) => {
    if (!confirm('이 사용자를 승인하시겠습니까?')) return;
    try {
      const result = await approveUserAPI(userId);
      if (result.success) {
        alert('사용자가 승인되었습니다.');
        loadPendingUsers();
        loadUsers();
      } else {
        alert(result.message || '사용자 승인에 실패했습니다.');
      }
    } catch (error) {
      console.error('사용자 승인 오류:', error);
      alert('사용자 승인 중 오류가 발생했습니다.');
    }
  };

  const handleRejectUser = async (userId) => {
    if (!confirm('이 사용자의 승인을 거부하시겠습니까?')) return;
    try {
      const result = await rejectUserAPI(userId);
      if (result.success) {
        alert('사용자 승인이 거부되었습니다.');
        loadPendingUsers();
        loadUsers();
      } else {
        alert(result.message || '사용자 거부에 실패했습니다.');
      }
    } catch (error) {
      console.error('사용자 거부 오류:', error);
      alert('사용자 거부 중 오류가 발생했습니다.');
    }
  };

  const handleDeletePost = async (postId) => {
    if (!confirm('정말 이 게시글을 삭제하시겠습니까?')) return;
    try {
      const result = await deleteBoardAPI(postId);
      if (result.success) {
        alert('게시글이 삭제되었습니다.');
        loadPosts();
      } else {
        alert(result.message || '게시글 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('게시글 삭제 오류:', error);
      alert('게시글 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleEditPost = (post) => {
    const slug = post.category?.slug || 'news';
    navigate(`/board/${slug}/edit/${post.id}`);
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('파일 크기는 10MB 이하여야 합니다.');
      return;
    }

    setUploadingImage(true);
    try {
      const token = localStorage.getItem('token');

      const presignedResponse = await fetch(`/api/users/me/profile-image/presigned-url`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type
        })
      });

      const presignedResult = await presignedResponse.json();

      if (!presignedResponse.ok || !presignedResult.success) {
        alert(presignedResult.message || 'Presigned URL 생성에 실패했습니다.');
        return;
      }

      const s3UploadResponse = await fetch(presignedResult.presignedUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type
        },
        body: file
      });

      if (!s3UploadResponse.ok) {
        alert('S3 업로드에 실패했습니다.');
        return;
      }

      const dbUpdateResponse = await fetch(`/api/users/me/profile-image`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          imageUrl: presignedResult.imageUrl
        })
      });

      const dbUpdateResult = await dbUpdateResponse.json();

      if (dbUpdateResponse.ok && dbUpdateResult.success) {
        setSelectedUser({ ...selectedUser, profileImage: dbUpdateResult.profileImage });
        setUsers(users.map(u => u.id === selectedUser.id ? { ...u, profileImage: dbUpdateResult.profileImage } : u));
        alert('프로필 이미지가 업데이트되었습니다.');
      } else {
        alert(dbUpdateResult.message || '프로필 이미지 업데이트에 실패했습니다.');
      }
    } catch (error) {
      console.error('이미지 업로드 오류:', error);
      alert('이미지 업로드 중 오류가 발생했습니다.');
    } finally {
      setUploadingImage(false);
      event.target.value = '';
    }
  };

  // 카테고리를 트리 구조로 변환
  const buildCategoryTree = (categories) => {
    const categoryMap = new Map();
    const rootCategories = [];

    // 모든 카테고리를 맵에 추가
    categories.forEach(cat => {
      categoryMap.set(cat.id, { ...cat, children: [] });
    });

    // 부모-자식 관계 구성
    categories.forEach(cat => {
      const category = categoryMap.get(cat.id);
      if (cat.parentId && categoryMap.has(cat.parentId)) {
        const parent = categoryMap.get(cat.parentId);
        if (parent && category) {
          parent.children = parent.children || [];
          parent.children.push(category);
        }
      } else {
        if (category) {
          rootCategories.push(category);
        }
      }
    });

    return rootCategories;
  };

  const categoryTree = buildCategoryTree(categories);

  // 카테고리 렌더링 (재귀)
  const renderCategoryItem = (category, level = 0) => {
    const indent = level * 39; // Figma 디자인에 맞는 들여쓰기
    const isParent = category.children && category.children.length > 0;
    const itemClass = level === 0
      ? 'admin__category-item admin__category-item--parent'
      : 'admin__category-item admin__category-item--child';

    return (
      <div key={category.id}>
        <div
          className={itemClass}
          style={{ marginLeft: `${indent}px` }}
        >
          {category.name}
        </div>
        {isParent && category.children?.map(child => renderCategoryItem(child, level + 1))}
      </div>
    );
  };

  useEffect(() => {
    if (activeSection === 'pending') {
      loadPendingUsers();
    } else if (activeSection === 'category-order' || activeSection === 'category-deactivate') {
      loadCategories();
    } else if (activeSection === 'posts') {
      loadPosts();
    } else if (activeSection === 'user-info') {
      loadUsers();
    }
  }, [activeSection]);

  const getUserRoles = (user) => {
    if (!user.authorities || user.authorities.length === 0) return [];
    return user.authorities.map(auth => auth.authorityName || auth);
  };

  const hasRole = (user, role) => {
    return getUserRoles(user).some(r => r.includes(role));
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'user-info':
        return (
          <div>
            <div className="admin__header-row">
              <h2 className="admin__section-title">유저 정보</h2>
              <button onClick={loadUsers} disabled={loading} className="admin__btn">
                {loading ? '로딩 중' : '새로고침'}
              </button>
            </div>

            {users.length > 0 ? (
              <div className="admin__table-wrap">
                <table className="admin__table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>사용자명</th>
                      <th>이메일</th>
                      <th>가입일</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedUser(user)}>
                        <td>{user.id}</td>
                        <td style={{ textAlign: 'left' }}>
                          <span>{user.nickname || user.userId}</span>
                          {hasRole(user, 'ADMIN') && (
                            <span className="admin__role admin__role--admin" style={{ marginLeft: 8 }}>ADMIN</span>
                          )}
                          {hasRole(user, 'USER') && (
                            <span className="admin__role admin__role--user" style={{ marginLeft: 8 }}>USER</span>
                          )}
                        </td>
                        <td>{user.email}</td>
                        <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="admin__empty">
                <p style={{ marginBottom: 16 }}>사용자 목록이 비어있습니다.</p>
                <button onClick={loadUsers} className="admin__btn">불러오기</button>
              </div>
            )}

            {selectedUser && (
              <div className="admin__modal-overlay" onClick={() => setSelectedUser(null)}>
                <div className="admin__modal" onClick={(e) => e.stopPropagation()}>
                  <div className="admin__modal-header">
                    <h3>사용자 정보</h3>
                    <button className="admin__modal-close" onClick={() => setSelectedUser(null)}>✕</button>
                  </div>

                  <div style={{ padding: '20px', borderBottom: '1px solid #e0e0e0', textAlign: 'center' }}>
                    <div style={{ marginBottom: '12px' }}>
                      {selectedUser.profileImage ? (
                        <img
                          src={selectedUser.profileImage}
                          alt="프로필"
                          style={{
                            width: '120px',
                            height: '120px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '2px solid #e0e0e0'
                          }}
                        />
                      ) : (
                        <div style={{
                          width: '120px',
                          height: '120px',
                          borderRadius: '50%',
                          backgroundColor: '#f0f0f0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto',
                          border: '2px solid #e0e0e0',
                          fontSize: '48px',
                          color: '#999'
                        }}>
                          👤
                        </div>
                      )}
                    </div>
                    <div>
                      <input
                        type="file"
                        id="profile-image-input"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                      />
                      <button
                        className="admin__btn"
                        disabled={uploadingImage}
                        onClick={() => document.getElementById('profile-image-input').click()}
                        style={{ cursor: uploadingImage ? 'not-allowed' : 'pointer' }}
                      >
                        {uploadingImage ? '업로드 중...' : '사진 추가'}
                      </button>
                    </div>
                  </div>

                  <div className="admin__modal-grid">
                    <div><p className="admin__modal-label">ID</p><p className="admin__modal-value">{selectedUser.id}</p></div>
                    <div><p className="admin__modal-label">사용자 ID</p><p className="admin__modal-value">{selectedUser.userId}</p></div>
                    <div><p className="admin__modal-label">실명</p><p className="admin__modal-value">{selectedUser.name || '-'}</p></div>
                    <div><p className="admin__modal-label">닉네임</p><p className="admin__modal-value">{selectedUser.nickname || '-'}</p></div>
                    <div><p className="admin__modal-label">이메일</p><p className="admin__modal-value">{selectedUser.email || '-'}</p></div>
                    <div><p className="admin__modal-label">학번</p><p className="admin__modal-value">{selectedUser.studentNum || '-'}</p></div>
                    <div><p className="admin__modal-label">휴대폰 번호</p><p className="admin__modal-value">{selectedUser.phoneNum || '-'}</p></div>
                    <div><p className="admin__modal-label">학과</p><p className="admin__modal-value">{selectedUser.major || '-'}</p></div>
                    <div><p className="admin__modal-label">대학교</p><p className="admin__modal-value">{selectedUser.universityName || '-'}</p></div>
                    <div><p className="admin__modal-label">학년</p><p className="admin__modal-value">{selectedUser.grade || '-'}</p></div>
                    <div><p className="admin__modal-label">생년월일</p><p className="admin__modal-value">{selectedUser.birth || '-'}</p></div>
                    <div><p className="admin__modal-label">상태</p><p className="admin__modal-value">{selectedUser.status || '-'}</p></div>
                    <div><p className="admin__modal-label">가입일</p><p className="admin__modal-value">{selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString() : '-'}</p></div>
                    <div><p className="admin__modal-label">수정일</p><p className="admin__modal-value">{selectedUser.updatedAt ? new Date(selectedUser.updatedAt).toLocaleString() : '-'}</p></div>
                    <div>
                      <p className="admin__modal-label">권한</p>
                      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                        {getUserRoles(selectedUser).map((role, idx) => (
                          <span key={idx} className={`admin__role ${role.includes('ADMIN') ? 'admin__role--admin' : 'admin__role--user'}`}>
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'pending':
        return (
          <div>
            <div className="admin__header-row">
              <h2 className="admin__section-title">승인 대기 목록</h2>
              <button onClick={loadPendingUsers} disabled={pendingUsersLoading} className="admin__btn">
                {pendingUsersLoading ? '로딩 중' : '새로고침'}
              </button>
            </div>

            {pendingUsersLoading ? (
              <div className="admin__empty">로딩 중...</div>
            ) : pendingUsers.length > 0 ? (
              <div className="admin__table-wrap">
                <table className="admin__table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>닉네임</th>
                      <th>사용자 ID</th>
                      <th>이메일</th>
                      <th>신청일</th>
                      <th>작업</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingUsers.map((user) => (
                      <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>{user.nickname || user.userId}</td>
                        <td>{user.userId}</td>
                        <td>{user.email}</td>
                        <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}</td>
                        <td>
                          <div className="admin__actions">
                            <button onClick={() => handleApproveUser(user.id)} className="admin__btn--approve">승인</button>
                            <button onClick={() => handleRejectUser(user.id)} className="admin__btn--reject">거부</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="admin__empty">승인 대기 중인 사용자가 없습니다.</div>
            )}
          </div>
        );

      case 'posts':
        return (
          <div>
            <div className="admin__header-row">
              <h2 className="admin__section-title">포스트 수정/삭제</h2>
              <button onClick={loadPosts} disabled={postsLoading} className="admin__btn">
                {postsLoading ? '로딩 중' : '새로고침'}
              </button>
            </div>

            {posts.length > 0 ? (
              <div className="admin__table-wrap">
                <table className="admin__table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>제목</th>
                      <th>작성자</th>
                      <th>게시판 타입</th>
                      <th>작성일</th>
                      <th>작업</th>
                    </tr>
                  </thead>
                  <tbody>
                    {posts.map((post) => (
                      <tr key={post.id}>
                        <td>{post.id}</td>
                        <td style={{ textAlign: 'left' }}>{post.title}</td>
                        <td>{post.author?.nickname || '-'}</td>
                        <td>{post.category?.name || '-'}</td>
                        <td>{post.createdAt ? new Date(post.createdAt).toLocaleDateString() : '-'}</td>
                        <td>
                          <div className="admin__actions">
                            <button onClick={(e) => { e.stopPropagation(); handleEditPost(post); }} className="admin__btn--edit">수정</button>
                            <button onClick={(e) => { e.stopPropagation(); handleDeletePost(post.id); }} className="admin__btn--reject">삭제</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="admin__empty">
                <p style={{ marginBottom: 16 }}>게시글이 없습니다.</p>
                <button onClick={loadPosts} className="admin__btn">불러오기</button>
              </div>
            )}
          </div>
        );

      case 'category-order':
        return (
          <div>
            <h2 className="admin__section-title">순서 설정</h2>
            <div className="admin__category-list">
              {categoriesLoading ? (
                <div className="admin__empty">로딩 중...</div>
              ) : categoryTree.length > 0 ? (
                <div>
                  {categoryTree.map(category => renderCategoryItem(category, 0))}
                </div>
              ) : (
                <div className="admin__empty">
                  <p style={{ marginBottom: 16 }}>카테고리가 없습니다.</p>
                  <button onClick={loadCategories} className="admin__btn">불러오기</button>
                </div>
              )}
            </div>
          </div>
        );

      case 'category-deactivate':
        return (
          <div>
            <h2 className="admin__section-title">카테고리 비활성화</h2>
            <div className="admin__empty">구현 예정</div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="layout">
      <NavBar />
      <div className="layout__body">
        <div className="admin">
          {/* Sidebar - Figma 디자인에 맞게 수정 */}
          <aside className="admin__sidebar">
            <div className="admin__sidebar-header">
              <h1 className="admin__sidebar-title">Manage</h1>
            </div>

            <nav className="admin__nav">
              {/* 유저 정보 관리 */}
              <div className="admin__nav-section">
                <button
                  onClick={() => {
                    setActiveSection('user-info');
                    setActiveSubSection(null);
                  }}
                  className={`admin__nav-section-title ${activeSection === 'user-info' ? 'admin__nav-section-title--active' : ''}`}
                >
                  유저 정보 관리
                </button>
                <div className="admin__nav-subsection">
                  <button
                    onClick={() => {
                      setActiveSection('user-info');
                      setActiveSubSection('user-info');
                    }}
                    className={`admin__nav-item ${activeSection === 'user-info' && activeSubSection === 'user-info' ? 'admin__nav-item--active' : ''}`}
                  >
                    유저 정보
                  </button>
                  <button
                    onClick={() => {
                      setActiveSection('pending');
                      setActiveSubSection('pending');
                    }}
                    className={`admin__nav-item ${activeSection === 'pending' ? 'admin__nav-item--active' : ''}`}
                  >
                    승인 대기 목록
                    {pendingUsers.length > 0 && <span className="admin__badge">{pendingUsers.length}</span>}
                  </button>
                  <button
                    onClick={() => {
                      setActiveSection('mileage');
                      setActiveSubSection('mileage');
                    }}
                    className={`admin__nav-item ${activeSection === 'mileage' ? 'admin__nav-item--active' : ''}`}
                  >
                    마일리지 지급
                  </button>
                </div>
              </div>

              {/* 글 관리 */}
              <div className="admin__nav-section">
                <button
                  onClick={() => {
                    setActiveSection('posts');
                    setActiveSubSection(null);
                  }}
                  className={`admin__nav-section-title ${activeSection === 'posts' ? 'admin__nav-section-title--active' : ''}`}
                >
                  글 관리
                </button>
                <div className="admin__nav-subsection">
                  <button
                    onClick={() => {
                      setActiveSection('posts');
                      setActiveSubSection('posts-edit');
                    }}
                    className={`admin__nav-item ${activeSection === 'posts' && activeSubSection === 'posts-edit' ? 'admin__nav-item--active' : ''}`}
                  >
                    포스트 수정/삭제
                  </button>
                  <button
                    onClick={() => {
                      setActiveSection('pin-post');
                      setActiveSubSection('pin-post');
                    }}
                    className={`admin__nav-item ${activeSection === 'pin-post' ? 'admin__nav-item--active' : ''}`}
                  >
                    게시글 고정
                  </button>
                </div>
              </div>

              {/* 카테고리 관리 */}
              <div className="admin__nav-section">
                <button
                  onClick={() => {
                    setActiveSection('category-order');
                    setActiveSubSection(null);
                  }}
                  className={`admin__nav-section-title ${activeSection === 'category-order' || activeSection === 'category-deactivate' ? 'admin__nav-section-title--active' : ''}`}
                >
                  카테고리 관리
                </button>
                <div className="admin__nav-subsection">
                  <button
                    onClick={() => {
                      setActiveSection('category-order');
                      setActiveSubSection('category-order');
                    }}
                    className={`admin__nav-item ${activeSection === 'category-order' ? 'admin__nav-item--active' : ''}`}
                  >
                    순서 설정
                  </button>
                  <button
                    onClick={() => {
                      setActiveSection('category-deactivate');
                      setActiveSubSection('category-deactivate');
                    }}
                    className={`admin__nav-item ${activeSection === 'category-deactivate' ? 'admin__nav-item--active' : ''}`}
                  >
                    카테고리 비활성화
                  </button>
                </div>
              </div>
            </nav>
          </aside>

          {/* Content */}
          <main className="admin__content">
            {renderContent()}
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default AdminDashboard;
