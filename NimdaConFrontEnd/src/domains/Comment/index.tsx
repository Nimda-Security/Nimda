import { useEffect, useMemo, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import Avatar from '@/components/Avatar/Avatar';
import { Heart } from '@/components/icons/Heart';
import { MessageBox } from '@/components/icons/MessageBox';
import { VerticalDots } from '@/components/icons/VerticalDots';

// [수정] 내 정보를 가져오기 위한 auth API 추가
import { isLoggedIn, getMyPageInfo, PROFILE_UPDATED_EVENT } from "@/api/auth";
import {
  getCommentsAPI,
  createCommentAPI,
  updateCommentAPI,
  deleteCommentAPI,
  updateCommentStatusAPI,
} from '@/api/comment';
import { toggleCommentLike } from '@/api/commentLike';
import type {
  CommentResponse,
  CommentCreateRequest,
  CommentStatusUpdateRequest,
  CommentStatus,
} from '@/domains/Comment/types';
import EmoticonPicker, { parseEmoticons, getEmoticonSrc } from './EmoticonPicker';
import './Comment.css';
import { formatDate } from '@/utils/formatDate';
import { isAdmin } from '@/utils/jwt';

interface CommentSectionProps {
  boardId: number;
  isAdmin?: boolean;
}

type CommentSortType = 'latest' | 'oldest' | 'likes';
const COMMENTS_PER_PAGE = 15;

const parseCommentDate = (value: string) => {
  const normalized = value.replace(
    /^(\d{4})\/(\d{2})\/(\d{2}) (\d{2}):(\d{2})$/,
    '$1-$2-$3T$4:$5:00'
  );
  const time = new Date(normalized).getTime();
  return Number.isNaN(time) ? 0 : time;
};

const sortCommentsTree = (
  list: CommentResponse[],
  sortType: CommentSortType
): CommentResponse[] => {
  const sorted = [...list].sort((a, b) => {
    if (sortType === 'likes') {
      if (b.likeCount !== a.likeCount) {
        return b.likeCount - a.likeCount;
      }
      return parseCommentDate(b.createdAt) - parseCommentDate(a.createdAt);
    }

    const diff = parseCommentDate(a.createdAt) - parseCommentDate(b.createdAt);
    return sortType === 'oldest' ? diff : -diff;
  });

  return sorted.map((comment) => ({
    ...comment,
    children: comment.children?.length
      ? sortCommentsTree(comment.children, sortType)
      : [],
  }));
};

interface FlattenedCommentItem {
  comment: CommentResponse;
  depth: number;
}

const flattenCommentsTree = (
  list: CommentResponse[],
  depth = 0
): FlattenedCommentItem[] =>
  list.flatMap((comment) => [
    { comment, depth },
    ...flattenCommentsTree(comment.children ?? [], depth + 1),
  ]);

/**
 * 댓글 리스트의 각 아이템 아바타
 */
function CommentAvatar({
  src,
  decorationKey,
}: {
  src: string | null;
  decorationKey?: string | null;
  name: string;
}) {
  return (
    <Avatar
      src={src}
      decorationKey={decorationKey}
      size={40}
      wrapperClassName="comment-item__avatar"
      className="border-0"
      decorationScale={1.3}
    />
  );
}

/**
 * 댓글/답글 입력 컴포넌트
 */
function CommentInput({
  value,
  onChange,
  onSubmit,
  placeholder,
  isSubmitting,
  profileImage,
  profileDecoration,
  buttonLabel = '작성',
  showAvatar = true,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  isSubmitting: boolean;
  profileImage?: string | null;
  profileDecoration?: string | null;
  buttonLabel?: string;
  showAvatar?: boolean;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const lastEmittedRef = useRef('');
  const [isEmpty, setIsEmpty] = useState(true);

  // DOM → 마커 텍스트 직렬화
  const serialize = (el: HTMLElement): string => {
    let result = '';
    el.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        result += node.textContent ?? '';
      } else if (node.nodeName === 'IMG') {
        const id = (node as HTMLImageElement).dataset.emoticonId;
        if (id) result += `[nimda:${id}]`;
      } else if (node.nodeName === 'BR') {
        result += '\n';
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const tag = (node as HTMLElement).tagName.toUpperCase();
        const inner = serialize(node as HTMLElement);
        result += ['DIV', 'P'].includes(tag) ? '\n' + inner : inner;
      }
    });
    return result;
  };

  // 마커 텍스트 → innerHTML 역직렬화
  const toHTML = (text: string): string =>
    text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\[nimda:(\d{2})\]/g, (_, id) =>
        `<img src="${getEmoticonSrc(id)}" alt="[nimda:${id}]" data-emoticon-id="${id}" class="comment-emoticon-inline" draggable="false" />`
      )
      .replace(/\n/g, '<br>');

  // 외부에서 value가 바뀔 때(제출 후 초기화, 수정 모드) 에디터 동기화
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    if (value === lastEmittedRef.current) return;
    editor.innerHTML = value ? toHTML(value) : '';
    lastEmittedRef.current = value;
    setIsEmpty(!value.trim());
  }, [value]);

  const handleInput = () => {
    const editor = editorRef.current;
    if (!editor) return;
    const text = serialize(editor);
    lastEmittedRef.current = text;
    const nextIsEmpty = !text.trim();
    if (nextIsEmpty && editor.innerHTML !== '') {
      editor.innerHTML = '';
    }
    setIsEmpty(nextIsEmpty);
    onChange(text);
  };

  const handleFocus = () => {
    const editor = editorRef.current;
    if (!editor || !isEmpty) return;
    editor.innerHTML = '';
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    range.deleteContents();
    const textNode = document.createTextNode(text);
    range.insertNode(textNode);
    range.setStartAfter(textNode);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
    handleInput();
  };

  const handleEmoticonSelect = (marker: string) => {
    const editor = editorRef.current;
    if (!editor) return;
    const id = marker.match(/\[nimda:(\d{2})\]/)?.[1];
    if (!id) return;
    const img = document.createElement('img');
    img.src = getEmoticonSrc(id);
    img.alt = marker;
    img.dataset.emoticonId = id;
    img.className = 'comment-emoticon-inline';
    img.draggable = false;
    const insertAfter = (node: Node) => {
      const range = document.createRange();
      range.setStartAfter(node);
      range.collapse(true);
      const sel = window.getSelection();
      if (sel) { sel.removeAllRanges(); sel.addRange(range); }
    };
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && editor.contains(sel.getRangeAt(0).commonAncestorContainer)) {
      const range = sel.getRangeAt(0);
      range.deleteContents();
      range.insertNode(img);
      insertAfter(img);
    } else {
      editor.appendChild(img);
      insertAfter(img);
    }
    const text = serialize(editor);
    lastEmittedRef.current = text;
    setIsEmpty(!text.trim());
    onChange(text);
  };

  return (
    <div className="comment-input">
      {showAvatar && (
        <div className="comment-input__avatar">
          <Avatar
            src={profileImage}
            decorationKey={profileDecoration}
            size="100%"
            className="border-0"
            decorationScale={1.3}
          />
        </div>
      )}
      <div className="comment-input__body">
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onFocus={handleFocus}
          onInput={handleInput}
          onPaste={handlePaste}
          data-placeholder={placeholder ?? '댓글을 입력하세요.'}
          className={`comment-input__textarea comment-input__editor${isEmpty ? ' comment-input__editor--empty' : ''}`}
          role="textbox"
          aria-multiline="true"
        />
        <div className="comment-input__footer">
          <EmoticonPicker onSelect={handleEmoticonSelect} />
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting || !value.trim()}
            className="comment-input__submit"
          >
            {isSubmitting ? '처리 중...' : buttonLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: CommentStatus }) {
  const map: Record<CommentStatus, { label: string; mod: string }> = {
    PUBLIC: { label: '공개', mod: '--public' },
    DELETED: { label: '삭제', mod: '--deleted' },
    HIDDEN: { label: '숨김', mod: '--hidden' },
  };
  const { label, mod } = map[status] ?? map.PUBLIC;
  return <span className={`comment-status-badge comment-status-badge${mod}`}>{label}</span>;
}


