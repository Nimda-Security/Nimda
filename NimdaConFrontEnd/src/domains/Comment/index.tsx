import { useEffect, useState, useRef } from 'react';
import { Heart, MessageCircle, MoreVertical } from 'lucide-react';
import {
  getCommentsAPI,
  createCommentAPI,
  updateCommentAPI,
  deleteCommentAPI,
  updateCommentStatusAPI,
} from '@/api/comment';
import type {
  CommentUserResponse,
  CommentAdminResponse,
  CommentCreateRequest,
  CommentStatusUpdateRequest,
  CommentStatus,
} from '@/domains/Comment/types';
import './Comment.css';

interface CommentSectionProps {
  boardId: number;
  isAdmin?: boolean;
}

<<<<<<< HEAD
// =============== 서브 컴포넌트 ===============

/** 프로필 아바타 */
function Avatar({ src, name }: { src: string | null; name: string }) {
  const sizeClass = "w-10 h-10";

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizeClass} rounded-full object-cover flex-shrink-0 border border-gray-100`}
      />
    );
  }
  return (
    <div className={`${sizeClass} rounded-full flex-shrink-0 bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-500 border border-gray-100`}>
      {name.charAt(0)}
    </div>
  );
}

/** 좋아요/공감 그룹 */
function EngagementButtons({
  likeCount,
  onReply,
}: {
  likeCount: number;
  replyCount: number;
  onReply: () => void;
}) {
  return (
    <div className="flex items-center gap-4 mt-2">
      {/* 좋아요 */}
      <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-blue-400 transition-colors">
        <span>{likeCount}</span>
        <span>👍</span>
      </button>
            
      {/* 답글 */}
      <button
        onClick={onReply}
        className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
      >
        답글
      </button>
    </div>
  );
}

/** 댓글 입력 박스 */
=======
function CommentAvatar({ src, name }: { src: string | null; name: string }) {
  if (src) {
    return <img src={src} alt="" className="comment-item__avatar" />;
  }
  return (
    <div className="comment-item__avatar-placeholder">{name.charAt(0)}</div>
  );
}

>>>>>>> refad/doil/fe
function CommentInput({
  value,
  onChange,
  onSubmit,
  placeholder,
  isSubmitting,
  buttonLabel = '작성',
  showAvatar = true,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  isSubmitting: boolean;
  buttonLabel?: string;
  showAvatar?: boolean;
}) {
  return (
    <div className="comment-input">
      {showAvatar && <div className="comment-input__avatar">?</div>}
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
<<<<<<< HEAD
  const map: Record<CommentStatus, { label: string; className: string }> = {
    PUBLIC: { label: '공개', className: 'bg-green-100 text-green-700' },
    DELETED: { label: '삭제됨', className: 'bg-red-100 text-red-700' },
    HIDDEN: { label: '숨김', className: 'bg-gray-100 text-gray-500' },
=======
  const map: Record<CommentStatus, { label: string; mod: string }> = {
    PUBLIC: { label: '공개', mod: '--public' },
    PRIVATE: { label: '비공개', mod: '--private' },
    DELETED: { label: '삭제됨', mod: '--deleted' },
    HIDDEN: { label: '숨김', mod: '--hidden' },
>>>>>>> refad/doil/fe
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

interface CommentItemProps {
  comment: CommentUserResponse | CommentAdminResponse;
  isAdmin: boolean;
  onReply: (parentId: number, authorName: string) => void;
  onEdit: (commentId: number, currentContext: string) => void;
  onDelete: (commentId: number) => void;
  onHide: (commentId: number, status: CommentStatus) => void;
  depth?: number;
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
  isAdmin,
  onReply,
  onEdit,
  onDelete,
  onHide,
  depth = 0,
  replyTargetId,
  replyTargetName,
  replyContext,
  setReplyContext,
  onSubmitReply,
  isReplySubmitting,
  onCancelReply,
  replyInputRef,
}: CommentItemProps) {
  const adminComment = isAdmin ? (comment as CommentAdminResponse) : null;
  const userComment = !isAdmin ? (comment as CommentUserResponse) : null;
  const isDeleted = comment.isDeleted;
  const isHidden = adminComment?.status === 'HIDDEN';

  const children = (comment.children ?? []) as (CommentUserResponse | CommentAdminResponse)[];

  return (
    <>
      <div className={`comment-item${depth > 0 ? ' comment-item--reply' : ''}`}>
        <CommentAvatar src={comment.authorProfileImage} name={comment.authorName} />
        <div className="comment-item__body">
          <div className="comment-item__header">
            <span className="comment-item__author">{comment.authorName}</span>
            <span className="comment-item__date">{formatCommentDate(comment.createdAt)}</span>
            {adminComment && <span className="comment-item__edited">(ID: {adminComment.authorId})</span>}
            {adminComment && <StatusBadge status={adminComment.status} />}
          </div>

          {isDeleted ? (
            <p className="comment-item__content comment-item__content--deleted">삭제된 댓글입니다.</p>
          ) : isHidden ? (
            <p className="comment-item__content comment-item__content--hidden">숨겨진 댓글입니다.</p>
          ) : (
            <p className="comment-item__content">{comment.context}</p>
          )}

          {!isDeleted && (
<<<<<<< HEAD
            <div className="flex items-center gap-3 mt-2">
              <EngagementButtons
                likeCount={comment.likeCount}
                replyCount={comment.children?.length || 0}
                onReply={() => onReply(comment.id, comment.authorName)}
              />
=======
            <div className="comment-item__footer">
              <button type="button" className="comment-item__like-btn">
                <Heart size={12} />
                <span>{comment.likeCount}</span>
              </button>
              <button
                type="button"
                onClick={() => onReply(comment.id, comment.authorName)}
                className="comment-item__reply-btn"
              >
                <MessageCircle size={12} />
                <span>답글</span>
              </button>
>>>>>>> refad/doil/fe
              {userComment?.editable && (
                <button type="button" onClick={() => onEdit(comment.id, comment.context)} className="comment-item__action">수정</button>
              )}
              {userComment?.deletable && (
                <button type="button" onClick={() => onDelete(comment.id)} className="comment-item__action comment-item__action--delete">삭제</button>
              )}
              {adminComment?.hideable && (
                <button
                  type="button"
                  onClick={() => onHide(comment.id, adminComment.status === 'HIDDEN' ? 'PUBLIC' : 'HIDDEN')}
                  className="comment-item__action"
                >
                  {adminComment.status === 'HIDDEN' ? '숨김 해제' : '숨김'}
                </button>
              )}
              <button type="button" className="comment-item__more" aria-label="더보기">
                <MoreVertical size={18} />
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
            isAdmin={isAdmin}
            onReply={onReply}
            onEdit={onEdit}
            onDelete={onDelete}
            onHide={onHide}
            depth={depth + 1}
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

function CommentSection({ boardId, isAdmin = false }: CommentSectionProps) {
  const [comments, setComments] = useState<(CommentUserResponse | CommentAdminResponse)[]>([]);
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
      if (res.success) setComments(res.comments as (CommentUserResponse | CommentAdminResponse)[]);
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

  const countAll = (list: (CommentUserResponse | CommentAdminResponse)[]): number =>
    list.reduce((n, c) => n + 1 + countAll((c.children ?? []) as (CommentUserResponse | CommentAdminResponse)[]), 0);

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
                  isAdmin={isAdmin}
                  onReply={handleOpenReply}
                  onEdit={handleOpenEdit}
                  onDelete={handleDelete}
                  onHide={handleHide}
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
