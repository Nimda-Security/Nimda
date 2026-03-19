package com.nimda.cite.alarm.Event;

import com.nimda.cup.user.entity.User;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class AddCommentEvent extends ApplicationEvent {
    private User boardAuthor;
    private User commentAuthor;
    private String boardTitle;
    private Long boardId;

    public AddCommentEvent(Object source, User boardAuthor, User commentAuthor, String boardTitle, Long boardId) {
        super(source);
        this.boardAuthor = boardAuthor;
        this.commentAuthor = commentAuthor;
        this.boardTitle = boardTitle;
        this.boardId = boardId;
    }
}
