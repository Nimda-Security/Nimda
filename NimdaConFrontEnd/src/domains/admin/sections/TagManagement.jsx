import React, { useState, useEffect } from 'react';
import {
  getAllTagsAPI,
  getTagsByCategoryAPI,
  addTagAPI,
  deleteTagAPI,
  updateTagAPI,
} from '@/api/tag';

const TagManagement = ({
  categories,
  categoriesLoading,
  loadCategories,
  categoryTree,
  localCategoryTree,
  getTotalCategoryCount,
  renderCategoryOrderItem,
  selectedCategoryId,
}) => {
  const [tags, setTags] = useState([]);
  const [tagsLoading, setTagsLoading] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagSortValue, setNewTagSortValue] = useState('');
  const [addingTag, setAddingTag] = useState(false);
  const [editingTagId, setEditingTagId] = useState(null);
  const [editTagName, setEditTagName] = useState('');
  const [editTagSortValue, setEditTagSortValue] = useState('');
  const [editTagCategoryId, setEditTagCategoryId] = useState(null);
  const [savingTag, setSavingTag] = useState(false);
  const [deletingTagId, setDeletingTagId] = useState(null);

  // 선택된 카테고리 정보 찾기
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

  const selectedCategoryData = selectedCategoryId
    ? findCategoryById(categoryTree, selectedCategoryId)
    : null;

  // 태그 로드
  const loadTags = async () => {
    if (!selectedCategoryId) {
      setTags([]);
      return;
    }
    setTagsLoading(true);
    try {
      const result = await getTagsByCategoryAPI(selectedCategoryId);
      setTags(result);
    } catch {
      setTags([]);
    } finally {
      setTagsLoading(false);
    }
  };

  useEffect(() => {
    loadTags();
    setEditingTagId(null);
    setNewTagName('');
    setNewTagSortValue('');
  }, [selectedCategoryId]);

  // 태그 추가
  const handleAddTag = async () => {
    if (!newTagName.trim()) {
      alert('태그 이름을 입력해주세요.');
      return;
    }
    if (!selectedCategoryId) {
      alert('카테고리를 먼저 선택해주세요.');
      return;
    }

    setAddingTag(true);
    try {
      const sortVal = newTagSortValue ? parseInt(newTagSortValue, 10) : tags.length;
      const result = await addTagAPI({
        name: newTagName.trim(),
        categoryId: selectedCategoryId,
        sortValue: isNaN(sortVal) ? tags.length : sortVal,
      });
      if (result.success) {
        setNewTagName('');
        setNewTagSortValue('');
        await loadTags();
      } else {
        alert(result.message || '태그 추가에 실패했습니다.');
      }
    } catch {
      alert('태그 추가 중 오류가 발생했습니다.');
    } finally {
      setAddingTag(false);
    }
  };

  // 태그 삭제
  const handleDeleteTag = async (tagId) => {
    if (!confirm('이 태그를 삭제하시겠습니까?')) return;
    setDeletingTagId(tagId);
    try {
      const result = await deleteTagAPI(tagId);
      if (result.success) {
        await loadTags();
      } else {
        alert(result.message || '태그 삭제에 실패했습니다.');
      }
    } catch {
      alert('태그 삭제 중 오류가 발생했습니다.');
    } finally {
      setDeletingTagId(null);
    }
  };

  // 태그 수정 시작
  const handleStartEdit = (tag) => {
    setEditingTagId(tag.id);
    setEditTagName(tag.tagName);
    setEditTagSortValue(String(tag.sortValue ?? ''));
    setEditTagCategoryId(tag.categoryId);
  };

  // 태그 수정 취소
  const handleCancelEdit = () => {
    setEditingTagId(null);
    setEditTagName('');
    setEditTagSortValue('');
    setEditTagCategoryId(null);
  };

  // 태그 수정 저장
  const handleSaveEdit = async () => {
    if (!editTagName.trim()) {
      alert('태그 이름을 입력해주세요.');
      return;
    }
    setSavingTag(true);
    try {
      const sortVal = editTagSortValue ? parseInt(editTagSortValue, 10) : undefined;
      const result = await updateTagAPI(editingTagId, {
        name: editTagName.trim(),
        sortValue: isNaN(sortVal) ? undefined : sortVal,
        categoryId: editTagCategoryId || undefined,
      });
      if (result.success) {
        setEditingTagId(null);
        await loadTags();
      } else {
        alert(result.message || '태그 수정에 실패했습니다.');
      }
    } catch {
      alert('태그 수정 중 오류가 발생했습니다.');
    } finally {
      setSavingTag(false);
    }
  };

  // 순서 위/아래 이동
  const handleMoveTag = async (tagId, direction) => {
    const index = tags.findIndex((t) => t.id === tagId);
    if (index === -1) return;
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= tags.length) return;

    const currentTag = tags[index];
    const swapTag = tags[swapIndex];

    try {
      await Promise.all([
        updateTagAPI(currentTag.id, { sortValue: swapTag.sortValue }),
        updateTagAPI(swapTag.id, { sortValue: currentTag.sortValue }),
      ]);
      await loadTags();
    } catch {
      alert('순서 변경 중 오류가 발생했습니다.');
    }
  };

  // 모든 카테고리를 평탄화 (카테고리 선택 드롭다운용)
  const flattenCategories = (tree, level = 0) => {
    const result = [];
    tree.forEach((category) => {
      result.push({ ...category, level });
      if (category.children && category.children.length > 0) {
        result.push(...flattenCategories(category.children, level + 1));
      }
    });
    return result;
  };
  const allCategoriesFlat = flattenCategories(categoryTree);

  return (
    <div>
      <h2 className="admin__section-title">태그 관리</h2>

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
              localCategoryTree.map((category) => renderCategoryOrderItem(category, 0))
            ) : (
              <div className="admin__empty" style={{ border: 'none' }}>
                <p style={{ marginBottom: 16 }}>카테고리가 없습니다.</p>
                <button onClick={loadCategories} className="admin__btn">불러오기</button>
              </div>
            )}
          </div>
        </div>

        {/* 오른쪽: 태그 관리 */}
        <div className="admin__catorder-right">
          {selectedCategoryData ? (
            <div className="admin__catorder-form">
              <div className="admin__catorder-form-row">
                <label className="admin__catorder-form-label" style={{ fontWeight: 600, fontSize: '15px' }}>
                  {selectedCategoryData.name} - 태그 목록
                </label>
              </div>

              {/* 태그 추가 폼 */}
              <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px', color: '#555' }}>
                      태그 이름
                    </label>
                    <input
                      type="text"
                      className="admin__catorder-input"
                      placeholder="새 태그 이름"
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                    />
                  </div>
                  <div style={{ width: '80px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px', color: '#555' }}>
                      순서
                    </label>
                    <input
                      type="number"
                      className="admin__catorder-input"
                      placeholder="0"
                      value={newTagSortValue}
                      onChange={(e) => setNewTagSortValue(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                    />
                  </div>
                  <button
                    type="button"
                    className="admin__btn--approve"
                    onClick={handleAddTag}
                    disabled={addingTag || !newTagName.trim()}
                    style={{ padding: '8px 16px', whiteSpace: 'nowrap' }}
                  >
                    {addingTag ? '추가 중...' : '+ 추가'}
                  </button>
                </div>
              </div>

              {/* 태그 목록 */}
              {tagsLoading ? (
                <div className="admin__empty" style={{ border: 'none' }}>태그 로딩 중...</div>
              ) : tags.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {tags.map((tag, index) => (
                    <div
                      key={tag.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '12px 16px',
                        backgroundColor: editingTagId === tag.id ? '#fff' : '#f8f9fa',
                        borderRadius: '8px',
                        border: editingTagId === tag.id ? '2px solid #4A7FCC' : '1px solid #e9ecef',
                        gap: '12px',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {editingTagId === tag.id ? (
                        /* 수정 모드 */
                        <>
                          <div style={{ flex: 1, display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <input
                              type="text"
                              className="admin__catorder-input"
                              value={editTagName}
                              onChange={(e) => setEditTagName(e.target.value)}
                              style={{ flex: 1 }}
                              placeholder="태그 이름"
                            />
                            <input
                              type="number"
                              className="admin__catorder-input"
                              value={editTagSortValue}
                              onChange={(e) => setEditTagSortValue(e.target.value)}
                              style={{ width: '70px' }}
                              placeholder="순서"
                            />
                            <select
                              className="admin__catorder-input"
                              value={editTagCategoryId || ''}
                              onChange={(e) => setEditTagCategoryId(e.target.value ? Number(e.target.value) : null)}
                              style={{ width: '140px' }}
                            >
                              {allCategoriesFlat.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                  {'  '.repeat(cat.level)}{cat.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                            <button
                              className="admin__btn--approve"
                              onClick={handleSaveEdit}
                              disabled={savingTag}
                              style={{ fontSize: '12px', padding: '6px 12px' }}
                            >
                              {savingTag ? '저장 중...' : '저장'}
                            </button>
                            <button
                              className="admin__btn"
                              onClick={handleCancelEdit}
                              style={{ fontSize: '12px', padding: '6px 12px' }}
                            >
                              취소
                            </button>
                          </div>
                        </>
                      ) : (
                        /* 표시 모드 */
                        <>
                          {/* 순서 이동 버튼 */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flexShrink: 0 }}>
                            <button
                              onClick={() => handleMoveTag(tag.id, 'up')}
                              disabled={index === 0}
                              style={{
                                background: 'none', border: 'none', cursor: index === 0 ? 'default' : 'pointer',
                                fontSize: '11px', padding: '0 4px', color: index === 0 ? '#ccc' : '#666',
                                lineHeight: 1,
                              }}
                              title="위로 이동"
                            >
                              ▲
                            </button>
                            <button
                              onClick={() => handleMoveTag(tag.id, 'down')}
                              disabled={index === tags.length - 1}
                              style={{
                                background: 'none', border: 'none', cursor: index === tags.length - 1 ? 'default' : 'pointer',
                                fontSize: '11px', padding: '0 4px', color: index === tags.length - 1 ? '#ccc' : '#666',
                                lineHeight: 1,
                              }}
                              title="아래로 이동"
                            >
                              ▼
                            </button>
                          </div>

                          {/* 순서값 */}
                          <span style={{
                            display: 'inline-block',
                            width: '32px',
                            textAlign: 'center',
                            fontSize: '12px',
                            color: '#999',
                            fontFamily: 'monospace',
                            flexShrink: 0,
                          }}>
                            {tag.sortValue}
                          </span>

                          {/* 태그 이름 */}
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 12px',
                            backgroundColor: '#e9ecef',
                            borderRadius: '4px',
                            fontSize: '14px',
                            fontWeight: 500,
                          }}>
                            #{tag.tagName}
                          </span>

                          {/* 카테고리명 */}
                          <span style={{ fontSize: '13px', color: '#888', flex: 1 }}>
                            {tag.categoryName}
                          </span>

                          {/* 수정/삭제 버튼 */}
                          <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                            <button
                              className="admin__btn"
                              onClick={() => handleStartEdit(tag)}
                              style={{ fontSize: '12px', padding: '6px 12px' }}
                            >
                              수정
                            </button>
                            <button
                              className="admin__btn"
                              onClick={() => handleDeleteTag(tag.id)}
                              disabled={deletingTagId === tag.id}
                              style={{
                                fontSize: '12px', padding: '6px 12px',
                                backgroundColor: '#c53030', color: '#fff', border: 'none',
                              }}
                            >
                              {deletingTagId === tag.id ? '삭제 중...' : '삭제'}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="admin__empty" style={{ border: 'none' }}>
                  <p>이 카테고리에 등록된 태그가 없습니다.</p>
                  <p style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
                    위에서 태그를 추가해주세요.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="admin__catorder-placeholder">
              왼쪽에서 카테고리를 선택하면<br />해당 카테고리의 태그를 관리할 수 있습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TagManagement;