interface CommentMoreDropdownProps {
  editable: boolean;
  deletable: boolean;
  hideable: boolean;
  currentStatus?: CommentStatus;
  onEdit: () => void;
  onDelete: () => void;
  onHide: (status: CommentStatus) => void;
}

function CommentMoreDropdown({
  editable,
  deletable,
  hideable,
  currentStatus,
  onEdit,
  onDelete,
  onHide,
}: CommentMoreDropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [open]);

  const hasAnyAction = editable || deletable || hideable;
  if (!hasAnyAction) return null;

  const handleEdit = () => {
    setOpen(false);
    onEdit();
  };

  const handleDelete = () => {
    setOpen(false);
    onDelete();
  };

  const handleToggleHide = () => {
    setOpen(false);
    const nextStatus: CommentStatus = currentStatus === 'HIDDEN' ? 'PUBLIC' : 'HIDDEN';
    onHide(nextStatus);
  };

  return (
    <div className="comment-more" ref={containerRef}>
      <button
        type="button"
        className={`comment-item__more${open ? ' comment-item__more--active' : ''}`}
        aria-label="더보기"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        <VerticalDots size={16} />
      </button>

      {open && (
        <ul className="comment-more__dropdown" role="menu">
          {editable && (
            <li role="menuitem">
              <button type="button" className="comment-more__item" onClick={handleEdit}>
                수정
              </button>
            </li>
          )}
          {hideable && (
            <li role="menuitem">
              <button type="button" className="comment-more__item" onClick={handleToggleHide}>
                {currentStatus === 'HIDDEN' ? '공개' : '숨김'}
              </button>
            </li>
          )}
          {deletable && (
            <li role="menuitem">
              <button
                type="button"
                className="comment-more__item comment-more__item--danger"
                onClick={handleDelete}
              >
                삭제
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

interface CommentItemProps {
  comment: CommentResponse;
  depth: number;
  onReply: (parentId: number, authorName: string) => void;
  onEdit: (commentId: number, currentContext: string) => void;
  onDelete: (commentId: number) => void;
  onHide: (commentId: number, status: CommentStatus) => void;
  onToggleLike: (commentId: number) => void;
  replyTargetId: number | null;
  replyTargetName: string;
  replyContext: string;
  setReplyContext: (v: string) => void;
  onSubmitReply: () => void;
  isReplySubmitting: boolean;
  onCancelReply: () => void;
  replyInputRef: React.RefObject<HTMLDivElement | null>;
  myProfileImage: string | null; // [추가] 답글창에 쓰기 위함
  myProfileDecoration: string | null;
}

function CommentItem({
  comment,
  depth,
  onReply,
  onEdit,
  onDelete,
  onHide,
  onToggleLike,
  replyTargetId,
  replyTargetName,
  replyContext,
  setReplyContext,
  onSubmitReply,
  isReplySubmitting,
  onCancelReply,
  replyInputRef,
  myProfileImage, // [추가]
  myProfileDecoration,
}: CommentItemProps) {
  const isReply = depth > 0;

  const { editable, deletable, hideable } = comment;

  return (
    <>
      <div
        className={`comment-item${isReply ? ' comment-item--reply' : ''}`}
        style={isReply ? { marginLeft: `${depth * 48}px` } : undefined}
      >
        <CommentAvatar
          src={comment.authorProfileImage}
          decorationKey={comment.authorProfileDecoration}
          name={comment.authorName}
        />
        <div className="comment-item__body">
          <div className="comment-item__header">
            <Link
              to={comment.authorName ? `/user/${comment.authorName}` : '#'}
              className="comment-item__author"
            >
              {comment.authorName}
            </Link>
            <span className="comment-item__date">{formatDate(comment.createdAt)}</span>
            {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
              <span className="comment-item__edited">(수정됨)</span>
            )}
            {(isAdmin() && <StatusBadge status={comment.status} />)}
            <CommentMoreDropdown
              editable={editable}
              deletable={deletable}
              hideable={hideable}
              currentStatus={comment.status}
              onEdit={() => onEdit(comment.id, comment.context)}
              onDelete={() => onDelete(comment.id)}
              onHide={(status) => onHide(comment.id, status)}
            />
          </div>

          <p className={`comment-item__content${
            comment.isDeleted || comment.status === 'HIDDEN'
              ? ' comment-item__content--muted'
              : ''
          }`}>
            {parseEmoticons(comment.context)}
          </p>


          <div className="comment-item__footer">
            {!comment.parentId && (
              <button
                type="button"
                onClick={() => onReply(comment.id, comment.authorName)}
                className="comment-item__reply-btn"
              >
                <MessageBox />
                <span>{comment.children?.length ?? 0}</span>
              </button>
            )}
            <button type="button" className={`comment-item__like-btn${comment.isLiked ? ' comment-item__like-btn--active' : ''}`} onClick={() => onToggleLike(comment.id)}>
              <Heart filled={comment.isLiked} />
              <span>{comment.likeCount}</span>
            </button>
          </div>
        </div>
      </div>

      {replyTargetId === comment.id && (
        <div ref={replyInputRef} className="comment-reply-input">
          <p className="comment-reply-input__label">@{replyTargetName} 에게 답글</p>
          <CommentInput
            value={replyContext}
            onChange={setReplyContext}
            onSubmit={onSubmitReply}
            placeholder={`@${replyTargetName}에게 답글을 남기세요.`}
            isSubmitting={isReplySubmitting}
            buttonLabel="답글 등록"
            showAvatar={true} // [수정] 답글창에도 아바타를 보여주려면 true
            profileImage={myProfileImage} // [추가] 내 사진 전달
            profileDecoration={myProfileDecoration}
          />
          <button type="button" onClick={onCancelReply} className="comment-reply-input__cancel">취소</button>
        </div>
      )}
    </>
  );
}

function CommentSection({ boardId }: CommentSectionProps) {
  const [comments, setComments] = useState<(CommentResponse)[]>([]);
  const [sortType, setSortType] = useState<CommentSortType>('latest');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newContext, setNewContext] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyTargetId, setReplyTargetId] = useState<number | null>(null);
  const [replyTargetName, setReplyTargetName] = useState('');
  const [replyContext, setReplyContext] = useState('');
  const [isReplySubmitting, setIsReplySubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContext, setEditContext] = useState('');
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const replyInputRef = useRef<HTMLDivElement | null>(null);
  const commentsRequestIdRef = useRef(0);

  // [추가] 내 프로필 이미지 상태
  const [myProfileImage, setMyProfileImage] = useState<string | null>(null);
  const [myProfileDecoration, setMyProfileDecoration] = useState<string | null>(null);

  useEffect(() => { fetchComments(); }, [boardId]);

  // [추가] 내 프로필 정보를 가져오는 이펙트 (MyPagePoint 방식)
  useEffect(() => {
    const fetchMyInfo = async () => {
      try {
        if (isLoggedIn()) {
          const res = await getMyPageInfo();
          if (res.success && res.data) {
            setMyProfileImage(res.data.profileImage ?? null);
            setMyProfileDecoration(res.data.profileDecoration ?? null);
          }
        }
      } catch (error) {
        console.error("내 프로필 정보 로드 실패:", error);
      }
    };
    fetchMyInfo();
    const handleProfileUpdated = (event: Event) => {
      const detail = (event as CustomEvent<Record<string, unknown> | null>).detail;
      setMyProfileImage((detail?.profileImage as string | null) ?? null);
      setMyProfileDecoration((detail?.profileDecoration as string | null) ?? null);
    };
    window.addEventListener(PROFILE_UPDATED_EVENT, handleProfileUpdated);
    return () => window.removeEventListener(PROFILE_UPDATED_EVENT, handleProfileUpdated);
  }, []);

  const fetchComments = async () => {
    const requestId = ++commentsRequestIdRef.current;
    const requestedBoardId = boardId;
    try {
      setLoading(true);
      setError(null);
      const res = await getCommentsAPI(requestedBoardId);
      if (commentsRequestIdRef.current !== requestId || boardId !== requestedBoardId) return;
      if (res.success) setComments(res.comments as (CommentResponse)[]);
      else setError(res.message);
    } catch {
      if (commentsRequestIdRef.current === requestId) {
        setError('댓글을 불러오는 중 오류가 발생했습니다.');
      }
    } finally {
      if (commentsRequestIdRef.current === requestId) setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newContext.trim() || isSubmitting) return;
    try {
      setIsSubmitting(true);
      const res = await createCommentAPI(boardId, { context: newContext.trim(), parentId: null });
      if (res.success) { setNewContext(''); await fetchComments(); }
      else alert(res.message || '댓글 작성에 실패했습니다.');
    } catch { alert('댓글 작성 중 오류가 발생했습니다.'); }
    finally { setIsSubmitting(false); }
  };

  const handleOpenReply = (parentId: number, authorName: string) => {
    setReplyTargetId(parentId);
    setReplyTargetName(authorName);
    setReplyContext('');
    setTimeout(() => replyInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
  };

  const handleSubmitReply = async () => {
    if (!replyContext.trim() || replyTargetId === null || isReplySubmitting) return;
    try {
      setIsReplySubmitting(true);
      const res = await createCommentAPI(boardId, { context: replyContext.trim(), parentId: replyTargetId });
      if (res.success) { setReplyTargetId(null); setReplyContext(''); await fetchComments(); }
      else alert(res.message || '답글 작성에 실패했습니다.');
    } catch { alert('답글 작성 중 오류가 발생했습니다.'); }
    finally { setIsReplySubmitting(false); }
  };

  const handleOpenEdit = (commentId: number, currentContext: string) => {
    setEditingId(commentId);
    setEditContext(currentContext);
  };

  const handleSubmitEdit = async () => {
    if (!editContext.trim() || editingId === null || isEditSubmitting) return;
    try {
      setIsEditSubmitting(true);
      const res = await updateCommentAPI(editingId, { context: editContext.trim() });
      if (res.success) { setEditingId(null); setEditContext(''); await fetchComments(); }
      else alert(res.message || '댓글 수정에 실패했습니다.');
    } catch { alert('댓글 수정 중 오류가 발생했습니다.'); }
    finally { setIsEditSubmitting(false); }
  };

  const handleDelete = async (commentId: number) => {
    if (!window.confirm('댓글을 삭제하시겠습니까?')) return;
    try {
      const res = await deleteCommentAPI(commentId);
      if (res.success) await fetchComments();
      else alert(res.message || '댓글 삭제에 실패했습니다.');
    } catch { alert('댓글 삭제 중 오류가 발생했습니다.'); }
  };

  const handleHide = async (commentId: number, status: CommentStatus) => {
    try {
      const res = await updateCommentStatusAPI(commentId, { status });
      if (res.success) await fetchComments();
      else alert(res.message || '댓글 상태 변경에 실패했습니다.');
    } catch { alert('댓글 상태 변경 중 오류가 발생했습니다.'); }
  };

  const updateCommentLike = (list: CommentResponse[], commentId: number, likeCount: number, isLiked: boolean): CommentResponse[] =>
    list.map(c => {
      if (c.id === commentId) return { ...c, likeCount, isLiked };
      if (c.children?.length) return { ...c, children: updateCommentLike(c.children, commentId, likeCount, isLiked) };
      return c;
    });

  const handleToggleLike = async (commentId: number) => {
    try {
      const res = await toggleCommentLike(commentId);
      if (res.success && res.data) {
        const liked = res.data.isLiked ?? (res.data as any).liked ?? false;
        setComments(prev => updateCommentLike(prev, commentId, res.data.likeCount, liked));
      }
    } catch { /* 비로그인 등 */ }
  };

  const countAll = (list: (CommentResponse)[]): number =>
    list.reduce((n, c) => n + 1 + countAll((c.children ?? []) as (CommentResponse)[]), 0);

  const totalCount = countAll(comments);
  const sortedComments = useMemo(
    () => sortCommentsTree(comments, sortType),
    [comments, sortType]
  );
  const flattenedComments = useMemo(
    () => flattenCommentsTree(sortedComments),
    [sortedComments]
  );
  const totalPages = Math.max(1, Math.ceil(flattenedComments.length / COMMENTS_PER_PAGE));
  const pagedComments = useMemo(() => {
    const startIndex = (currentPage - 1) * COMMENTS_PER_PAGE;
    return flattenedComments.slice(startIndex, startIndex + COMMENTS_PER_PAGE);
  }, [currentPage, flattenedComments]);

  useEffect(() => {
    setCurrentPage(1);
  }, [sortType, boardId]);

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  return (
    <section className="comment-section">
      <div className="comment-section__header">
        <h2 className="comment-section__title">댓글 {totalCount}</h2>
        <div className="comment-section__sort" role="tablist" aria-label="댓글 정렬">
          <button
            type="button"
            className={`comment-section__sort-btn${sortType === 'latest' ? ' comment-section__sort-btn--active' : ''}`}
            onClick={() => setSortType('latest')}
          >
            최신순
          </button>
          <button
            type="button"
            className={`comment-section__sort-btn${sortType === 'oldest' ? ' comment-section__sort-btn--active' : ''}`}
            onClick={() => setSortType('oldest')}
          >
            오래된순
          </button>
          <button
            type="button"
            className={`comment-section__sort-btn${sortType === 'likes' ? ' comment-section__sort-btn--active' : ''}`}
            onClick={() => setSortType('likes')}
          >
            좋아요순
          </button>
        </div>
      </div>

      <CommentInput
        value={newContext}
        onChange={setNewContext}
        onSubmit={handleSubmitComment}
        isSubmitting={isSubmitting}
        profileImage={myProfileImage}
        profileDecoration={myProfileDecoration}
      />

      {loading ? (
        <div className="comment-section__loading">로딩 중...</div>
      ) : error ? (
        <div className="comment-section__error">{error}</div>
      ) : comments.length === 0 ? (
        <div className="comment-section__empty">첫 번째 댓글을 남겨보세요.</div>
      ) : (
        <>
          <div className="comment-list">
            {pagedComments.map(({ comment, depth }) => (
              <div key={comment.id}>
              {editingId === comment.id ? (
                <div className="comment-edit">
                  <CommentInput
                    value={editContext}
                    onChange={setEditContext}
                    onSubmit={handleSubmitEdit}
                    isSubmitting={isEditSubmitting}
                    buttonLabel="저장"
                    showAvatar={false}
                  />
                  <button type="button" onClick={() => setEditingId(null)} className="comment-reply-input__cancel">취소</button>
                </div>
              ) : (
                <CommentItem
                  comment={comment}
                  depth={depth}
                  onReply={handleOpenReply}
                  onEdit={handleOpenEdit}
                  onDelete={handleDelete}
                  onHide={handleHide}
                  onToggleLike={handleToggleLike}
                  replyTargetId={replyTargetId}
                  replyTargetName={replyTargetName}
                  replyContext={replyContext}
                  setReplyContext={setReplyContext}
                  onSubmitReply={handleSubmitReply}
                  isReplySubmitting={isReplySubmitting}
                  onCancelReply={() => setReplyTargetId(null)}
                  replyInputRef={replyInputRef}
                  myProfileImage={myProfileImage} // [추가]
                  myProfileDecoration={myProfileDecoration}
                />
              )}
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="comment-pagination" aria-label="댓글 페이지네이션">
              <button
                type="button"
                className="comment-pagination__btn"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                aria-label="이전 페이지"
              >
                ‹
              </button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  className={`comment-pagination__num${page === currentPage ? ' comment-pagination__num--active' : ''}`}
                  onClick={() => setCurrentPage(page)}
                  aria-current={page === currentPage ? 'page' : undefined}
                >
                  {page}
                </button>
              ))}
              <button
                type="button"
                className="comment-pagination__btn"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                aria-label="다음 페이지"
              >
                ›
              </button>
            </div>
          )}
        </>
      )}

    </section>
  );
}

export default CommentSection;
