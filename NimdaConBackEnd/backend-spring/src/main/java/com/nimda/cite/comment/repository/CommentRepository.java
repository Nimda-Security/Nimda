package com.nimda.cite.comment.repository;

import com.nimda.cite.comment.entity.Comment;
import com.nimda.cite.comment.enums.STATUS;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    // =============== READ ===============

    // 댓글 목록 조회
    // [사용] GET /api/cite/board/{boardId}/comments
    @Query("SELECT c FROM Comment c " +
            "JOIN FETCH c.author " +
            "LEFT JOIN FETCH c.parent " +
            "WHERE c.board.id = :boardId " +
            "ORDER BY c.createdAt ASC")
    List<Comment> findAllByBoardIdOrderByCreatedAtAsc(@Param("boardId") Long boardId);

    // 대댓글 목록 조회
    // [사용] GET /api/cite/board/{boardId}/comments/{parentId}/children
    @EntityGraph(attributePaths = {"author"})
    List<Comment> findByBoardIdAndParentIdOrderByCreatedAtAsc(Long boardId, Long parentId);

    // 단일 댓글 조회
    // [사용] 수정/삭제 권한 체크 시
    @EntityGraph(attributePaths = {"author"})
    Optional<Comment> findWithAuthorById(Long id);


    // =============== UPDATE ===============


    // =============== DELETE ===============

    // SOFT DELETE - 댓글 상태 변경
    // [사용] DELETE /api/cite/board/{boardId}/comments/{commentId}
    @Modifying
    @Query("UPDATE Comment c SET c.status = :status WHERE c.id = :id")
    int updateStatus(@Param("id") Long id, @Param("status") STATUS status);

    // 게시글 삭제 시 하위 댓글 전체 삭제
    // [사용] DELETE /api/cite/board/{boardId}
    void deleteAllByBoardId(Long boardId);

}
