package com.nimda.cite.comment.repository;

import com.nimda.cite.comment.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    /**
     * 특정 게시글(boardId) 내에서 부모 댓글이 없는 댓글만 조회
     */
    List<Comment> findByBoardIdAndParentIsNullOrderByCreatedAtAsc(Long boardId);

    /**
     * 특정 게시글(boardId) 내에서 특정 부모(parentId)를 가진 대댓글만 조회
     */
    List<Comment> findByBoardIdAndParentIdOrderByCreatedAtAsc(Long boardId, Long parentId);
}
