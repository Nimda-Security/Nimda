package com.nimda.cite.like.repository;

import com.nimda.cite.board.entity.Board;
import com.nimda.cite.like.entity.BoardLike;
import com.nimda.cup.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BoardLikeRepository extends JpaRepository<BoardLike, Long> {
        // 특정 게시글의 좋아요 총 개수 조회
        long countByBoardId(Long boardId);

        // 현재 로그인한 사용자가 이 글에 좋아요를 눌렀는지 확인
        boolean existsByBoardIdAndUserId(Long boardId, Long userId);

        Optional<BoardLike> findByBoardAndUser(Board board, User user);
    }