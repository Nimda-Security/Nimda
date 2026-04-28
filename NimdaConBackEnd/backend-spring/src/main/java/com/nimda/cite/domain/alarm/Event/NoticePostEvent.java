package com.nimda.cite.domain.alarm.Event;

import com.nimda.cite.domain.board.entity.Board;
import com.nimda.cite.user.entity.User;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class NoticePostEvent extends ApplicationEvent {
    private final Long boardId;
    private final String boardTitle;
    private final Long authorId;

    public NoticePostEvent(Object source, Board board, User author) {
        super(source);
        this.boardId = board.getId();
        this.boardTitle = board.getTitle();
        this.authorId = author.getId();
    }
}