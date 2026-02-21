package com.nimda.cite.alarm.Event;

import com.nimda.cite.board.entity.Board;
import com.nimda.cup.user.entity.User;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

import java.time.LocalDateTime;

@Getter
public class PushLikeButtonEvent extends ApplicationEvent {
    private LocalDateTime createdAt;
    private Board board;
    private User user;

    public PushLikeButtonEvent(Object source, Board board, User user) {
        super(source);
        this.board = board;
        this.user = user;
        this.createdAt = LocalDateTime.now();
    }
}
