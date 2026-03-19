import React from 'react';

const PostManagement = ({
  categoriesLoading,
  activeCategoryTree,
  getTotalCategoryCount,
  selectedPostCategoryId,
  setSelectedPostCategoryId,
  loadPosts,
  loadCategories,
  postsLoading,
  posts,
  handleDeletePost,
  findCategoryById,
}) => {
  // 포스트 관리용 카테고리 렌더링 함수
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
};

export default PostManagement;
