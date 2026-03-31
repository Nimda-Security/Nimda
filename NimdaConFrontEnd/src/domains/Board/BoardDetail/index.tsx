import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { MessageBox } from '@/components/icons/MessageBox';
import { VerticalDots } from '@/components/icons/VerticalDots';
import Layout from '@/components/Layout';
import { openAttachmentDownloadInNewTab } from '@/api/attachments';
import {
  getBoardDetailAPI,
  deleteBoardAPI,
  getFileDownloadURL,
  getBoardLikeStatusAPI,
} from '@/api/board';
import { getAllCategoriesAPI } from '@/api/category';
import { hasRole, isAdmin, getCurrentNickname } from '@/utils/jwt';
import type { Board } from '../types';
import CommentSection from '@/domains/Comment';
import BoardLikeButton from './BoardLikeButton';
import Avatar from '@/components/Avatar/Avatar';
import { Heart } from '@/components/icons/Heart';
import { highlightCodeBlocks } from '@/utils/codeHighlight';
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);

  useEffect(() => {
    if (id) fetchBoard(parseInt(id));
  }, [id]);

  useEffect(() => {
    const body = document.querySelector('.board-detail__body');
    if (body) {
      highlightCodeBlocks(body);
    }
  }, [board?.content]);

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
            const parent = allCats.find(
              (c) => c.id === boardData.category.parentId
            );
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
    } catch {
      setError('게시글을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchLikeStatus = async (boardId: number) => {
    try {
      const res = await getBoardLikeStatusAPI(boardId);
      if (res.success && 'data' in res) {
        setLikeCount(res.data.likeCount);
        setIsLiked(res.data.isLiked ?? (res.data as any).liked ?? false);
      }
    } catch {
      /* 비로그인 상태 */
    }
  };

  const handleGoBack = () => {
    if (board?.category?.slug) navigate(`/board/${board.category.slug}`);
    else if (boardType) navigate(`/board/${boardType}`);
    else navigate('/');
  };

  const handleEdit = () => {
    if (board)
      navigate(`/board/${board.category?.slug || boardType}/edit/${board.id}`);
  };

  const handleDelete = async () => {
    if (!board || !window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      setIsDeleting(true);
      const res = await deleteBoardAPI(board.id);
      if (res.success) {
        alert('게시글이 삭제되었습니다.');
        handleGoBack();
      } else alert(res.message || '게시글 삭제에 실패했습니다.');
    } catch {
      alert('게시글 삭제 중 오류가 발생했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  /** 레거시(로컬 filepath) 첨부만 사용 — S3·Attachment 첨부는 attachments[].downloadUrl 사용 */
  const handleLegacyFileDownload = () => {
    if (board?.filepath) {
      const url = getFileDownloadURL(board.filepath);
      if (url) window.open(url, '_blank');
    }
  };

  const isAuthor = () =>
    !!board &&
    !!board.author?.nickname &&
    board.author.nickname === getCurrentNickname();

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
        <div className="board-detail__status board-detail__status--loading">
          로딩 중...
        </div>
      </Layout>
    );
  }

  if (error || !board) {
    return (
      <Layout>
        <div className="board-detail__status">
          <p className="board-detail__status--error">
            {error || '게시글을 찾을 수 없습니다.'}
          </p>
          <button
            type="button"
            onClick={handleGoBack}
            className="board-detail__btn board-detail__btn--edit"
          >
            목록으로
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div>
        {/* Head */}
        <header className="board-detail__head">
          <button
            type="button"
            onClick={handleGoBack}
            className="board-detail__back"
          >
            ← {board.category?.name ?? boardType ?? '게시판'}
          </button>

          <div className="board-detail__title-row">
            <h1 className="board-detail__title">{board.title}</h1>
            {/* 작성자 또는 어드민만 점 세 개 버튼 표시 */}
            {(isAuthor() || isAdmin()) && (
              <div className="board-detail__menu-wrap">
                <button
                  type="button"
                  className="board-detail__more-btn"
                  aria-label="더보기"
                  onClick={() => setMenuOpen((prev) => !prev)}
                >
                  <VerticalDots size={24} />
                </button>
                {menuOpen && (
                  <ul className="board-detail__menu">
                    {isAuthor() && (
                      <li>
                        <button
                          type="button"
                          onClick={() => {
                            setMenuOpen(false);
                            handleEdit();
                          }}
                        >
                          수정
                        </button>
                      </li>
                    )}
                    <li>
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          void handleDelete();
                        }}
                        disabled={isDeleting}
                      >
                        {isDeleting ? '삭제 중...' : '삭제'}
                      </button>
                    </li>
                  </ul>
                )}
              </div>
            )}
          </div>

          <div className="board-detail__meta">
            <Avatar
              src={board.author?.profileImage}
              size={40}
              className="board-detail__avatar"
            />
            <div className="board-detail__meta-info">
              <Link
                to={
                  board.author?.nickname
                    ? `/user/${board.author.nickname}`
                    : '#'
                }
                className="board-detail__author"
              >
                {board.author?.nickname ?? '알 수 없음'}
              </Link>
              <div className="board-detail__meta-sub">
                <span className="board-detail__date">
                  {fmtDate(board.createdAt)} {fmtTime(board.createdAt)}
                </span>
                <span className="board-detail__stat-comments">
                  <MessageBox />
                  {board.commentCount ?? 0}
                </span>
                <span className="board-detail__stat-likes">
                  <Heart filled={isLiked} />
                  {likeCount}
                </span>
              </div>
            </div>
          </div>
        </header>

        <hr className="board-detail__divider" />

        {/* Body */}
        <div
          className="board-detail__body"
          dangerouslySetInnerHTML={{ __html: board.content }}
        />

        {/* 첨부파일 버튼 — S3 또는 레거시 첨부가 있을 때만 표시 */}
        {((board.attachments && board.attachments.length > 0) ||
          ((!board.attachments || board.attachments.length === 0) &&
            board.filename &&
            board.filepath)) && (
          <div className="board-detail__attachment-wrap">
            <button
              type="button"
              className="board-detail__attachment-toggle"
              onClick={() => setShowAttachments((prev) => !prev)}
            >
              📎 첨부파일
              {board.attachments && board.attachments.length > 0
                ? ` (${board.attachments.length})`
                : ' (1)'}
              <span
                className={`board-detail__attachment-arrow ${showAttachments ? 'board-detail__attachment-arrow--open' : ''}`}
              >
                ▾
              </span>
            </button>

            {showAttachments && (
              <div className="board-detail__attachment-dropdown">
                {/* S3·Attachment 연동 */}
                {board.attachments && board.attachments.length > 0 && (
                  <ul className="board-detail__attachments-list">
                    {board.attachments.map((att) => (
                      <li key={att.id}>
                        <a
                          href="#"
                          className="board-detail__attachments-link"
                          onClick={(e) => {
                            e.preventDefault();
                            void openAttachmentDownloadInNewTab(att.id).then(
                              (r) => {
                                if (!r.ok) alert(r.message);
                              }
                            );
                          }}
                        >
                          📎 {att.originFilename ?? `첨부 #${att.id}`}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}

                {/* 레거시 단일 첨부 */}
                {(!board.attachments || board.attachments.length === 0) &&
                  board.filename &&
                  board.filepath && (
                    <ul className="board-detail__attachments-list">
                      <li>
                        <a
                          href="#"
                          className="board-detail__attachments-link"
                          onClick={(e) => {
                            e.preventDefault();
                            handleLegacyFileDownload();
                          }}
                        >
                          📎{' '}
                          {board.filename.includes('_')
                            ? board.filename.split('_').slice(1).join('_')
                            : board.filename}
                        </a>
                      </li>
                    </ul>
                  )}
              </div>
            )}
          </div>
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
      </div>
    </Layout>
  );
}

export default BoardDetailPage;
