import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { createBoardAPI } from '@/api/board';
import { uploadBoardFileViaS3 } from '@/api/attachments';
import { getCategoryBySlugAPI, getAllCategoriesAPI } from '@/api/category';
import ChevronDown from '@/components/icons/ChevronDown';
import { isAdmin, hasRole } from '@/utils/jwt';
import type { Category } from '../types';

function BoardWritePage() {
  const navigate = useNavigate();
  const { boardType: paramBoardType } = useParams<{ boardType: string }>();
  const [searchParams] = useSearchParams();

  const slug = paramBoardType?.toLowerCase() || 'news';

  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [parentCategoryId, setParentCategoryId] = useState<number | null>(null);
  const [subCategoryId, setSubCategoryId] = useState<number | null>(null);
  const [showParentDropdown, setShowParentDropdown] = useState(false);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tag, setTag] = useState<string>(''); // 기존 tag 필드는 필요시 사용 (현재는 카테고리 선택으로 대체하는 흐름이나 보존 가능)
  const [file, setFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFontSize, setShowFontSize] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const colorInputRef = useRef<HTMLInputElement>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // contentEditable에서 HTML 추출
  const getEditorContent = () => {
    return contentRef.current?.innerHTML || '';
  };

  // 모든 카테고리 로드
  useEffect(() => {
    const fetchAllCategories = async () => {
      try {
        const categories = await getAllCategoriesAPI();
        setAllCategories(categories);
      } catch (err) {
        console.error('카테고리 목록 로드 오류:', err);
      }
    };
    fetchAllCategories();
  }, []);

  // URL slug에 따른 초기 게시판 설정
  useEffect(() => {
    if (allCategories.length === 0) return;

    const fetchInitial = async () => {
      const cat = allCategories.find(c => c.slug === slug);
      if (cat) {
        if (cat.parentId) {
          // 만약 slug가 하위 카테고리라면 부모를 상단에, 자기자신을 하단에 설정
          setParentCategoryId(cat.parentId);
          setSubCategoryId(cat.id);
        } else {
          // slug가 상위 카테고리라면 상단에 설정, 하단은 첫 번째 자식으로 초기화 시도
          setParentCategoryId(cat.id);
          const children = allCategories.filter(c => c.parentId === cat.id);
          if (children.length > 0) {
            setSubCategoryId(children[0].id);
          } else {
            setSubCategoryId(cat.id);
          }
        }
      }
    };
    fetchInitial();
  }, [allCategories, slug]);

  const rootCategories = allCategories
    .filter(c => c.parentId === null && c.isActive)
    .filter(c => !['바로가기', '대회'].includes(c.name))
    .filter(c => c.name !== '새 소식' || isAdmin())
    .filter(c => c.name !== '카르텔' || hasRole('ROLE_CARTEL') || isAdmin());
  const currentParentCat = allCategories.find(c => c.id === parentCategoryId);
  const subCategories = allCategories.filter(c => c.parentId === parentCategoryId && c.isActive);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const targetCategoryId = subCategoryId || parentCategoryId;

    if (!title.trim() || !getEditorContent().replace(/<[^>]*>/g, '').trim()) {
      setError('제목과 내용을 입력해주세요.');
      return;
    }
    if (!targetCategoryId) {
      setError('카테고리를 선택해주세요.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      let attachmentIds: number[] | undefined;
      if (file) {
        const uploaded = await uploadBoardFileViaS3(file, targetCategoryId);
        if (!uploaded.ok) {
          setError(uploaded.message);
          return;
        }
        attachmentIds = [uploaded.attachmentId];
      }

      const response = await createBoardAPI({
        categoryId: targetCategoryId,
        title: title.trim(),
        content: getEditorContent(),
        tag: tag.trim() || undefined,
        attachmentIds,
      });

      if (response.success && 'board' in response) {
        const writtenCategory = allCategories.find(cat => cat.id === targetCategoryId);
        const categorySlug = writtenCategory?.slug || slug;
        navigate(`/board/${categorySlug}/${response.board.id}`);
      } else {
        setError(response.message || '게시글 작성에 실패했습니다.');
      }
    } catch (err) {
      setError('게시글 작성 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('작성 중인 내용이 사라집니다. 정말 나가시겠습니까?')) {
      const cat = allCategories.find(c => c.id === (subCategoryId || parentCategoryId));
      navigate(`/board/${cat?.slug || slug}`);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) setFile(droppedFile);
  };

  // 텍스트 포맷팅 (bold, italic, underline, strikeThrough)
  const applyFormat = (format: 'bold' | 'italic' | 'underline' | 'strikeThrough') => {
    contentRef.current?.focus();
    document.execCommand(format, false);
  };

  const applyFontSize = (size: string) => {
    contentRef.current?.focus();
    // execCommand fontSize uses 1-7 scale, so we use formatBlock + span approach
    document.execCommand('fontSize', false, '7');
    // Replace the generated <font size="7"> with a span that has the actual px size
    const editor = contentRef.current;
    if (editor) {
      const fonts = editor.querySelectorAll('font[size="7"]');
      fonts.forEach((font) => {
        const span = document.createElement('span');
        span.style.fontSize = size;
        span.innerHTML = font.innerHTML;
        font.parentNode?.replaceChild(span, font);
      });
    }
    setShowFontSize(false);
  };

  const applyColor = (color: string) => {
    contentRef.current?.focus();
    document.execCommand('foreColor', false, color);
    setShowColorPicker(false);
  };

  return (
    <Layout hideSidebar={true}>
      <div className="bw-page">
        <form onSubmit={handleSubmit} className="bw-container">

          {/* ── 상단: 대분류 게시판 선택 ── */}
          <div className="bw-top-bar">
            <span className="bw-label">게시판</span>
            <div className="bw-category-selector" onClick={() => setShowParentDropdown(p => !p)}>
              <span className="bw-category-selected">
                {currentParentCat ? currentParentCat.name : '선택하세요'}
              </span>
              <span className={`bw-chevron ${showParentDropdown ? 'bw-chevron--open' : ''}`}>
                <ChevronDown />
              </span>
              {showParentDropdown && (
                <div className="bw-category-dropdown">
                  {rootCategories.map(cat => (
                    <div
                      key={cat.id}
                      className={`bw-category-option ${cat.id === parentCategoryId ? 'bw-category-option--active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setParentCategoryId(cat.id);
                        // 부모가 바뀌면 자식을 첫 번째 자식으로 초기화 거나 null
                        const children = allCategories.filter(c => c.parentId === cat.id);
                        setSubCategoryId(children.length > 0 ? children[0].id : cat.id);
                        setShowParentDropdown(false);
                      }}
                    >
                      {cat.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bw-divider" />

          {/* ── 제목 ── */}
          <div className="bw-title-area">
            <input
              id="bw-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목을 입력하세요."
              className="bw-title-input"
              maxLength={200}
              required
            />
          </div>

          <div className="bw-divider" />

          {/* ── 툴바 ── */}
          <div className="bw-toolbar">
            <button type="button" className="bw-tool-btn" title="이모지">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                <line x1="9" y1="9" x2="9.01" y2="9" />
                <line x1="15" y1="9" x2="15.01" y2="9" />
              </svg>
            </button>
            <span className="bw-tool-dot" />
            <button type="button" className="bw-tool-btn" title="굵게" onClick={() => applyFormat('bold')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
                <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
              </svg>
            </button>
            <button type="button" className="bw-tool-btn" title="기울임" onClick={() => applyFormat('italic')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="4" x2="10" y2="4" />
                <line x1="14" y1="20" x2="5" y2="20" />
                <line x1="15" y1="4" x2="9" y2="20" />
              </svg>
            </button>
            <button type="button" className="bw-tool-btn" title="밑줄" onClick={() => applyFormat('underline')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3" />
                <line x1="4" y1="21" x2="20" y2="21" />
              </svg>
            </button>
            <button type="button" className="bw-tool-btn" title="취소선" onClick={() => applyFormat('strikeThrough')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="12" x2="20" y2="12" />
                <path d="M17.5 7.5C17.5 5.01 15.49 3 13 3H11C8.51 3 6.5 5.01 6.5 7.5c0 1.38.62 2.61 1.6 3.43" />
                <path d="M6.5 16.5C6.5 18.99 8.51 21 11 21h2c2.49 0 4.5-2.01 4.5-4.5 0-1.38-.62-2.61-1.6-3.43" />
              </svg>
            </button>
            <span className="bw-tool-dot" />
            {/* 폰트 크기 */}
            <div className="bw-tool-dropdown-wrap">
              <button type="button" className="bw-tool-btn" title="글자 크기" onClick={() => { setShowFontSize(p => !p); setShowColorPicker(false); }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="4 7 4 4 20 4 20 7" />
                  <line x1="9" y1="20" x2="15" y2="20" />
                  <line x1="12" y1="4" x2="12" y2="20" />
                </svg>
              </button>
              {showFontSize && (
                <div className="bw-tool-dropdown">
                  {[{ label: '작게', value: '12px' }, { label: '보통', value: '16px' }, { label: '크게', value: '20px' }, { label: '아주 크게', value: '28px' }].map(opt => (
                    <button key={opt.value} type="button" className="bw-tool-dropdown-item" style={{ fontSize: opt.value }} onClick={() => applyFontSize(opt.value)}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* 글자 색상 */}
            <div className="bw-tool-dropdown-wrap">
              <button type="button" className="bw-tool-btn" title="글자 색상" onClick={() => { setShowColorPicker(p => !p); setShowFontSize(false); }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3L4 21h16L12 3z" />
                  <line x1="8" y1="15" x2="16" y2="15" />
                </svg>
              </button>
              {showColorPicker && (
                <div className="bw-tool-dropdown bw-color-grid">
                  {['#0C0C0C','#DC2626','#EA580C','#CA8A04','#16A34A','#2563EB','#7C3AED','#DB2777','#525252','#A3A3A3'].map(c => (
                    <button key={c} type="button" className="bw-color-swatch" style={{ background: c }} onClick={() => applyColor(c)} title={c} />
                  ))}
                  <button type="button" className="bw-color-custom" onClick={() => colorInputRef.current?.click()}>직접 선택</button>
                  <input ref={colorInputRef} type="color" className="bw-hidden-input" onChange={(e) => applyColor(e.target.value)} />
                </div>
              )}
            </div>
            <span className="bw-tool-dot" />
            <button type="button" className="bw-tool-btn" title="사진 첨부" onClick={() => fileInputRef.current?.click()}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </button>
            <button type="button" className="bw-tool-btn" title="파일 첨부" onClick={() => fileInputRef.current?.click()}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <line x1="9" y1="15" x2="15" y2="15" />
              </svg>
            </button>
            <span className="bw-tool-dot" />
            <button type="button" className="bw-tool-btn" title="정렬">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="17" y1="10" x2="3" y2="10" />
                <line x1="21" y1="6" x2="3" y2="6" />
                <line x1="21" y1="14" x2="3" y2="14" />
                <line x1="17" y1="18" x2="3" y2="18" />
              </svg>
            </button>
          </div>

          <div className="bw-divider" />

          {/* ── 내용 ── */}
          <div
            ref={contentRef}
            id="bw-content"
            contentEditable
            className="bw-content-input"
            data-placeholder="내용을 입력하세요."
            onInput={() => setContent(getEditorContent())}
          />

          <div className="bw-divider" />

          {/* ── 하위 카테고리 선택 (칩) ── */}
          <div className="bw-section">
            <span className="bw-section-label">세부 카테고리</span>
            {subCategories.length > 0 ? (
              <div className="bw-tag-list">
                {subCategories.map((sub) => (
                  <button
                    key={sub.id}
                    type="button"
                    className={`bw-tag-chip ${subCategoryId === sub.id ? 'bw-tag-chip--active' : ''}`}
                    onClick={() => setSubCategoryId(sub.id)}
                  >
                    #{sub.name}
                  </button>
                ))}
              </div>
            ) : (
              <p className="bw-tag-hint">선택한 게시판에 세부 카테고리가 없습니다.</p>
            )}
            {!subCategoryId && subCategories.length > 0 && (
              <p className="bw-tag-required">게시글 분류를 위한 세부 카테고리를 선택해 주세요.</p>
            )}
          </div>

          <div className="bw-divider" />

          {/* ── 첨부파일 ── */}
          <div className="bw-section">
            <span className="bw-section-label">첨부파일</span>
            {file ? (
              <div className="bw-file-selected">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                <span className="bw-file-name">{file.name}</span>
                <button type="button" className="bw-file-remove" onClick={handleRemoveFile}>×</button>
              </div>
            ) : (
              <div
                className={`bw-dropzone ${isDragOver ? 'bw-dropzone--active' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <svg className="bw-dropzone-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="16 16 12 12 8 16" />
                  <line x1="12" y1="12" x2="12" y2="21" />
                  <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                </svg>
                <p className="bw-dropzone-text">파일을 드래그하거나 클릭하여 업로드</p>
                <p className="bw-dropzone-hint">최대 50MB &nbsp;·&nbsp; 이미지, PDF, 문서 파일 지원</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              id="bw-file"
              type="file"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </div>

          {error && <div className="bw-error">{error}</div>}

          <div className="bw-divider" />

          {/* ── 버튼 ── */}
          <div className="bw-actions">
            <button type="button" className="bw-btn bw-btn--cancel" onClick={handleCancel}>
              취소
            </button>
            <button type="submit" className="bw-btn bw-btn--submit" disabled={isSubmitting}>
              {isSubmitting ? '등록 중...' : '등록'}
            </button>
          </div>

        </form>
      </div>
    </Layout>
  );
}

export default BoardWritePage;
