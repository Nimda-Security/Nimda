import React from 'react';

const CategoryManagement = ({
  activeSection,
  setShowAddCategoryModal,
  handleDeleteCategory,
  selectedCategoryId,
  getTotalCategoryCount,
  categoryTree,
  categoriesLoading,
  renderCategoryOrderItem,
  loadCategories,
  selectedCategoryData,
  categoryTags,
  setCategoryTags,
  newTagInput,
  setNewTagInput,
  updateCategoryAPI,
  savingTags,
  setSavingTags,
}) => {
  if (activeSection === 'category-edit') {
    return (
      <div>
        <h2 className="admin__section-title">카테고리 수정</h2>
        <div className="admin__empty">구현 예정</div>
      </div>
    );
  }

  if (activeSection === 'category-deactivate') {
    return (
      <div>
        <h2 className="admin__section-title">카테고리 비활성화</h2>
        <div className="admin__empty">구현 예정</div>
      </div>
    );
  }

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
                            name: selectedCategoryData.name, // required fields might need real pass, but using the existing code
                            slug: selectedCategoryData.slug,
                            parentId: selectedCategoryData.parentId,
                            sortOrder: selectedCategoryData.sortOrder,
                            isActive: selectedCategoryData.isActive,
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
};

export default CategoryManagement;
