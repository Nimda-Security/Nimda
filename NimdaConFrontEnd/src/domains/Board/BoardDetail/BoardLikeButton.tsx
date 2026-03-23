import { useState } from 'react';
import { toggleBoardLikeAPI } from '@/api/board';
import './BoardLikeButton.css';

interface BoardLikeButtonProps {
  boardId: number;
  initialLikeCount: number;
  initialIsLiked: boolean;
  onLikeChange?: (likeCount: number, isLiked: boolean) => void;
}

function BoardLikeButton({ boardId, initialLikeCount, initialIsLiked, onLikeChange }: BoardLikeButtonProps) {
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = async () => {
    if (isToggling) return;
    try {
      setIsToggling(true);
      const res = await toggleBoardLikeAPI(boardId);
      if (res.success && 'data' in res) {
        const liked = res.data.isLiked ?? (res.data as any).liked ?? false;
        setLikeCount(res.data.likeCount);
        setIsLiked(liked);
        onLikeChange?.(res.data.likeCount, liked);
      } else {
        alert(res.message || '좋아요 처리에 실패했습니다.');
      }
    } catch {
      alert('좋아요 처리 중 오류가 발생했습니다.');
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div className="board-like-area">
      <button
        type="button"
        onClick={handleToggle}
        disabled={isToggling}
        className={`board-like-btn ${isLiked ? 'is-liked' : ''}`}
      >
        {isLiked ? (
          <img src="/like-active.svg" alt="좋아요 취소" width={52} height={52} />
        ) : (
          <img src="/like-inactive.svg" alt="좋아요" width={52} height={52} />
        )}
        <span className="board-like-count">{likeCount}</span>
      </button>
    </div>
  );
}

export default BoardLikeButton;