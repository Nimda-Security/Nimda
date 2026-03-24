import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MessageBox } from '@/components/icons/MessageBox';
import { VerticalDots } from '@/components/icons/VerticalDots';
import Layout from '@/components/Layout';
import { openAttachmentDownloadInNewTab } from '@/api/attachments';
import { getBoardDetailAPI, deleteBoardAPI, getFileDownloadURL, getBoardLikeStatusAPI } from '@/api/board';
import { getAllCategoriesAPI } from '@/api/category';
import { hasRole, isAdmin } from '@/utils/jwt';
import type { Board } from '../types';
import CommentSection from '@/domains/Comment';
import BoardLikeButton from './BoardLikeButton';
import { Heart } from '@/components/icons/Heart';
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

  useEffect(() => { if (id) fetchBoard(parseInt(id)); }, [id]);

  const fetchBoard = async (boardId: number) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getBoardDetailAPI(boardId);
      if (res.success && 'board' in res) {
        const boardData = res.board;

        // "카르텔" 카테고리 접근 권한 확인
        if (boardData.category) {
          let isCartel = boardData.category.name === '카르텔';
          if (!isCartel && boardData.category.parentId) {
            const allCats = await getAllCategoriesAPI();
            const parent = allCats.find(c => c.id === boardData.category.parentId);
            if (parent && parent.name === '카르텔') isCartel = true;
          }
          if (isCartel && !hasRole('ROLE_CARTEL') && !isAdmin()) {
            alert('접근 권한이 없습니다.');
            navigate('/');
            return;
          }
        }

        setBoard(boardData);
        await fetchLikeStatus(boardId);
      } else {
        // 백엔드에서 403 반환한 경우
        if (res.message === '접근 권한이 없습니다.') {
          alert('접근 권한이 없습니다.');
          navigate('/');
          return;
        }
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
        setIsLiked(res.data.isLiked ?? (res.data as any).liked ?? false);
      }
    } catch { /* 비로그인 상태 */ }
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

  /** 레거시(로컬 filepath) 첨부만 사용 — S3·Attachment 첨부는 attachments[].downloadUrl 사용 */
  const handleLegacyFileDownload = () => {
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
            <img
              src="/default_user_profile.png"
              alt=""
              className="board-detail__avatar"
              style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
            />
            <span className="board-detail__author">{board.author?.nickname ?? '알 수 없음'}</span>
            <span className="board-detail__date">{fmtDate(board.createdAt)}</span>
            <span className="board-detail__date">{fmtTime(board.createdAt)}</span>

            <div className="board-detail__stats">
              <span className="board-detail__stat-comments">
                <MessageBox />
                {board.commentCount ?? 0}
              </span>
              <span className="board-detail__stat-likes">
                <Heart filled={isLiked} />
                {likeCount}
              </span>
            </div>

            {/* 첨부는 본문 아래 attachments 블록으로 이동 — 메타 행은 유지(더보기만) */}
            <button type="button" className="board-detail__more-btn" aria-label="더보기">
              <VerticalDots size={24} />
            </button>
          </div>
        </header>

        <hr className="board-detail__divider" />

        {/* Body */}
        <div className="board-detail__body" dangerouslySetInnerHTML={{ __html: board.content }} />

        {/* S3·Attachment 연동 첨부 목록 (상세 API board.attachments) */}
        {board.attachments && board.attachments.length > 0 && (
          <section className="board-detail__attachments" aria-label="첨부파일">
            <h2 className="board-detail__attachments-title">첨부파일</h2>
            <ul className="board-detail__attachments-list">
              {board.attachments.map((att) => (
                <li key={att.id}>
                  <a
                    href="#"
                    className="board-detail__attachments-link"
                    onClick={(e) => {
                      e.preventDefault();
                      void openAttachmentDownloadInNewTab(att.id).then((r) => {
                        if (!r.ok) alert(r.message);
                      });
                    }}
                  >
                    📎 {att.originFilename ?? `첨부 #${att.id}`}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 레거시 단일 첨부(board-uploads 등) — attachments가 없을 때만 표시 */}
        {(!board.attachments || board.attachments.length === 0) && board.filename && board.filepath && (
          <section className="board-detail__attachments board-detail__attachments--legacy" aria-label="첨부파일">
            <button type="button" onClick={handleLegacyFileDownload} className="board-detail__file-btn">
              📎 첨부파일 ({board.filename.includes('_') ? board.filename.split('_').slice(1).join('_') : board.filename})
            </button>
          </section>
        )}

        {/* 좋아요 */}
        <BoardLikeButton
          boardId={board.id}
          initialLikeCount={likeCount}
          initialIsLiked={isLiked}
          onLikeChange={(count, liked) => {
            setLikeCount(count);
            setIsLiked(liked);
          }}
        />

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
