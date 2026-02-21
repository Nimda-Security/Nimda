package com.nimda.cite.comment.repository;

import com.nimda.cite.comment.entity.Comment;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    // 댓글 검색 메서드
    // [사용] GET /api/cite/board/{boardId}/comments
    @EntityGraph(attributePaths = {"author"})
    List<Comment> findByBoardIdAndParentIsNullOrderByCreatedAtAsc(Long boardId);

    // 대댓글 검색 메서드
    // [사용] GET /api/cite/board/{boardId}/comments/{parentId}/children
    @EntityGraph(attributePaths = {"author"})
    List<Comment> findByBoardIdAndParentIdOrderByCreatedAtAsc(Long boardId, Long parentId);

}
