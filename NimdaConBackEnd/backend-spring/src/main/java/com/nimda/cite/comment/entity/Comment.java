package com.nimda.cite.comment.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.nimda.cite.board.entity.Board;
import com.nimda.cite.board.entity.Category;
import com.nimda.cite.comment.enums.STATUS;
import com.nimda.cite.like.entity.CommentLike;
import com.nimda.cup.common.entity.BaseTimeEntity;
import com.nimda.cup.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "comments")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Comment extends BaseTimeEntity {

    // id
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 부모 댓글
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_comment_id")
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    private Comment parent;

    // 게시글
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "board_id", nullable = false)
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    private Board board;

    // 작성자(User)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    private User author;

    // 카테고리
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    private Category category;

    // 내용
    @Column(columnDefinition = "TEXT", length = 500, nullable = false)
    private String context;

    // 댓글 좋아요
    @OneToMany(mappedBy = "comment", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<CommentLike> likes = new ArrayList<>();

    // 상태(기본 - 공개)
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private STATUS status = STATUS.PUBLIC;

    // 댓글 수정 메서드
    public void updateContext(String context) {
        this.context = context;
    }

    // 상태 변경 메서드
    public void updateStatus(STATUS status) {
        this.status = status;
    }

    // 좋아요 개수 메서드
    public int getLikeCount() {
        return likes.size();
    }
}
