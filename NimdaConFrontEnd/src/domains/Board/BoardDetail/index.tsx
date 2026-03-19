import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Heart, MessageCircle, MoreVertical } from 'lucide-react';
import Layout from '@/components/Layout';
import { getBoardDetailAPI, deleteBoardAPI, getFileDownloadURL, getBoardLikeStatusAPI, toggleBoardLikeAPI } from '@/api/board';
import type { Board } from '../types';
import CommentSection from '@/domains/Comment';
import './BoardDetail.css';

function BoardDetailPage() {
  const navigate = useNavigate();
  const { boardType, id } = useParams<{ boardType: string; id: string }>();

  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isTogglingLike, setIsTogglingLike] = useState(false);

  useEffect(() => { if (id) fetchBoard(parseInt(id)); }, [id]);

  const fetchBoard = async (boardId: number) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getBoardDetailAPI(boardId);
      if (res.success && 'board' in res) {
        setBoard(res.board);
        await fetchLikeStatus(boardId);
      } else {
        setError(res.message);
      }
    } catch { setError('게시글을 불러오는 중 오류가 발생했습니다.'); }
    finally { setLoading(false); }
  };

  const fetchLikeStatus = async (boardId: number) => {
    try {
      const res = await getBoardLikeStatusAPI(boardId);
      if (res.success && 'data' in res) {
        setLikeCount(res.data.likeCount);
        setIsLiked(res.data.isLiked);
      }
    } catch { /* 비로그인 상태 */ }
  };

  const handleToggleLike = async () => {
    if (!board || isTogglingLike) return;
    try {
      setIsTogglingLike(true);
      const res = await toggleBoardLikeAPI(board.id);
      if (res.success && 'data' in res) {
        setLikeCount(res.data.likeCount);
        setIsLiked(res.data.isLiked);
      } else {
        alert(res.message || '좋아요 처리에 실패했습니다.');
      }
    } catch { alert('좋아요 처리 중 오류가 발생했습니다.'); }
    finally { setIsTogglingLike(false); }
  };

  const handleGoBack = () => {
    if (board?.category?.slug) navigate(`/board/${board.category.slug}`);
    else if (boardType) navigate(`/board/${boardType}`);
    else navigate('/');
  };

  const handleEdit = () => {
    if (board) navigate(`/board/${board.category?.slug || boardType}/edit/${board.id}`);
  };

  const handleDelete = async () => {
    if (!board || !window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      setIsDeleting(true);
      const res = await deleteBoardAPI(board.id);
      if (res.success) { alert('게시글이 삭제되었습니다.'); handleGoBack(); }
      else alert(res.message || '게시글 삭제에 실패했습니다.');
    } catch { alert('게시글 삭제 중 오류가 발생했습니다.'); }
    finally { setIsDeleting(false); }
  };

  const handleFileDownload = () => {
    if (board?.filepath) {
      const url = getFileDownloadURL(board.filepath);
      if (url) window.open(url, '_blank');
    }
  };

  const isAuthor = () => !board ? false : false;

  const fmtDate = (s: string) => {
    const d = new Date(s);
    return `${String(d.getFullYear()).slice(2)}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
  };
  const fmtTime = (s: string) => {
    const d = new Date(s);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <Layout>
        <div className="board-detail__status board-detail__status--loading">로딩 중...</div>
      </Layout>
    );
  }

  if (error || !board) {
    return (
      <Layout>
        <div className="board-detail__status">
          <p className="board-detail__status--error">{error || '게시글을 찾을 수 없습니다.'}</p>
          <button type="button" onClick={handleGoBack} className="board-detail__btn board-detail__btn--edit">목록으로</button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div>
        <button type="button" onClick={handleGoBack} className="board-detail__back">← 목록으로 돌아가기</button>

        {/* Head */}
        <header className="board-detail__head">
          <p className="board-detail__category">{board.category?.name ?? boardType ?? '게시판'}</p>
          <h1 className="board-detail__title">{board.title}</h1>

          <div className="board-detail__meta">
            <div className="board-detail__avatar-placeholder">
              {board.author?.nickname?.charAt(0) ?? '?'}
            </div>
            <span className="board-detail__author">{board.author?.nickname ?? '알 수 없음'}</span>
            <span className="board-detail__date">{fmtDate(board.createdAt)}</span>
            <span className="board-detail__date">{fmtTime(board.createdAt)}</span>

            <div className="board-detail__stats">
              <span className="board-detail__stat-comments">
                <MessageCircle size={12} />
                {board.likeCount ?? 0}
              </span>
              <span className="board-detail__stat-likes">
                <Heart size={12} fill={isLiked ? 'currentColor' : 'none'} />
                {likeCount}
              </span>
            </div>

            {board.filename && (
              <button type="button" onClick={handleFileDownload} className="board-detail__file-btn">
                📎 첨부파일
              </button>
            )}
            <button type="button" className="board-detail__more-btn" aria-label="더보기">
              <MoreVertical size={20} />
            </button>
          </div>
        </header>

        <hr className="board-detail__divider" />

        {/* Body */}
        <div className="board-detail__body">{board.content}</div>

        {/* 좋아요 */}
        <div className="board-detail__like-area">
          <button type="button" onClick={handleToggleLike} disabled={isTogglingLike} className="board-detail__like-btn">
            <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
            <span className="board-detail__like-count">{likeCount}</span>
          </button>
        </div>

        {/* 댓글 */}
        <CommentSection boardId={board.id} />

        {/* 수정/삭제 */}
        {isAuthor() && (
          <footer className="board-detail__actions">
            <button type="button" onClick={handleEdit} className="board-detail__btn board-detail__btn--edit">수정</button>
            <button type="button" onClick={handleDelete} disabled={isDeleting} className="board-detail__btn board-detail__btn--delete">
              {isDeleting ? '삭제 중...' : '삭제'}
            </button>
          </footer>
        )}
      </div>
    </Layout>
  );
}

export default BoardDetailPage;
