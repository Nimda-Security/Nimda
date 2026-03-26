import { useEffect, useState, useRef } from 'react';
import { Heart } from '@/components/icons/Heart';
import { MessageBox } from '@/components/icons/MessageBox';
import { VerticalDots } from '@/components/icons/VerticalDots';

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
import './Comment.css';

interface CommentSectionProps {
  boardId: number;
  isAdmin?: boolean;
}

function CommentAvatar({ src }: { src: string | null; name: string }) {
  return (
    <img
      src={src || "/default_user_profile.png"}
      alt=""
      className="comment-item__avatar"
    />
  );
}
function CommentInput({ 
  value,
  onChange,
  onSubmit,
  placeholder,
  isSubmitting,
  profileImage,
  buttonLabel = '작성',
  showAvatar = true,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  isSubmitting: boolean;
  profileImage?: string | null;
  buttonLabel?: string;
  showAvatar?: boolean;
}) {
return (
    <div className="comment-input">
      {showAvatar && (
        <div className="comment-input__avatar">
          {/* 하드코딩된 '?'를 지우고 이미지를 넣었습니다. */}
          <img
            src={profileImage || "/default_user_profile.png"}
            alt=""
            style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
          />
        </div>
      )}
      <div className="comment-input__body">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? '댓글을 입력하세요.'}
          rows={4}
          className="comment-input__textarea"
        />
        <div className="comment-input__footer">
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
    DELETED: { label: '삭제됨', mod: '--deleted' },
    HIDDEN: { label: '숨김', mod: '--hidden' },
  };
  const { label, mod } = map[status] ?? map.PUBLIC;
  return <span className={`comment-status-badge comment-status-badge${mod}`}>{label}</span>;
}

function formatCommentDate(dateStr: string) {
  const d = new Date(dateStr);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${m}. ${day}. ${h}:${min}`;
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
 
  // 외부 클릭 시 닫기
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
                <span className="comment-more__icon">✏️</span>
                수정
              </button>
            </li>
          )}
          {hideable && (
            <li role="menuitem">
              <button type="button" className="comment-more__item" onClick={handleToggleHide}>
                <span className="comment-more__icon">
                  {currentStatus === 'HIDDEN' ? '👁️' : '🚫'}
                </span>
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
                <span className="comment-more__icon">🗑️</span>
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
}

function CommentItem({
  comment,
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
}: CommentItemProps) {
  const isDeleted = comment.isDeleted;
  const isHidden = comment.status === 'HIDDEN';
  const isReply = comment.parentId !== null;
  const children = comment.children ?? [];

  const { editable, deletable, hideable } = comment;

  return (
    <>
      <div className={`comment-item${isReply ? ' comment-item--reply' : ''}`}>
        <CommentAvatar src={comment.authorProfileImage} name={comment.authorName} />
        <div className="comment-item__body">
          <div className="comment-item__header">
            <span className="comment-item__author">{comment.authorName}</span>
            <span className="comment-item__date">{formatCommentDate(comment.createdAt)}</span>
            {hideable && <StatusBadge status={comment.status} />}
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

          {isDeleted ? (
            <p className="comment-item__content comment-item__content--deleted">삭제된 댓글입니다.</p>
          ) : isHidden ? (
            <p className="comment-item__content comment-item__content--hidden">숨겨진 댓글입니다.</p>
          ) : (
            <p className="comment-item__content">{comment.context}</p>
          )}

          {!isDeleted && (
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
          )}
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
            showAvatar={false}
          />
          <button type="button" onClick={onCancelReply} className="comment-reply-input__cancel">취소</button>
        </div>
      )}

      {children.length > 0 &&
        children.map((child) => (
          <CommentItem
            key={child.id}
            comment={child}
            onReply={onReply}
            onEdit={onEdit}
            onDelete={onDelete}
            onHide={onHide}
            onToggleLike={onToggleLike}
            replyTargetId={replyTargetId}
            replyTargetName={replyTargetName}
            replyContext={replyContext}
            setReplyContext={setReplyContext}
            onSubmitReply={onSubmitReply}
            isReplySubmitting={isReplySubmitting}
            onCancelReply={onCancelReply}
            replyInputRef={replyInputRef}
          />
        ))}
    </>
  );
}

function CommentSection({ boardId }: CommentSectionProps) {
  const [comments, setComments] = useState<(CommentResponse)[]>([]);
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

  useEffect(() => { fetchComments(); }, [boardId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getCommentsAPI(boardId);
      if (res.success) setComments(res.comments as (CommentResponse)[]);
      else setError(res.message);
    } catch { setError('댓글을 불러오는 중 오류가 발생했습니다.'); }
    finally { setLoading(false); }
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

  return (
    <section className="comment-section">
      <h2 className="comment-section__title">댓글 {totalCount}</h2>

      {loading ? (
        <div className="comment-section__loading">로딩 중...</div>
      ) : error ? (
        <div className="comment-section__error">{error}</div>
      ) : comments.length === 0 ? (
        <div className="comment-section__empty">첫 번째 댓글을 남겨보세요.</div>
      ) : (
        <div className="comment-list">
          {comments.map((c) => (
            <div key={c.id}>
              {editingId === c.id ? (
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
                  comment={c}
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
                />
              )}
            </div>
          ))}
        </div>
      )}

      <CommentInput
        value={newContext}
        onChange={setNewContext}
        onSubmit={handleSubmitComment}
        isSubmitting={isSubmitting}
      />
    </section>
  );
}

export default CommentSection;
