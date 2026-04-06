import React, { useState, useEffect } from 'react';
import {
  getTagStatsAPI,
  deactivateBoardsByTagAPI,
  activateBoardsByTagAPI,
} from '@/api/admin/admin';

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
  categoryRedirectUrl,
  setCategoryRedirectUrl,
  localCategoryTree,
  handleSaveOrder,
  savingOrder,
  orderChanged,
}) => {
  const [editName, setEditName] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [savingNameSlug, setSavingNameSlug] = useState(false);
  const [tagStats, setTagStats] = useState([]);
  const [loadingStats, setLoadingStats] = useState(false);
  const [processingTag, setProcessingTag] = useState(null);

  useEffect(() => {
    if (selectedCategoryData) {
      setEditName(selectedCategoryData.name || '');
      setEditSlug(selectedCategoryData.slug || '');
    }
  }, [selectedCategoryData?.id]);

  const loadTagStats = async () => {
    if (!selectedCategoryId) return;
    setLoadingStats(true);
    try {
      const result = await getTagStatsAPI(selectedCategoryId);
      if (result.success) {
        setTagStats(result.tagStats || []);
      } else {
        setTagStats([]);
      }
    } catch {
      setTagStats([]);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    if (activeSection === 'category-deactivate' && selectedCategoryId) {
      loadTagStats();
    } else {
      setTagStats([]);
    }
  }, [selectedCategoryId, activeSection]);

  const handleSaveNameSlug = async () => {
    if (!selectedCategoryId || !selectedCategoryData) return;
    const trimmedName = editName.trim();
    const trimmedSlug = editSlug.trim();
    if (!trimmedName) {
      alert('카테고리명을 입력해주세요.');
      return;
    }
    if (!trimmedSlug) {
      alert('슬러그를 입력해주세요.');
      return;
    }
    const slugPattern = /^[a-z0-9-]+$/;
    if (!slugPattern.test(trimmedSlug)) {
      alert('슬러그는 영문 소문자, 숫자, 하이픈(-)만 사용할 수 있습니다.');
      return;
    }
    setSavingNameSlug(true);
    try {
      const result = await updateCategoryAPI(selectedCategoryId, {
        name: trimmedName,
        slug: trimmedSlug,
      });
      if (result.success) {
        alert('카테고리명과 슬러그가 저장되었습니다.');
        await loadCategories();
      } else {
        alert(result.message || '저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('카테고리명/슬러그 저장 오류:', error);
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setSavingNameSlug(false);
    }
  };

  if (activeSection === 'category-edit') {
    return (
      <div>
        <h2 className="admin__section-title">카테고리 수정</h2>
        <div className="admin__empty">구현 예정</div>
      </div>
    );
  }

  if (activeSection === 'category-deactivate') {
    const handleDeactivate = async (tagId, tagName) => {
      if (!confirm(`'${tagName}' 태그의 모든 활성 게시글을 비활성화하시겠습니까?`)) return;
      setProcessingTag(tagId);
      try {
        const result = await deactivateBoardsByTagAPI(selectedCategoryId, tagId);
        if (result.success) {
          alert(result.message || '비활성화되었습니다.');
          await loadTagStats();
        } else {
          alert(result.message || '비활성화에 실패했습니다.');
        }
      } catch {
        alert('비활성화 중 오류가 발생했습니다.');
      } finally {
        setProcessingTag(null);
      }
    };

    const handleActivate = async (tagId, tagName) => {
      if (!confirm(`'${tagName}' 태그의 모든 비활성 게시글을 다시 활성화하시겠습니까?`)) return;
      setProcessingTag(tagId);
      try {
        const result = await activateBoardsByTagAPI(selectedCategoryId, tagId);
        if (result.success) {
          alert(result.message || '활성화되었습니다.');
          await loadTagStats();
        } else {
          alert(result.message || '활성화에 실패했습니다.');
        }
      } catch {
        alert('활성화 중 오류가 발생했습니다.');
      } finally {
        setProcessingTag(null);
      }
    };

    return (
      <div>
        <h2 className="admin__section-title">태그별 게시글 비활성화</h2>
        <div className="admin__catorder-wrap">
          {/* 왼쪽: 카테고리 트리 */}
          <div className="admin__catorder-left">
            <div className="admin__catorder-left-header">
              <span>카테고리 전체보기 ({getTotalCategoryCount(localCategoryTree)})</span>
            </div>
            <div className="admin__catorder-tree">
              {categoriesLoading ? (
                <div className="admin__empty" style={{ border: 'none' }}>로딩 중...</div>
              ) : localCategoryTree.length > 0 ? (
                localCategoryTree.map(category => renderCategoryOrderItem(category, 0))
              ) : (
                <div className="admin__empty" style={{ border: 'none' }}>
                  <p style={{ marginBottom: 16 }}>카테고리가 없습니다.</p>
                  <button onClick={loadCategories} className="admin__btn">불러오기</button>
                </div>
              )}
            </div>
          </div>

          {/* 오른쪽: 태그 비활성화 관리 */}
          <div className="admin__catorder-right">
            {selectedCategoryData ? (
              <div className="admin__catorder-form">
                <div className="admin__catorder-form-row">
                  <label className="admin__catorder-form-label" style={{ fontWeight: 600, fontSize: '15px' }}>
                    {selectedCategoryData.name}
                  </label>
                </div>

                {loadingStats ? (
                  <div className="admin__empty" style={{ border: 'none' }}>통계 로딩 중...</div>
                ) : tagStats.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {tagStats.map((stat) => (
                      <div
                        key={stat.tagId}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 16px',
                          backgroundColor: '#f8f9fa',
                          borderRadius: '8px',
                          border: '1px solid #e9ecef',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 10px',
                            backgroundColor: '#e9ecef',
                            borderRadius: '4px',
                            fontSize: '14px',
                            fontWeight: 500,
                          }}>
                            {stat.tagName}
                          </span>
                          <span style={{ fontSize: '13px', color: '#666' }}>
                            활성 <strong style={{ color: '#2b6cb0' }}>{stat.activeCount}</strong>건
                            {stat.hiddenCount > 0 && (
                              <> · 비활성 <strong style={{ color: '#c53030' }}>{stat.hiddenCount}</strong>건</>
                            )}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {stat.activeCount > 0 && (
                            <button
                              className="admin__btn"
                              style={{ backgroundColor: '#c53030', color: '#fff', border: 'none', fontSize: '12px', padding: '6px 12px' }}
                              onClick={() => handleDeactivate(stat.tagId, stat.tagName)}
                              disabled={processingTag === stat.tagId}
                            >
                              {processingTag === stat.tagId ? '처리 중...' : '비활성화'}
                            </button>
                          )}
                          {stat.hiddenCount > 0 && (
                            <button
                              className="admin__btn"
                              style={{ backgroundColor: '#2b6cb0', color: '#fff', border: 'none', fontSize: '12px', padding: '6px 12px' }}
                              onClick={() => handleActivate(stat.tagId, stat.tagName)}
                              disabled={processingTag === stat.tagId}
                            >
                              {processingTag === stat.tagId ? '처리 중...' : '활성화'}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="admin__empty" style={{ border: 'none' }}>
                    <p>이 카테고리에 해당 태그로 작성된 게시글이 없습니다.</p>
                    <p style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
                      태그 관리 메뉴에서 태그를 먼저 추가해주세요.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="admin__empty" style={{ border: 'none' }}>
                왼쪽에서 카테고리를 선택하세요.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="admin__section-title">
        순서 설정
        {orderChanged && (
          <span style={{ marginLeft: '10px', fontSize: '12px', color: '#e53e3e', fontWeight: 'normal' }}>
            • 미저장 변경사항이 있습니다
          </span>
        )}
      </h2>

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
            <span>카테고리 전체보기 ({getTotalCategoryCount(localCategoryTree)})</span>
          </div>
          <div className="admin__catorder-tree">
            {categoriesLoading ? (
              <div className="admin__empty" style={{ border: 'none' }}>로딩 중...</div>
            ) : localCategoryTree.length > 0 ? (
              localCategoryTree.map(category => renderCategoryOrderItem(category, 0))
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
              {/* 카테고리명 + 슬러그 */}
              <div className="admin__catorder-form-row">
                <label className="admin__catorder-form-label">카테고리명</label>
                <div className="admin__catorder-form-field">
                  <input
                    type="text"
                    className="admin__catorder-input"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="카테고리명"
                  />
                </div>
              </div>

              <div className="admin__catorder-form-row">
                <label className="admin__catorder-form-label">슬러그</label>
                <div className="admin__catorder-form-field">
                  <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                    <input
                      type="text"
                      className="admin__catorder-input"
                      value={editSlug}
                      onChange={(e) => setEditSlug(e.target.value.toLowerCase())}
                      placeholder="예: notice, free-talk"
                    />
                    <button
                      type="button"
                      className="admin__btn"
                      onClick={handleSaveNameSlug}
                      disabled={savingNameSlug}
                    >
                      {savingNameSlug ? '저장 중...' : '저장'}
                    </button>
                  </div>
                  <p style={{ marginTop: '4px', fontSize: '11px', color: '#999', fontFamily: 'Pretendard, sans-serif' }}>
                    영문 소문자, 숫자, 하이픈(-)만 사용 가능합니다. URL에 사용됩니다.
                  </p>
                </div>
              </div>

              {/* 태그목록 - 태그 관리 페이지로 안내 */}
              <div className="admin__catorder-form-row">
                <label className="admin__catorder-form-label">태그목록</label>
                <div className="admin__catorder-form-field">
                  <p style={{ fontSize: '13px', color: '#666', fontFamily: 'Pretendard, sans-serif' }}>
                    태그는 <strong>태그 관리</strong> 메뉴에서 관리할 수 있습니다.
                  </p>
                </div>
              </div>

              {/* 바로가기 URL */}
              <div className="admin__catorder-form-row">
                <label className="admin__catorder-form-label">바로가기 URL</label>
                <div className="admin__catorder-form-field">
                  <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                    <input
                      type="url"
                      className="admin__catorder-input"
                      placeholder="예: https://example.com"
                      value={categoryRedirectUrl}
                      onChange={(e) => setCategoryRedirectUrl(e.target.value)}
                    />
                    <button
                      type="button"
                      className="admin__btn"
                      onClick={async () => {
                        if (!selectedCategoryId) return;
                        setSavingTags(true);
                        try {
                          const result = await updateCategoryAPI(selectedCategoryId, {
                            name: selectedCategoryData.name,
                            slug: selectedCategoryData.slug,
                            parentId: selectedCategoryData.parentId,
                            sortOrder: selectedCategoryData.sortOrder,
                            isActive: selectedCategoryData.isActive,
                            redirectUrl: categoryRedirectUrl.trim() || null,
                          });
                          if (result.success) {
                            alert('바로가기 URL이 저장되었습니다.');
                            await loadCategories();
                          } else {
                            alert(result.message || 'URL 저장에 실패했습니다.');
                          }
                        } catch (error) {
                          console.error('URL 저장 오류:', error);
                          alert('URL 저장 중 오류가 발생했습니다.');
                        } finally {
                          setSavingTags(false);
                        }
                      }}
                      disabled={savingTags}
                    >
                      {savingTags ? '저장 중...' : '저장'}
                    </button>
                  </div>
                  <p style={{ marginTop: '4px', fontSize: '11px', color: '#999', fontFamily: 'Pretendard, sans-serif' }}>
                    입력하면 해당 카테고리 클릭 시 외부 URL로 직접 이동합니다. 비워두면 일반 게시판으로 작동합니다.
                  </p>
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
          <button
            className="admin__catorder-confirm-btn"
            onClick={handleSaveOrder}
            disabled={savingOrder || !orderChanged}
            style={{ opacity: !orderChanged ? 0.5 : 1 }}
          >
            {savingOrder ? '저장 중...' : '순서 저장'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryManagement;
