package com.nimda.cite.alarm.Event;

import com.nimda.cup.user.entity.User;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class CommentLikeEvent extends ApplicationEvent {
    private User commentAuthor;
    private User likeUser;
    private String commentContent;
    private Long commentId;
    private Long boardId;

    public CommentLikeEvent(Object source, User commentAuthor, User likeUser, String commentContent, Long commentId,
                            Long boardId) {
        super(source);
        this.commentAuthor = commentAuthor;
        this.likeUser = likeUser;
        this.commentContent = commentContent;
        this.commentId = commentId;
        this.boardId = boardId;
    }
}