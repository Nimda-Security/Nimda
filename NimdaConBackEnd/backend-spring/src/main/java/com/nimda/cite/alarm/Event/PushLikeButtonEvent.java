package com.nimda.cite.alarm.Event;

import com.nimda.cite.board.entity.Board;
import com.nimda.cup.user.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.context.ApplicationEvent;

import java.time.LocalDateTime;

@Getter
@Builder
public class PushLikeButtonEvent extends ApplicationEvent {
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
    private Board board;
    private User recipient;
    private User sender;

    public PushLikeButtonEvent(Object source, Board board, User recipient, User sender) {
        super(source);
        this.board = board;
        this.recipient = recipient;
        this.sender = sender;
        this.createdAt = LocalDateTime.now();
    }
}
