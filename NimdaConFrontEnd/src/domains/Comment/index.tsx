import { useEffect, useState, useRef } from 'react';
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

// =============== 타입 ===============

interface CommentSectionProps {
  boardId: number;
  isAdmin?: boolean;
}

// =============== 서브 컴포넌트 ===============

/** 프로필 아바타 */
function Avatar({ src, name }: { src: string | null; name: string }) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className="w-9 h-9 rounded-full object-cover flex-shrink-0 border border-gray-100"
      />
    );
  }
  return (
    <div className="w-9 h-9 rounded-full flex-shrink-0 bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-500 border border-gray-100">
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
  dislikeCount: number;
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
function CommentInput({
  value,
  onChange,
  onSubmit,
  placeholder,
  isSubmitting,
  buttonLabel = '등록',
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  isSubmitting: boolean;
  buttonLabel?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <textarea
        id="comment-input"
        name="comment-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? '댓글을 입력하세요.'}
        rows={3}
        className="w-full border border-[#d4d4d4] rounded-[4px] px-3 py-2 text-[12px] font-['Pretendard:Medium',sans-serif] text-[#0c0c0c] resize-none focus:outline-none focus:border-[#4a7fcc] transition-colors"
      />
      <div className="flex justify-end">
        <button
          onClick={onSubmit}
          disabled={isSubmitting || !value.trim()}
          className="px-4 py-1.5 bg-[#0c0c0c] text-white text-[12px] font-['Pretendard:Medium',sans-serif] rounded-[8px] hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? '처리 중...' : buttonLabel}
        </button>
      </div>
    </div>
  );
}

/** 어드민 상태 배지 */
function StatusBadge({ status }: { status: CommentStatus }) {
  const map: Record<CommentStatus, { label: string; className: string }> = {
    PUBLIC: { label: '공개', className: 'bg-green-100 text-green-700' },
    PRIVATE: { label: '비공개', className: 'bg-yellow-100 text-yellow-700' },
    DELETED: { label: '삭제됨', className: 'bg-red-100 text-red-700' },
    HIDDEN: { label: '숨김', className: 'bg-gray-100 text-gray-500' },
  };
  const { label, className } = map[status] ?? map.PUBLIC;
  return (
    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${className}`}>
      {label}
    </span>
  );
}

// =============== 단일 댓글 아이템 ===============

interface CommentItemProps {
  comment: CommentUserResponse | CommentAdminResponse;
  isAdmin: boolean;
  onReply: (parentId: number, authorName: string) => void;
  onEdit: (commentId: number, currentContext: string) => void;
  onDelete: (commentId: number) => void;
  onHide: (commentId: number, status: CommentStatus) => void;
  depth?: number;
}

function CommentItem({
  comment,
  isAdmin,
  onReply,
  onEdit,
  onDelete,
  onHide,
  depth = 0,
}: CommentItemProps) {
  const adminComment = isAdmin ? (comment as CommentAdminResponse) : null;
  const userComment = !isAdmin ? (comment as CommentUserResponse) : null;

  const isDeleted = comment.isDeleted;
  const isHidden = adminComment?.status === 'HIDDEN';

  return (
    <div style={{ marginLeft: depth > 0 ? '5%' : '0' }}>
      <div className="flex gap-3 py-3">
        <Avatar src={comment.authorProfileImage} name={comment.authorName} />

        <div className="flex-1 min-w-0">
          {/* 메타 정보 */}
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-sm font-semibold text-gray-800">
              {comment.authorName}
            </span>
            {adminComment && (
              <span className="text-xs text-gray-400">
                (ID: {adminComment.authorId})
              </span>
            )}
            <span className="text-xs text-gray-400">
              {new Date(comment.createdAt).toLocaleString('ko-KR', {
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
            {adminComment && <StatusBadge status={adminComment.status} />}
          </div>

          {/* 본문 */}
          {isDeleted ? (
            <p className="text-sm text-gray-400 italic">삭제된 댓글입니다.</p>
          ) : isHidden ? (
            <p className="text-sm text-gray-400 italic">숨겨진 댓글입니다.</p>
          ) : (
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
              {comment.context}
            </p>
          )}

          {/* 액션 버튼 */}
          {!isDeleted && (
            <div className="flex items-center gap-3 mt-2">
              <EngagementButtons
                likeCount={comment.likeCount}
                dislikeCount={0}
                replyCount={comment.children?.length || 0}
                onReply={() => onReply(comment.id, comment.authorName)}
              />
              {userComment?.editable && (
                <button
                  onClick={() => onEdit(comment.id, comment.context)}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  수정
                </button>
              )}
              {userComment?.deletable && (
                <button
                  onClick={() => onDelete(comment.id)}
                  className="text-xs text-gray-400 hover:text-red-400 transition-colors"
                >
                  삭제
                </button>
              )}
              {adminComment?.hideable && (
                <button
                  onClick={() =>
                    onHide(
                      comment.id,
                      adminComment.status === 'HIDDEN' ? 'PUBLIC' : 'HIDDEN'
                    )
                  }
                  className="text-xs text-gray-400 hover:text-yellow-500 transition-colors"
                >
                  {adminComment.status === 'HIDDEN' ? '숨김 해제' : '숨김'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 대댓글 재귀 렌더링 */}
      {comment.children && comment.children.length > 0 && (
        <div>
          {(comment.children as (CommentUserResponse | CommentAdminResponse)[]).map(
            (child) => (
              <CommentItem
                key={child.id}
                comment={child}
                isAdmin={isAdmin}
                onReply={onReply}
                onEdit={onEdit}
                onDelete={onDelete}
                onHide={onHide}
                depth={depth + 1}
              />
            )
          )}
        </div>
      )}
    </div>
  );
}

// =============== 메인 컴포넌트 ===============

function CommentSection({ boardId, isAdmin = false }: CommentSectionProps) {
  const [comments, setComments] = useState<
    (CommentUserResponse | CommentAdminResponse)[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 새 댓글 입력
  const [newContext, setNewContext] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 답글 상태
  const [replyTargetId, setReplyTargetId] = useState<number | null>(null);
  const [replyTargetName, setReplyTargetName] = useState('');
  const [replyContext, setReplyContext] = useState('');
  const [isReplySubmitting, setIsReplySubmitting] = useState(false);

  // 수정 상태
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContext, setEditContext] = useState('');
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);

  const replyInputRef = useRef<HTMLDivElement | null>(null);

  // ── 댓글 목록 조회 ──
  useEffect(() => {
    fetchComments();
  }, [boardId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getCommentsAPI(boardId);

      if (response.success) {
        setComments(response.comments as (CommentUserResponse | CommentAdminResponse)[]);
      } else {
        setError(response.message);
      }
    } catch {
      setError('댓글을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // ── 댓글 작성 ──
  const handleSubmitComment = async () => {
    if (!newContext.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const request: CommentCreateRequest = { context: newContext.trim(), parentId: null };
      const response = await createCommentAPI(boardId, request);

      if (response.success) {
        setNewContext('');
        await fetchComments();
      } else {
        alert(response.message || '댓글 작성에 실패했습니다.');
      }
    } catch {
      alert('댓글 작성 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── 답글 열기 ──
  const handleOpenReply = (parentId: number, authorName: string) => {
    setReplyTargetId(parentId);
    setReplyTargetName(authorName);
    setReplyContext('');
    setTimeout(() => {
      replyInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
  };

  // ── 답글 작성 ──
  const handleSubmitReply = async () => {
    if (!replyContext.trim() || replyTargetId === null || isReplySubmitting) return;

    try {
      setIsReplySubmitting(true);
      const request: CommentCreateRequest = {
        context: replyContext.trim(),
        parentId: replyTargetId,
      };
      const response = await createCommentAPI(boardId, request);

      if (response.success) {
        setReplyTargetId(null);
        setReplyContext('');
        await fetchComments();
      } else {
        alert(response.message || '답글 작성에 실패했습니다.');
      }
    } catch {
      alert('답글 작성 중 오류가 발생했습니다.');
    } finally {
      setIsReplySubmitting(false);
    }
  };

  // ── 수정 열기 ──
  const handleOpenEdit = (commentId: number, currentContext: string) => {
    setEditingId(commentId);
    setEditContext(currentContext);
  };

  // ── 수정 저장 ──
  const handleSubmitEdit = async () => {
    if (!editContext.trim() || editingId === null || isEditSubmitting) return;

    try {
      setIsEditSubmitting(true);
      const response = await updateCommentAPI(editingId, { context: editContext.trim() });

      if (response.success) {
        setEditingId(null);
        setEditContext('');
        await fetchComments();
      } else {
        alert(response.message || '댓글 수정에 실패했습니다.');
      }
    } catch {
      alert('댓글 수정 중 오류가 발생했습니다.');
    } finally {
      setIsEditSubmitting(false);
    }
  };

  // ── 삭제 ──
  const handleDelete = async (commentId: number) => {
    if (!window.confirm('댓글을 삭제하시겠습니까?')) return;

    try {
      const response = await deleteCommentAPI(commentId);
      if (response.success) {
        await fetchComments();
      } else {
        alert(response.message || '댓글 삭제에 실패했습니다.');
      }
    } catch {
      alert('댓글 삭제 중 오류가 발생했습니다.');
    }
  };

  // ── 어드민 숨김 ──
  const handleHide = async (commentId: number, status: CommentStatus) => {
    try {
      const request: CommentStatusUpdateRequest = { status };
      const response = await updateCommentStatusAPI(commentId, request);
      if (response.success) {
        await fetchComments();
      } else {
        alert(response.message || '댓글 상태 변경에 실패했습니다.');
      }
    } catch {
      alert('댓글 상태 변경 중 오류가 발생했습니다.');
    }
  };

  // ── 총 댓글 수 (대댓글 포함) ──
  const countAllComments = (
    list: (CommentUserResponse | CommentAdminResponse)[]
  ): number => {
    return list.reduce((acc, c) => {
      const children = (c.children ?? []) as (CommentUserResponse | CommentAdminResponse)[];
      return acc + 1 + countAllComments(children);
    }, 0);
  };

  const totalCount = countAllComments(comments);

  // ── 렌더 ──
  return (
    <section className="mt-8 border-t border-gray-200 pt-6">
      {/* 헤더 */}
      <h2 className="text-sm font-semibold text-gray-700 mb-4">
        댓글 <span className="text-gray-400 font-normal">{totalCount}</span>
      </h2>

      {/* 새 댓글 입력 */}
      <div className="mb-6">
        <CommentInput
          value={newContext}
          onChange={setNewContext}
          onSubmit={handleSubmitComment}
          isSubmitting={isSubmitting}
        />
      </div>

      {/* 댓글 목록 */}
      {loading ? (
        <div className="text-sm text-center text-gray-400 py-8">로딩 중...</div>
      ) : error ? (
        <div className="text-sm text-center text-red-400 py-8">{error}</div>
      ) : comments.length === 0 ? (
        <div className="text-sm text-center text-gray-400 py-8">
          첫 번째 댓글을 남겨보세요.
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {comments.map((comment) => (
            <div key={comment.id}>
              {/* 수정 중인 댓글 */}
              {editingId === comment.id ? (
                <div className="py-3">
                  <CommentInput
                    value={editContext}
                    onChange={setEditContext}
                    onSubmit={handleSubmitEdit}
                    isSubmitting={isEditSubmitting}
                    buttonLabel="저장"
                  />
                  <button
                    onClick={() => setEditingId(null)}
                    className="text-xs text-gray-400 hover:text-gray-600 mt-1"
                  >
                    취소
                  </button>
                </div>
              ) : (
                <CommentItem
                  comment={comment}
                  isAdmin={isAdmin}
                  onReply={handleOpenReply}
                  onEdit={handleOpenEdit}
                  onDelete={handleDelete}
                  onHide={handleHide}
                />
              )}

              {/* 답글 입력창 */}
              {replyTargetId === comment.id && (
                <div
                  ref={replyInputRef}
                  className="pl-12 pb-3 border-l-2 border-gray-100 ml-3"
                >
                  <p className="text-xs text-gray-400 mb-1">
                    @{replyTargetName} 에게 답글
                  </p>
                  <CommentInput
                    value={replyContext}
                    onChange={setReplyContext}
                    onSubmit={handleSubmitReply}
                    placeholder={`@${replyTargetName}에게 답글을 남기세요.`}
                    isSubmitting={isReplySubmitting}
                    buttonLabel="답글 등록"
                  />
                  <button
                    onClick={() => setReplyTargetId(null)}
                    className="text-xs text-gray-400 hover:text-gray-600 mt-1"
                  >
                    취소
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default CommentSection;