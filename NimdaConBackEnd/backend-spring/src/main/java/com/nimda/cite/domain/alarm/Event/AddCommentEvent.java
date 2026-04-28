package com.nimda.cite.domain.alarm.Event;

import com.nimda.cite.user.entity.User;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class AddCommentEvent extends ApplicationEvent {
    private User boardAuthor;
    private User commentAuthor;
    private String boardTitle;
    private Long boardId;
    private String commentContent;

    public AddCommentEvent(Object source, User boardAuthor, User commentAuthor, String boardTitle, Long boardId, String commentContent) {
        super(source);
        this.boardAuthor = boardAuthor;
        this.commentAuthor = commentAuthor;
        this.boardTitle = boardTitle;
        this.boardId = boardId;
        this.commentContent = commentContent;
    }
}
