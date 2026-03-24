package com.nimda.cite.alarm.Event;

import com.nimda.cite.board.entity.Board;
import com.nimda.cite.comment.entity.Comment;
import com.nimda.cup.user.entity.User;
import lombok.Builder;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

import java.time.LocalDateTime;

@Getter
public class AddChildCommentEvent extends ApplicationEvent {

    private Board board;
    private User parentsCommentAuthor;
    private User childCommentAuthor;
    private LocalDateTime createdAt;

    public AddChildCommentEvent(Object source, Board board, User parentsCommentAuthor, User childCommentAuthor) {
        super(source);
        this.board = board;
        this.parentsCommentAuthor = parentsCommentAuthor;
        this.childCommentAuthor = childCommentAuthor;
        this.createdAt = LocalDateTime.now();
    }
}
