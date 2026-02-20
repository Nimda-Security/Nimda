package com.nimda.cite.comment.entity;

import com.nimda.cite.comment.enums.STATUS;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "comments")
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Comment extends com.nimda.cite.comment.entity.BaseTime {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_comment_id")
    private Comment parent;

    @Column(name = "user_name", nullable = false)
    private String userName;

    /*
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "board_id", nullable = false)
    private Board board;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;
    */

    @Column(columnDefinition = "TEXT", nullable = false)
    private String context;

    @Column(name = "reply_count", columnDefinition = "integer default 0")
    private Integer replyCount = 0;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private STATUS status = STATUS.PUBLIC;

}
