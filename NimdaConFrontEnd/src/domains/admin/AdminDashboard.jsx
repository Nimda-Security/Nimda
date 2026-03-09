import React, { useState, useEffect } from 'react';
import NavBar from '@/components/Layout/Header/NavBar';
import Footer from '@/components/Layout/Footer';
import { useNavigate } from 'react-router-dom';
import { getAllUsersAPI, getPendingUsersAPI, approveUserAPI, rejectUserAPI } from '@/api/admin/admin';
import { getBoardListAPI, deleteBoardAPI, toggleBoardPinAPI } from '@/api/board';
import { getAllCategoriesAdminAPI, updateCategoryAPI, createCategoryAPI, deleteCategoryAPI } from '@/api/category';
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
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedPostCategoryId, setSelectedPostCategoryId] = useState(null);
  const [selectedPinPostCategoryId, setSelectedPinPostCategoryId] = useState(null);
  const [pinPosts, setPinPosts] = useState([]);
  const [pinPostsLoading, setPinPostsLoading] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategorySlug, setNewCategorySlug] = useState('');
  const [newCategoryParentId, setNewCategoryParentId] = useState(null);
  const [addingCategory, setAddingCategory] = useState(false);
  const [categoryTags, setCategoryTags] = useState([]); // 선택된 카테고리의 태그 목록
  const [newTagInput, setNewTagInput] = useState(''); // 새 태그 입력 필드
  const [savingTags, setSavingTags] = useState(false); // 태그 저장 중 상태

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

  const loadPosts = async (categorySlug = null) => {
    setPostsLoading(true);
    try {
      const slug = categorySlug || 'news';
      const result = await getBoardListAPI({ slug, page: 0, size: 100 });
      if (result.success) {
        setPosts(result.posts || []);
      } else {
        alert('게시글 목록을 불러오는데 실패했습니다: ' + result.message);
        setPosts([]);
      }
    } catch (error) {
      console.error('게시글 목록 로드 오류:', error);
      alert('게시글 목록을 불러오는 중 오류가 발생했습니다.');
      setPosts([]);
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
      console.log('카테고리 목록 로드 성공:', allCategories.length, '개');
    } catch (error) {
      console.error('카테고리 목록 로드 오류:', error);
      const errorMessage = error instanceof Error ? error.message : '카테고리 목록을 불러오는 중 오류가 발생했습니다.';
      alert(errorMessage);
      setCategories([]); // 에러 발생 시 빈 배열로 설정
    } finally {
      setCategoriesLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      alert('카테고리명을 입력해주세요.');
      return;
    }
    if (!newCategorySlug.trim()) {
      alert('슬러그를 입력해주세요.');
      return;
    }

    // 슬러그 유효성 검사 (영문자, 숫자, 하이픈만 허용)
    const slugPattern = /^[a-z0-9-]+$/;
    if (!slugPattern.test(newCategorySlug)) {
      alert('슬러그는 영문 소문자, 숫자, 하이픈(-)만 사용할 수 있습니다.');
      return;
    }

    setAddingCategory(true);
    try {
      const result = await createCategoryAPI({
        name: newCategoryName.trim(),
        slug: newCategorySlug.trim(),
        parentId: newCategoryParentId || null,
        sortOrder: 0,
        isActive: true,
      });

      if (result.success) {
        alert('카테고리가 성공적으로 추가되었습니다.');
        setShowAddCategoryModal(false);
        setNewCategoryName('');
        setNewCategorySlug('');
        setNewCategoryParentId(null);
        // 약간의 지연 후 목록 새로고침 (백엔드 처리 시간 고려)
        setTimeout(() => {
          loadCategories();
        }, 300);
      } else {
        alert(result.message || '카테고리 추가에 실패했습니다.');
      }
    } catch (error) {
      console.error('카테고리 추가 오류:', error);
      alert('카테고리 추가 중 오류가 발생했습니다.');
    } finally {
      setAddingCategory(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!selectedCategoryId) {
      alert('삭제할 카테고리를 선택해주세요.');
      return;
    }

    if (!selectedCategoryData) {
      alert('선택된 카테고리 정보를 찾을 수 없습니다.');
      return;
    }

    const categoryName = selectedCategoryData.name;
    if (!confirm(`정말 "${categoryName}" 카테고리를 삭제하시겠습니까?\n\n하위 카테고리나 게시글이 있으면 삭제할 수 없습니다.`)) {
      return;
    }

    try {
      const result = await deleteCategoryAPI(selectedCategoryId);

      if (result.success) {
        alert('카테고리가 성공적으로 삭제되었습니다.');
        setSelectedCategoryId(null); // 선택 해제
        // 약간의 지연 후 목록 새로고침
        setTimeout(() => {
          loadCategories();
        }, 300);
      } else {
        alert(result.message || '카테고리 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('카테고리 삭제 오류:', error);
      alert('카테고리 삭제 중 오류가 발생했습니다.');
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
        // 현재 선택된 카테고리의 게시글 목록 다시 로드
        if (selectedPostCategoryId) {
          const selectedCategory = findCategoryById(activeCategoryTree, selectedPostCategoryId);
          if (selectedCategory) {
            loadPosts(selectedCategory.slug);
          }
        } else {
          loadPosts();
        }
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

  const loadPinPosts = async (categorySlug = null) => {
    setPinPostsLoading(true);
    try {
      const slug = categorySlug || 'news';
      const result = await getBoardListAPI({ slug, page: 0, size: 100 });
      if (result.success) {
        setPinPosts(result.posts || []);
      } else {
        alert('게시글 목록을 불러오는데 실패했습니다: ' + result.message);
        setPinPosts([]);
      }
    } catch (error) {
      console.error('게시글 목록 로드 오류:', error);
      alert('게시글 목록을 불러오는 중 오류가 발생했습니다.');
      setPinPosts([]);
    } finally {
      setPinPostsLoading(false);
    }
  };

  const handleTogglePin = async (postId) => {
    try {
      const result = await toggleBoardPinAPI(postId);
      if (result.success) {
        alert(result.message || '게시글 고정 상태가 변경되었습니다.');
        // 현재 선택된 카테고리의 게시글 목록 다시 로드
        if (selectedPinPostCategoryId) {
          const selectedCategory = findCategoryById(activeCategoryTree, selectedPinPostCategoryId);
          if (selectedCategory) {
            loadPinPosts(selectedCategory.slug);
          }
        } else {
          loadPinPosts();
        }
      } else {
        alert(result.message || '게시글 고정/해제에 실패했습니다.');
      }
    } catch (error) {
      console.error('게시글 고정/해제 오류:', error);
      alert('게시글 고정/해제 중 오류가 발생했습니다.');
    }
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

  // active 카테고리만 필터링하는 함수
  const filterActiveCategories = (tree) => {
    const filterRecursive = (items) => {
      return items
        .filter(item => item.isActive !== false)
        .map(item => ({
          ...item,
          children: item.children && item.children.length > 0
            ? filterRecursive(item.children)
            : []
        }));
    };
    return filterRecursive(tree);
  };

  const categoryTree = buildCategoryTree(categories);
  const activeCategoryTree = filterActiveCategories(categoryTree);

  // 전체 카테고리 수 계산
  const getTotalCategoryCount = (tree) => {
    let count = 0;
    const countRecursive = (items) => {
      items.forEach(item => {
        count++;
        if (item.children && item.children.length > 0) {
          countRecursive(item.children);
        }
      });
    };
    countRecursive(tree);
    return count;
  };

  // 선택된 카테고리 찾기
  const findCategoryById = (tree, id) => {
    for (const cat of tree) {
      if (cat.id === id) return cat;
      if (cat.children && cat.children.length > 0) {
        const found = findCategoryById(cat.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const selectedCategoryData = selectedCategoryId ? findCategoryById(categoryTree, selectedCategoryId) : null;

  // 모든 카테고리를 평탄화 (부모 선택용)
  const flattenCategories = (tree, level = 0) => {
    const result = [];
    tree.forEach(category => {
      result.push({ ...category, level });
      if (category.children && category.children.length > 0) {
        result.push(...flattenCategories(category.children, level + 1));
      }
    });
    return result;
  };

  const allCategoriesFlat = flattenCategories(categoryTree);

  // 카테고리 렌더링 (재귀) - 순서 설정용
  const renderCategoryOrderItem = (category, level = 0) => {
    const isParent = category.children && category.children.length > 0;
    const isSelected = selectedCategoryId === category.id;
    const childCount = category.children ? category.children.length : 0;
    const isInactive = category.isActive === false;

    return (
      <div key={category.id}>
        <div
          className={`admin__catorder-item ${isSelected ? 'admin__catorder-item--selected' : ''} ${level > 0 ? 'admin__catorder-item--child' : ''} ${isInactive ? 'admin__catorder-item--inactive' : ''}`}
          style={{ paddingLeft: `${12 + level * 20}px` }}
          onClick={() => setSelectedCategoryId(category.id)}
        >
          <span className="admin__catorder-drag">⠿</span>
          {level > 0 && <span className="admin__catorder-prefix">ㄴ</span>}
          <span className={`admin__catorder-name ${isInactive ? 'admin__catorder-name--inactive' : ''}`}>
            {category.name}
            {isParent && <span className="admin__catorder-count">({childCount})</span>}
          </span>
        </div>
        {isParent && category.children?.map(child => renderCategoryOrderItem(child, level + 1))}
      </div>
    );
  };

  // 카테고리 렌더링 (재귀) - 기본용
  const renderCategoryItem = (category, level = 0) => {
    const indent = level * 39;
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
    } else if (activeSection === 'category-order' || activeSection === 'category-edit' || activeSection === 'category-deactivate') {
      loadCategories();
    } else if (activeSection === 'posts') {
      // 포스트 수정/삭제 섹션: 카테고리 목록 로드 (게시글은 카테고리 선택 시 로드)
      if (categories.length === 0) {
        loadCategories();
      }
    } else if (activeSection === 'pin-post') {
      // 게시글 고정 섹션: 카테고리 목록 로드 (게시글은 카테고리 선택 시 로드)
      if (categories.length === 0) {
        loadCategories();
      }
    } else if (activeSection === 'user-info') {
      loadUsers();
    }
  }, [activeSection]);

  // 선택된 카테고리가 변경될 때 태그 목록 로드
  useEffect(() => {
    if (selectedCategoryData?.availableTags) {
      try {
        const tags = JSON.parse(selectedCategoryData.availableTags);
        setCategoryTags(Array.isArray(tags) ? tags : []);
      } catch {
        setCategoryTags([]);
      }
    } else {
      setCategoryTags([]);
    }
    setNewTagInput(''); // 새 태그 입력 필드 초기화
  }, [selectedCategoryId]);

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
        // 포스트 관리용 카테고리 렌더링 함수 (깔끔한 디자인)
        const renderPostCategoryItem = (category, level = 0) => {
          const isParent = category.children && category.children.length > 0;
          const isSelected = selectedPostCategoryId === category.id;
          const childCount = category.children ? category.children.length : 0;

          return (
            <div key={category.id}>
              <div
                className={`admin__post-category-item ${isSelected ? 'admin__post-category-item--selected' : ''} ${level > 0 ? 'admin__post-category-item--child' : ''}`}
                style={{ paddingLeft: level > 0 ? `${24 + level * 16}px` : '16px' }}
                onClick={() => {
                  setSelectedPostCategoryId(category.id);
                  loadPosts(category.slug);
                }}
              >
                <span className="admin__post-category-name">
                  {category.name}
                  {isParent && <span className="admin__post-category-count"> ({childCount})</span>}
                </span>
              </div>
              {isParent && category.children?.map(child => renderPostCategoryItem(child, level + 1))}
            </div>
          );
        };

        return (
          <div>
            <h2 className="admin__section-title">포스트 수정/삭제</h2>

            {/* 2패널 레이아웃 */}
            <div className="admin__catorder-wrap">
              {/* 왼쪽: 카테고리 트리 */}
              <div className="admin__catorder-left">
                <div className="admin__catorder-left-header">
                  <span>카테고리 ({getTotalCategoryCount(activeCategoryTree)})</span>
                </div>
                <div className="admin__post-category-list">
                  {categoriesLoading ? (
                    <div className="admin__empty" style={{ border: 'none', padding: '24px' }}>로딩 중...</div>
                  ) : activeCategoryTree.length > 0 ? (
                    activeCategoryTree.map(category => renderPostCategoryItem(category, 0))
                  ) : (
                    <div className="admin__empty" style={{ border: 'none', padding: '24px' }}>
                      <p style={{ marginBottom: 16 }}>카테고리가 없습니다.</p>
                      <button onClick={loadCategories} className="admin__btn">불러오기</button>
                    </div>
                  )}
                </div>
              </div>

              {/* 오른쪽: 게시글 목록 */}
              <div className="admin__catorder-right">
                <div className="admin__header-row" style={{ marginBottom: '16px' }}>
                  <h3 style={{ margin: 0 }}>
                    {selectedPostCategoryId
                      ? findCategoryById(activeCategoryTree, selectedPostCategoryId)?.name || '게시글 목록'
                      : '카테고리를 선택하세요'}
                  </h3>
                  {selectedPostCategoryId && (
                    <button
                      onClick={() => {
                        const selectedCategory = findCategoryById(activeCategoryTree, selectedPostCategoryId);
                        if (selectedCategory) {
                          loadPosts(selectedCategory.slug);
                        }
                      }}
                      disabled={postsLoading}
                      className="admin__btn"
                    >
                      {postsLoading ? '로딩 중' : '새로고침'}
                    </button>
                  )}
                </div>

                {selectedPostCategoryId ? (
                  postsLoading ? (
                    <div className="admin__empty" style={{ border: 'none' }}>로딩 중...</div>
                  ) : posts.length > 0 ? (
                    <div className="admin__table-wrap">
                      <table className="admin__table">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>제목</th>
                            <th>작성자</th>
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
                              <td>{post.createdAt ? new Date(post.createdAt).toLocaleDateString() : '-'}</td>
                              <td>
                                <div className="admin__actions">
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
                    </div>
                  )
                ) : (
                  <div className="admin__empty">
                    <p>왼쪽에서 카테고리를 선택하면 해당 카테고리의 게시글 목록이 표시됩니다.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'category-order':
        return (
          <div>
            <h2 className="admin__section-title">순서 설정</h2>

            {/* 상단 액션 버튼 */}
            <div className="admin__catorder-toolbar">
              <button
                className="admin__catorder-toolbar-btn"
                onClick={() => setShowAddCategoryModal(true)}
              >
                + 카테고리 추가
              </button>
              <button className="admin__catorder-toolbar-btn">+ 구분선 추가</button>
              <button
                className="admin__catorder-toolbar-btn admin__catorder-toolbar-btn--danger"
                onClick={handleDeleteCategory}
                disabled={!selectedCategoryId}
              >
                × 삭제
              </button>
            </div>

            {/* 2패널 레이아웃 */}
            <div className="admin__catorder-wrap">
              {/* 왼쪽: 카테고리 트리 */}
              <div className="admin__catorder-left">
                <div className="admin__catorder-left-header">
                  <span>카테고리 전체보기 ({getTotalCategoryCount(categoryTree)})</span>
                </div>
                <div className="admin__catorder-tree">
                  {categoriesLoading ? (
                    <div className="admin__empty" style={{ border: 'none' }}>로딩 중...</div>
                  ) : categoryTree.length > 0 ? (
                    categoryTree.map(category => renderCategoryOrderItem(category, 0))
                  ) : (
                    <div className="admin__empty" style={{ border: 'none' }}>
                      <p style={{ marginBottom: 16 }}>카테고리가 없습니다.</p>
                      <button onClick={loadCategories} className="admin__btn">불러오기</button>
                    </div>
                  )}
                </div>
              </div>

              {/* 오른쪽: 카테고리 설정 폼 */}
              <div className="admin__catorder-right">
                {selectedCategoryData ? (
                  <div className="admin__catorder-form">
                    {/* 카테고리명 */}
                    <div className="admin__catorder-form-row">
                      <label className="admin__catorder-form-label">카테고리명</label>
                      <div className="admin__catorder-form-field">
                        <input
                          type="text"
                          className="admin__catorder-input"
                          value={selectedCategoryData.name}
                          readOnly
                        />
                      </div>
                    </div>

                    {/* 태그목록 */}
                    <div className="admin__catorder-form-row">
                      <label className="admin__catorder-form-label">태그목록</label>
                      <div className="admin__catorder-form-field">
                        {/* 현재 태그 목록 표시 */}
                        {categoryTags.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px', width: '100%' }}>
                            {categoryTags.map((tag, index) => (
                              <span
                                key={index}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  padding: '4px 12px',
                                  backgroundColor: '#f0f0f0',
                                  borderRadius: '4px',
                                  fontSize: '14px',
                                  gap: '8px'
                                }}
                              >
                                {tag}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newTags = categoryTags.filter((_, i) => i !== index);
                                    setCategoryTags(newTags);
                                  }}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: '#999',
                                    fontSize: '16px',
                                    padding: 0,
                                    lineHeight: 1
                                  }}
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                        {/* 태그 추가 입력 필드 */}
                        <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                          <input
                            type="text"
                            className="admin__catorder-input"
                            placeholder="태그를 입력하세요"
                            value={newTagInput || ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              setNewTagInput(value);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                if (newTagInput && newTagInput.trim() && !categoryTags.includes(newTagInput.trim())) {
                                  setCategoryTags([...categoryTags, newTagInput.trim()]);
                                  setNewTagInput('');
                                }
                              }
                            }}
                          />
                          <button
                            type="button"
                            className="admin__btn"
                            onClick={() => {
                              if (newTagInput.trim() && !categoryTags.includes(newTagInput.trim())) {
                                setCategoryTags([...categoryTags, newTagInput.trim()]);
                                setNewTagInput('');
                              }
                            }}
                            disabled={!newTagInput.trim() || categoryTags.includes(newTagInput.trim())}
                          >
                            추가
                          </button>
                          <button
                            type="button"
                            className="admin__btn"
                            onClick={async () => {
                              if (!selectedCategoryId) return;

                              setSavingTags(true);
                              try {
                                const result = await updateCategoryAPI(selectedCategoryId, {
                                  name: null,
                                  slug: null,
                                  parentId: null,
                                  sortOrder: null,
                                  isActive: null,
                                  availableTags: categoryTags.length > 0 ? categoryTags : null
                                });

                                if (result.success) {
                                  alert('태그가 성공적으로 저장되었습니다.');
                                  await loadCategories();
                                } else {
                                  alert(result.message || '태그 저장에 실패했습니다.');
                                }
                              } catch (error) {
                                console.error('태그 저장 오류:', error);
                                alert('태그 저장 중 오류가 발생했습니다.');
                              } finally {
                                setSavingTags(false);
                              }
                            }}
                            disabled={savingTags}
                          >
                            {savingTags ? '저장 중...' : '저장'}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* 카테고리 옆에 글 개수 표시 */}
                    <div className="admin__catorder-form-row">
                      <label className="admin__catorder-form-label"></label>
                      <div className="admin__catorder-form-field">
                        <label className="admin__catorder-checkbox-label">
                          <input type="checkbox" disabled />
                          <span>카테고리 옆에 글 개수 표시</span>
                        </label>
                      </div>
                    </div>

                    {/* 공개설정 */}
                    <div className="admin__catorder-form-row">
                      <label className="admin__catorder-form-label">공개설정</label>
                      <div className="admin__catorder-form-field">
                        <label className="admin__catorder-radio-label">
                          <input type="radio" name="visibility" defaultChecked disabled />
                          <span>공개</span>
                        </label>
                        <label className="admin__catorder-radio-label">
                          <input type="radio" name="visibility" disabled />
                          <span>비공개</span>
                        </label>
                      </div>
                    </div>

                    {/* 글보기 */}
                    <div className="admin__catorder-form-row">
                      <label className="admin__catorder-form-label">글보기</label>
                      <div className="admin__catorder-form-field">
                        <label className="admin__catorder-radio-label">
                          <input type="radio" name="viewType" defaultChecked disabled />
                          <span>블로그형</span>
                        </label>
                        <label className="admin__catorder-radio-label">
                          <input type="radio" name="viewType" disabled />
                          <span>앨범형</span>
                        </label>
                        <p className="admin__catorder-form-desc">
                          앨범형의 경우, 첨부된 이미지, 동영상 섬네일이 보입니다.
                        </p>
                      </div>
                    </div>

                    {/* 카테고리 접기 */}
                    <div className="admin__catorder-form-row">
                      <label className="admin__catorder-form-label">카테고리 접기</label>
                      <div className="admin__catorder-form-field">
                        <label className="admin__catorder-radio-label">
                          <input type="radio" name="fold" defaultChecked disabled />
                          <span>펼치기</span>
                        </label>
                        <label className="admin__catorder-radio-label">
                          <input type="radio" name="fold" disabled />
                          <span>접기</span>
                        </label>
                      </div>
                    </div>

                    {/* 기본 카테고리 설정 */}
                    <div className="admin__catorder-form-row" style={{ marginTop: 12 }}>
                      <label className="admin__catorder-form-label"></label>
                      <div className="admin__catorder-form-field">
                        <label className="admin__catorder-checkbox-label">
                          <input type="checkbox" disabled />
                          <span>블로그에서 이 카테고리를 기본으로 보여줍니다.</span>
                        </label>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="admin__catorder-placeholder">
                    왼쪽에서 카테고리를 선택하면<br />설정을 확인할 수 있습니다.
                  </div>
                )}
              </div>
            </div>

            {/* 하단 안내 */}
            <div className="admin__catorder-footer">
              <div className="admin__catorder-notes">
                <p>· 드래그앤드랍으로 2단계 카테고리를 만들거나 카테고리 순서를 변경할 수 있습니다.</p>
                <p>· 글이 많은 카테고리는 설정이 반영되는데 시간이 소요됩니다. (예. 공개설정 변경, 카테고리 상위/하위 정렬변경)</p>
              </div>
              <div className="admin__catorder-footer-actions">
                <button className="admin__catorder-confirm-btn">확인</button>
              </div>
            </div>
          </div>
        );

      case 'category-edit':
        return (
          <div>
            <h2 className="admin__section-title">카테고리 수정</h2>
            <div className="admin__empty">구현 예정</div>
          </div>
        );

      case 'category-deactivate':
        return (
          <div>
            <h2 className="admin__section-title">카테고리 비활성화</h2>
            <div className="admin__empty">구현 예정</div>
          </div>
        );

      case 'pin-post':
        // 게시글 고정용 카테고리 렌더링 함수
        const renderPinPostCategoryItem = (category, level = 0) => {
          const isParent = category.children && category.children.length > 0;
          const isSelected = selectedPinPostCategoryId === category.id;
          const childCount = category.children ? category.children.length : 0;

          return (
            <div key={category.id}>
              <div
                className={`admin__post-category-item ${isSelected ? 'admin__post-category-item--selected' : ''} ${level > 0 ? 'admin__post-category-item--child' : ''}`}
                style={{ paddingLeft: level > 0 ? `${24 + level * 16}px` : '16px' }}
                onClick={() => {
                  setSelectedPinPostCategoryId(category.id);
                  loadPinPosts(category.slug);
                }}
              >
                <span className="admin__post-category-name">
                  {category.name}
                  {isParent && <span className="admin__post-category-count"> ({childCount})</span>}
                </span>
              </div>
              {isParent && category.children?.map(child => renderPinPostCategoryItem(child, level + 1))}
            </div>
          );
        };

        return (
          <div>
            <h2 className="admin__section-title">게시글 고정</h2>

            {/* 2패널 레이아웃 */}
            <div className="admin__catorder-wrap">
              {/* 왼쪽: 카테고리 트리 */}
              <div className="admin__catorder-left">
                <div className="admin__catorder-left-header">
                  <span>카테고리 ({getTotalCategoryCount(activeCategoryTree)})</span>
                </div>
                <div className="admin__post-category-list">
                  {categoriesLoading ? (
                    <div className="admin__empty" style={{ border: 'none', padding: '24px' }}>로딩 중...</div>
                  ) : activeCategoryTree.length > 0 ? (
                    activeCategoryTree.map(category => renderPinPostCategoryItem(category, 0))
                  ) : (
                    <div className="admin__empty" style={{ border: 'none', padding: '24px' }}>
                      <p style={{ marginBottom: 16 }}>카테고리가 없습니다.</p>
                      <button onClick={loadCategories} className="admin__btn">불러오기</button>
                    </div>
                  )}
                </div>
              </div>

              {/* 오른쪽: 게시글 목록 */}
              <div className="admin__catorder-right">
                <div className="admin__header-row" style={{ marginBottom: '16px' }}>
                  <h3 style={{ margin: 0 }}>
                    {selectedPinPostCategoryId
                      ? findCategoryById(activeCategoryTree, selectedPinPostCategoryId)?.name || '게시글 목록'
                      : '카테고리를 선택하세요'}
                  </h3>
                  {selectedPinPostCategoryId && (
                    <button
                      onClick={() => {
                        const selectedCategory = findCategoryById(activeCategoryTree, selectedPinPostCategoryId);
                        if (selectedCategory) {
                          loadPinPosts(selectedCategory.slug);
                        }
                      }}
                      disabled={pinPostsLoading}
                      className="admin__btn"
                    >
                      {pinPostsLoading ? '로딩 중' : '새로고침'}
                    </button>
                  )}
                </div>

                {selectedPinPostCategoryId ? (
                  pinPostsLoading ? (
                    <div className="admin__empty" style={{ border: 'none' }}>로딩 중...</div>
                  ) : pinPosts.length > 0 ? (
                    <div className="admin__table-wrap">
                      <table className="admin__table">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>제목</th>
                            <th>작성자</th>
                            <th>고정 상태</th>
                            <th>작성일</th>
                            <th>작업</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pinPosts.map((post) => (
                            <tr key={post.id}>
                              <td>{post.id}</td>
                              <td style={{ textAlign: 'left' }}>{post.title}</td>
                              <td>{post.author?.nickname || '-'}</td>
                              <td>
                                <span style={{
                                  color: post.pinned ? '#4CAF50' : '#999',
                                  fontWeight: post.pinned ? 'bold' : 'normal'
                                }}>
                                  {post.pinned ? '✓ 고정됨' : '고정 안됨'}
                                </span>
                              </td>
                              <td>{post.createdAt ? new Date(post.createdAt).toLocaleDateString() : '-'}</td>
                              <td>
                                <div className="admin__actions">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleTogglePin(post.id);
                                    }}
                                    className={post.pinned ? "admin__btn--reject" : "admin__btn--approve"}
                                  >
                                    {post.pinned ? '고정 해제' : '고정'}
                                  </button>
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
                    </div>
                  )
                ) : (
                  <div className="admin__empty">
                    <p>왼쪽에서 카테고리를 선택하면 해당 카테고리의 게시글 목록이 표시됩니다.</p>
                  </div>
                )}
              </div>
            </div>
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
                  className={`admin__nav-section-title ${activeSection === 'category-order' || activeSection === 'category-edit' || activeSection === 'category-deactivate' ? 'admin__nav-section-title--active' : ''}`}
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
                      setActiveSection('category-edit');
                      setActiveSubSection('category-edit');
                    }}
                    className={`admin__nav-item ${activeSection === 'category-edit' ? 'admin__nav-item--active' : ''}`}
                  >
                    카테고리 수정
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

      {/* 카테고리 추가 모달 */}
      {showAddCategoryModal && (
        <div className="admin__modal-overlay" onClick={() => setShowAddCategoryModal(false)}>
          <div className="admin__modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin__modal-header">
              <h3>카테고리 추가</h3>
              <button
                className="admin__modal-close"
                onClick={() => {
                  setShowAddCategoryModal(false);
                  setNewCategoryName('');
                  setNewCategorySlug('');
                  setNewCategoryParentId(null);
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '20px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '13px',
                  fontWeight: 600,
                  fontFamily: 'Pretendard, sans-serif',
                  color: 'var(--color-black)'
                }}>
                  카테고리명 *
                </label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="예: 공지사항"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '14px',
                    fontFamily: 'Pretendard, sans-serif',
                    border: '1px solid var(--color-gray-200)',
                    borderRadius: '4px',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '13px',
                  fontWeight: 600,
                  fontFamily: 'Pretendard, sans-serif',
                  color: 'var(--color-black)'
                }}>
                  슬러그 (URL) *
                </label>
                <input
                  type="text"
                  value={newCategorySlug}
                  onChange={(e) => setNewCategorySlug(e.target.value)}
                  placeholder="예: notice"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '14px',
                    fontFamily: 'Pretendard, sans-serif',
                    border: '1px solid var(--color-gray-200)',
                    borderRadius: '4px',
                    outline: 'none'
                  }}
                />
                <p style={{
                  marginTop: '4px',
                  fontSize: '11px',
                  color: 'var(--color-gray-400)',
                  fontFamily: 'Pretendard, sans-serif'
                }}>
                  영문 소문자, 숫자, 하이픈(-)만 사용 가능합니다.
                </p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '13px',
                  fontWeight: 600,
                  fontFamily: 'Pretendard, sans-serif',
                  color: 'var(--color-black)'
                }}>
                  부모 카테고리 (선택사항)
                </label>
                <select
                  value={newCategoryParentId || ''}
                  onChange={(e) => setNewCategoryParentId(e.target.value ? Number(e.target.value) : null)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '14px',
                    fontFamily: 'Pretendard, sans-serif',
                    border: '1px solid var(--color-gray-200)',
                    borderRadius: '4px',
                    outline: 'none',
                    backgroundColor: '#ffffff'
                  }}
                >
                  <option value="">최상위 카테고리</option>
                  {allCategoriesFlat.map(category => (
                    <option key={category.id} value={category.id}>
                      {'  '.repeat(category.level)}{category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{
                display: 'flex',
                gap: '8px',
                justifyContent: 'flex-end',
                paddingTop: '16px',
                borderTop: '1px solid var(--color-gray-200)'
              }}>
                <button
                  className="admin__btn"
                  onClick={() => {
                    setShowAddCategoryModal(false);
                    setNewCategoryName('');
                    setNewCategorySlug('');
                    setNewCategoryParentId(null);
                  }}
                  disabled={addingCategory}
                >
                  취소
                </button>
                <button
                  className="admin__btn--approve"
                  onClick={handleAddCategory}
                  disabled={addingCategory}
                  style={{ padding: '8px 20px' }}
                >
                  {addingCategory ? '추가 중...' : '추가'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
