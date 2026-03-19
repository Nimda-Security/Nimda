import React, { useState, useEffect } from 'react';
import NavBar from '@/components/Layout/Header/NavBar';
import Footer from '@/components/Layout/Footer';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAllUsersAPI, getPendingUsersAPI, approveUserAPI, rejectUserAPI } from '@/api/admin/admin';
import { getBoardListAPI, deleteBoardAPI, toggleBoardPinAPI } from '@/api/board';
import { getAllCategoriesAdminAPI, updateCategoryAPI, createCategoryAPI, deleteCategoryAPI } from '@/api/category';
import UserInfo from './sections/UserInfo';
import PendingUsers from './sections/PendingUsers';
import PostManagement from './sections/PostManagement';
import CategoryManagement from './sections/CategoryManagement';
import PinPostManagement from './sections/PinPostManagement';
import AdminSidebar from './components/AdminSidebar';
import './AdminDashboard.css';

function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
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

  // 사이드바에서 넘겨준 상태 처리 (다른 페이지에서 관리자 홈으로 돌아올 때)
  useEffect(() => {
    if (location.state) {
      if (location.state.section) setActiveSection(location.state.section);
      if (location.state.subSection) setActiveSubSection(location.state.subSection);
      // 상태 사용 후 초기화 (뒤로가기 시 중복 처리 방지)
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

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
      const token = localStorage.getItem('authToken');

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
          <UserInfo
            users={users}
            loading={loading}
            loadUsers={loadUsers}
            selectedUser={selectedUser}
            setSelectedUser={setSelectedUser}
            hasRole={hasRole}
            getUserRoles={getUserRoles}
            uploadingImage={uploadingImage}
            handleImageUpload={handleImageUpload}
          />
        );
      case 'pending':
        return (
          <PendingUsers
            pendingUsers={pendingUsers}
            pendingUsersLoading={pendingUsersLoading}
            loadPendingUsers={loadPendingUsers}
            handleApproveUser={handleApproveUser}
            handleRejectUser={handleRejectUser}
          />
        );
      case 'posts':
        return (
          <PostManagement
            categoriesLoading={categoriesLoading}
            activeCategoryTree={activeCategoryTree}
            getTotalCategoryCount={getTotalCategoryCount}
            selectedPostCategoryId={selectedPostCategoryId}
            setSelectedPostCategoryId={setSelectedPostCategoryId}
            loadPosts={loadPosts}
            loadCategories={loadCategories}
            postsLoading={postsLoading}
            posts={posts}
            handleDeletePost={handleDeletePost}
            findCategoryById={findCategoryById}
          />
        );
      case 'category-order':
      case 'category-edit':
      case 'category-deactivate':
        return (
          <CategoryManagement
            activeSection={activeSection}
            setShowAddCategoryModal={setShowAddCategoryModal}
            handleDeleteCategory={handleDeleteCategory}
            selectedCategoryId={selectedCategoryId}
            getTotalCategoryCount={getTotalCategoryCount}
            categoryTree={categoryTree}
            categoriesLoading={categoriesLoading}
            renderCategoryOrderItem={renderCategoryOrderItem}
            loadCategories={loadCategories}
            selectedCategoryData={selectedCategoryData}
            categoryTags={categoryTags}
            setCategoryTags={setCategoryTags}
            newTagInput={newTagInput}
            setNewTagInput={setNewTagInput}
            updateCategoryAPI={updateCategoryAPI}
            savingTags={savingTags}
            setSavingTags={setSavingTags}
          />
        );
      case 'pin-post':
        return (
          <PinPostManagement
            categoriesLoading={categoriesLoading}
            activeCategoryTree={activeCategoryTree}
            getTotalCategoryCount={getTotalCategoryCount}
            selectedPinPostCategoryId={selectedPinPostCategoryId}
            setSelectedPinPostCategoryId={setSelectedPinPostCategoryId}
            loadPinPosts={loadPinPosts}
            loadCategories={loadCategories}
            pinPostsLoading={pinPostsLoading}
            pinPosts={pinPosts}
            handleTogglePin={handleTogglePin}
            findCategoryById={findCategoryById}
          />
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
          {/* Sidebar - Component로 분리 */}
          <AdminSidebar
            activeSection={activeSection}
            activeSubSection={activeSubSection}
            setActiveSection={setActiveSection}
            setActiveSubSection={setActiveSubSection}
            pendingUsersCount={pendingUsers.length}
            theme="default"
          />

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
