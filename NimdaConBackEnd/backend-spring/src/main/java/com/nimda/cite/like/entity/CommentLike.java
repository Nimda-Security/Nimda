package com.nimda.cite.like.entity;

import com.nimda.cite.comment.entity.Comment;
import com.nimda.cup.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Table(
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"user_id", "comment_id"}) // 한 사용자가 한 댓글에 중복 좋아요 방지
        }
)
public class CommentLike {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "comment_id", nullable = false)
    private Comment comment;

    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt=LocalDateTime.now();

    // 감정 표현 이모지 추가 고민
}