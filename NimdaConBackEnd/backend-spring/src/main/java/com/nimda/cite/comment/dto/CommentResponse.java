package com.nimda.cite.comment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder // 빌더 상속을 위해 사용
public abstract class CommentResponse<T extends CommentResponse<T>> {
    protected Long id;
    protected Long parentId;
    protected String authorName;
    protected String authorProfileImage;
    protected String context;
    protected String createdAt;
    protected String updatedAt;
    protected Integer likeCount;
    protected Boolean isDeleted;

    // 대댓글
    @Builder.Default
    protected List<T> children = new ArrayList<>();

    public static final DateTimeFormatter DEFAULT_FORMATTER = DateTimeFormatter.ofPattern("yyyy/MM/dd HH:mm");

    public static String formatDateTime(LocalDateTime dateTime) {
        return dateTime != null ? dateTime.format(DEFAULT_FORMATTER) : null;
    }
}