package com.nimda.cite.like.repository;

import com.nimda.cite.board.entity.Board;
import com.nimda.cite.like.entity.BoardLike;
import com.nimda.cup.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BoardLikeRepository extends JpaRepository<BoardLike, Long> {
        // 특정 게시글의 좋아요 총 개수 조회
        long countByBoardId(Long boardId);

        // 현재 로그인한 사용자가 이 글에 좋아요를 눌렀는지 확인
        boolean existsByBoardIdAndLikerId(Long boardId, Long userId);

        // 자신이 받은 게시글 좋아요 카운트
        @Query("SELECT COUNT(bl) FROM BoardLike bl WHERE bl.author.id = :authorId")
        long countTotalLikesByAuthorId(@Param("authorId") Long authorId);

        Optional<BoardLike> findByBoardAndLiker(Board board, User user);

        @Query("SELECT bl FROM BoardLike bl JOIN FETCH bl.board WHERE bl.liker.id = :userId")
        List<BoardLike> findAllByLikerId(@Param("userId") Long userId);

    }