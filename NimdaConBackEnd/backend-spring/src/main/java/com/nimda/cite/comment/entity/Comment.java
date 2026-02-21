package com.nimda.cite.comment.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.nimda.cite.board.entity.Board;
import com.nimda.cite.board.entity.Category;
import com.nimda.cite.comment.enums.STATUS;
import com.nimda.cup.common.entity.BaseTimeEntity;
import com.nimda.cup.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "comments")
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Comment extends BaseTimeEntity {

    /**
     * id
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 부모 댓글 id
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_comment_id")
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    private Comment parent;

    /**
     * 게시글
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "board_id", nullable = false)
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    private Board board;

    /**
     * 작성자(user)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    private User user;

    /**
     * 카테고리
     */
    /*
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;
    */

    /**
     * 내용
     */
    @Column(columnDefinition = "TEXT", nullable = false)
    private String context;

    /**
     * 대댓글 개수
     */
    @Column(name = "reply_count", columnDefinition = "integer default 0")
    private Integer replyCount = 0;

    /**
     * 상태(기본 - 공개)
     */
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private STATUS status = STATUS.PUBLIC;

}
