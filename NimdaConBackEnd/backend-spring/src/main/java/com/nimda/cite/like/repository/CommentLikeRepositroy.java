package com.nimda.cite.like.repository;

import com.nimda.cite.comment.entity.Comment;
import com.nimda.cite.like.entity.CommentLike;
import com.nimda.cup.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CommentLikeRepositroy extends JpaRepository<CommentLike, Long> {
    Optional<CommentLike> findByCommentAndUser(Comment comment, User user);
    long countByCommentId(Long commentId);
    boolean existsByCommentIdAndUserId(Long commentId, Long userId);
}
