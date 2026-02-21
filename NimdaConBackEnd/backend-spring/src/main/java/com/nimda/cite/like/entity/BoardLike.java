package com.nimda.cite.like.entity;

import com.nimda.cite.board.entity.Board;
import com.nimda.cup.user.entity.User;
import jakarta.persistence.*;
        import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@AllArgsConstructor
@Builder
@Data
@Table(
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"user_id", "board_id"}) // 한 사용자가 한 게시글에 중복 좋아요 방지
        }
)
public class BoardLike {
    @Id
    @GeneratedValue
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "board_id")
    private Board board;
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}