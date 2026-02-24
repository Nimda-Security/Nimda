package com.nimda.cite.like.service;

import com.nimda.cite.alarm.service.AlarmService;
import com.nimda.cite.comment.entity.Comment;
import com.nimda.cite.comment.repository.CommentRepository;
import com.nimda.cite.like.entity.CommentLike;
import com.nimda.cite.like.repository.CommentLikeRepositroy;
import com.nimda.cite.notification.entity.Notification;
import com.nimda.cite.notification.enums.NotificationType;
import com.nimda.cup.user.entity.User;
import com.nimda.cup.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CommentLikeService {

    private final CommentLikeRepositroy commentLikeRepository;
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final AlarmService alarmService;

    @Transactional
    public String toggleCommentLike(Long userId, Long commentId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("댓글을 찾을 수 없습니다."));

        Optional<CommentLike> commentLike = commentLikeRepository.findByCommentAndUser(comment, user);

        if (commentLike.isPresent()) {
            commentLikeRepository.delete(commentLike.get());
            return "댓글 좋아요 취소 완료";
        } else {
            commentLikeRepository.save(CommentLike.builder()
                    .user(user)
                    .comment(comment)
                    .build());

            // 본인 댓글이 아닌 경우에만 알림 발송
            if (!comment.getAuthor().getId().equals(userId)) {
                Notification notification = Notification.builder()
                        .recipient(comment.getAuthor()) // 댓글 작성자에게 알림
                        .sender(user)
                        .notificationType(NotificationType.PushLikeButtonAtComment)
                        .message(user.getNickname() + "님이 내 댓글을 좋아합니다.")
                        .relatedEntityId(commentId)
                        // 해당 게시글로 이동
                        .relatedUrl("api/cite/board/view/" + comment.getBoard().getId())
                        .isRead(false)
                        .build();

                alarmService.send(notification);
            }
            return "댓글 좋아요 완료";
        }
    }

    @Transactional(readOnly = true)
    public long getLikeCount(Long commentId) {
        return commentLikeRepository.countByCommentId(commentId);
    }

    @Transactional(readOnly = true)
    public boolean isUserLiked(Long userId, Long commentId) {
        return commentLikeRepository.existsByCommentIdAndUserId(commentId, userId);
    }
}