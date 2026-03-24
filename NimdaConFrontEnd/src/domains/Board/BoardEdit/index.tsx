import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { getBoardDetailAPI, updateBoardAPI } from '@/api/board';
import { uploadBoardFileViaS3 } from '@/api/attachments';
import type { Board } from '../types';

function BoardEditPage() {
  const navigate = useNavigate();
  const { boardType: paramBoardType, id } = useParams<{ boardType: string; id: string }>();

  const slug = paramBoardType?.toLowerCase() || 'news';

  const [board, setBoard] = useState<Board | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tag, setTag] = useState<string>('');
  /** 새로 선택한 파일(저장 시 S3 업로드). */
  const [file, setFile] = useState<File | null>(null);
  /**
   * 수정 API에 넘길 최종 첨부 ID 목록.
   * null = 상세에 attachments 필드가 없던 응답(옛 API) → PUT 시 attachmentIds 생략·첨부 동기화 안 함.
   * 배열 = 동기화(빈 배열이면 서버에서 해당 글 첨부 전부 제거).
   */
  const [attachmentIdList, setAttachmentIdList] = useState<number[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFontSize, setShowFontSize] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);

  const getEditorContent = () => {
    return contentRef.current?.innerHTML || '';
  };

  const applyFormat = (format: 'bold' | 'italic' | 'underline' | 'strikeThrough') => {
    contentRef.current?.focus();
    document.execCommand(format, false);
  };

  const applyFontSize = (size: string) => {
    contentRef.current?.focus();
    document.execCommand('fontSize', false, '7');
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

  useEffect(() => {
    if (id) {
      fetchBoard(parseInt(id));
    }
  }, [id]);

  const fetchBoard = async (boardId: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await getBoardDetailAPI(boardId);

      if (response.success && 'board' in response) {
        const fetchedBoard = response.board;
        setBoard(fetchedBoard);
        setTitle(fetchedBoard.title);
        setContent(fetchedBoard.content);
        setTag(fetchedBoard.tag || '');
        if (fetchedBoard.attachments !== undefined) {
          setAttachmentIdList(fetchedBoard.attachments.map((a) => a.id));
        } else {
          setAttachmentIdList(null);
        }
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('게시글을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!board || !title.trim() || !getEditorContent().replace(/<[^>]*>/g, '').trim()) {
      setError('제목과 내용을 입력해주세요.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      if (!board.category) {
        setError('카테고리 정보가 없습니다.');
        return;
      }

      // 첨부 동기화: 상세에 attachments가 있었으면 목록 기준, 새 파일 있으면 S3 업로드 후 ID 추가.
      // attachmentIdList가 null이면 attachmentIds 필드 자체를 보내지 않음(백엔드가 기존 첨부 유지).
      let attachmentIds: number[] | undefined;
      if (attachmentIdList !== null) {
        attachmentIds = [...attachmentIdList];
      }
      if (file) {
        const uploaded = await uploadBoardFileViaS3(file, board.category.id);
        if (!uploaded.ok) {
          setError(uploaded.message);
          return;
        }
        attachmentIds = [...(attachmentIds ?? []), uploaded.attachmentId];
      }

      const response = await updateBoardAPI(board.id, {
        categoryId: board.category.id,
        title: title.trim(),
        content: getEditorContent(),
        tag: tag.trim() || undefined,
        attachmentIds,
      });

      if (response.success && 'board' in response) {
        alert('게시글이 수정되었습니다.');
        const boardSlug = response.board.category?.slug || slug;
        navigate(`/board/${boardSlug}/${board.id}`);
      } else {
        setError(response.message || '게시글 수정에 실패했습니다.');
      }
    } catch (err) {
      setError('게시글 수정 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (board) {
      const boardSlug = board.category?.slug || slug;
      navigate(`/board/${boardSlug}/${board.id}`);
    } else {
      navigate(`/board/${slug}`);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
  };

  /** 목록에서 첨부 ID 제거(서버 동기화는 저장 시). */
  const handleRemoveAttachmentId = (id: number) => {
    setAttachmentIdList((prev) => (prev === null ? null : prev.filter((x) => x !== id)));
  };

  // 카테고리의 availableTags를 파싱하여 배열로 변환
  const getAvailableTags = (): string[] => {
    if (!board?.category?.availableTags) return [];
    try {
      return JSON.parse(board.category.availableTags);
    } catch {
      return [];
    }
  };

  const availableTags = getAvailableTags();

  if (loading) {
    return (
      <Layout hideSidebar={true}>
        <div className="min-h-screen bg-white pt-8">
          <div className="container mx-auto px-4 py-6 max-w-4xl">
            <div className="text-center py-12 text-gray-600">로딩 중...</div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error && !board) {
    return (
      <Layout hideSidebar={true}>
        <div className="min-h-screen bg-white pt-8">
          <div className="container mx-auto px-4 py-6 max-w-4xl">
            <div className="text-center py-12 text-red-600">{error}</div>
            <div className="text-center">
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                돌아가기
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout hideSidebar={true}>
      <div className="min-h-screen bg-white pt-8">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <header className="mb-6">
            <button
              onClick={handleCancel}
              className="text-gray-600 hover:text-black text-sm mb-4"
            >
              ← 돌아가기
            </button>
            <h1 className="text-2xl font-bold text-black">게시글 수정</h1>
          </header>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 제목 */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                제목
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="제목을 입력하세요"
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                maxLength={200}
                required
              />
            </div>

            {/* 내용 */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                내용
              </label>
              {/* 포맷팅 툴바 */}
              <div className="flex items-center gap-1 mb-2 p-1 border border-gray-300 rounded-t bg-gray-50">
                <button type="button" onClick={() => applyFormat('bold')} className="px-2 py-1 text-sm font-bold hover:bg-gray-200 rounded" title="굵게">B</button>
                <button type="button" onClick={() => applyFormat('italic')} className="px-2 py-1 text-sm italic hover:bg-gray-200 rounded" title="기울임">I</button>
                <button type="button" onClick={() => applyFormat('underline')} className="px-2 py-1 text-sm underline hover:bg-gray-200 rounded" title="밑줄">U</button>
                <button type="button" onClick={() => applyFormat('strikeThrough')} className="px-2 py-1 text-sm line-through hover:bg-gray-200 rounded" title="취소선">S</button>
                <span className="w-px h-5 bg-gray-300 mx-1" />
                {/* 폰트 크기 */}
                <div className="relative">
                  <button type="button" onClick={() => { setShowFontSize(p => !p); setShowColorPicker(false); }} className="px-2 py-1 text-sm hover:bg-gray-200 rounded" title="글자 크기">
                    <span style={{ fontSize: 11 }}>A</span><span style={{ fontSize: 15 }}>A</span>
                  </button>
                  {showFontSize && (
                    <div className="bw-tool-dropdown" style={{ left: 0 }}>
                      {[{ label: '작게', value: '12px' }, { label: '보통', value: '16px' }, { label: '크게', value: '20px' }, { label: '아주 크게', value: '28px' }].map(opt => (
                        <button key={opt.value} type="button" className="bw-tool-dropdown-item" style={{ fontSize: opt.value }} onClick={() => applyFontSize(opt.value)}>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {/* 글자 색상 */}
                <div className="relative">
                  <button type="button" onClick={() => { setShowColorPicker(p => !p); setShowFontSize(false); }} className="px-2 py-1 text-sm hover:bg-gray-200 rounded" title="글자 색상">
                    <span style={{ borderBottom: '3px solid #DC2626', paddingBottom: 1 }}>A</span>
                  </button>
                  {showColorPicker && (
                    <div className="bw-tool-dropdown bw-color-grid" style={{ left: 0 }}>
                      {['#0C0C0C','#DC2626','#EA580C','#CA8A04','#16A34A','#2563EB','#7C3AED','#DB2777','#525252','#A3A3A3'].map(c => (
                        <button key={c} type="button" className="bw-color-swatch" style={{ background: c }} onClick={() => applyColor(c)} title={c} />
                      ))}
                      <button type="button" className="bw-color-custom" onClick={() => colorInputRef.current?.click()}>직접 선택</button>
                      <input ref={colorInputRef} type="color" className="bw-hidden-input" onChange={(e) => applyColor(e.target.value)} />
                    </div>
                  )}
                </div>
              </div>
              <div
                ref={contentRef}
                id="content"
                contentEditable
                className="w-full px-4 py-2 border border-gray-300 rounded-b focus:outline-none focus:ring-2 focus:ring-black min-h-[360px] whitespace-pre-wrap"
                data-placeholder="내용을 입력하세요"
                dangerouslySetInnerHTML={{ __html: content }}
                onInput={() => setContent(getEditorContent())}
              />
            </div>

            {/* 태그 선택 (카테고리에 availableTags가 있을 때만 표시) */}
            {availableTags.length > 0 && (
              <div>
                <label htmlFor="tag" className="block text-sm font-medium text-gray-700 mb-2">
                  세부 카테고리 (선택사항)
                </label>
                <select
                  id="tag"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="">세부 카테고리를 선택하세요</option>
                  {availableTags.map((tagOption) => (
                    <option key={tagOption} value={tagOption}>
                      {tagOption}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* 첨부: S3 연동 시 attachments 목록 / 옛 글은 filename만 있을 수 있음 */}
            <div>
              <span className="block text-sm font-medium text-gray-700 mb-2">첨부파일</span>
              {attachmentIdList !== null && attachmentIdList.length > 0 && (
                <ul className="mb-3 space-y-1 text-sm text-gray-700">
                  {attachmentIdList.map((aid) => {
                    const meta = board?.attachments?.find((a) => a.id === aid);
                    return (
                      <li key={aid} className="flex items-center gap-2">
                        <span>{meta?.originFilename ?? `첨부 #${aid}`}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachmentId(aid)}
                          className="text-red-600 hover:text-red-800"
                        >
                          제거
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
              {board?.attachments === undefined && board?.filename && (
                <p className="text-xs text-gray-500 mb-2">
                  (레거시 서버 저장 파일명: {board.filename.split('_').slice(1).join('_')} — S3 첨부 목록이 없을 때만 표시)
                </p>
              )}

              <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-1">
                새 첨부 추가
              </label>
              {file ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700">{file.name}</span>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    삭제
                  </button>
                </div>
              ) : (
                <input
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                />
              )}
              <p className="text-xs text-gray-500 mt-1">
                저장 시 S3에 업로드 후 글에 연결됩니다. 위 목록에서 제거한 항목은 저장 시 삭제됩니다.
              </p>
            </div>

            {/* 에러 메시지 */}
            {error && (
              <div className="p-4 bg-red-50 text-red-700 rounded">{error}</div>
            )}

            {/* 버튼 */}
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50"
              >
                {isSubmitting ? '수정 중...' : '수정하기'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}

export default BoardEditPage;

