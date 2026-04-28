package com.nimda.cite.comment.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.nimda.cite.comment.entity.Comment;
import com.nimda.cite.comment.enums.STATUS;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentResponse {
    private Long id;
    private Long parentId;
    private String authorName;
    private String authorProfileImage;
    private STATUS status;
    private String context;
    private String createdAt;
    private String updatedAt;
    private Integer likeCount;
    @JsonProperty("isDeleted")
    private Boolean isDeleted;
    @JsonProperty("isLiked")
    private Boolean isLiked;

    private Boolean editable;
    private Boolean deletable;
    private Boolean hideable;

    @Builder.Default
    private List<CommentResponse> children = new ArrayList<>();

    // 유저용 조회 메서드
    public static CommentResponse forUser(Comment comment, Long currentUserId) {
        boolean isDeleted = comment.getStatus() == STATUS.DELETED;
        boolean isHidden = comment.getStatus() == STATUS.HIDDEN;
        boolean isAuthor = comment.getAuthor().getId().equals(currentUserId);

        String displayContext = isDeleted ? "삭제된 댓글입니다."
                            : isHidden && !isAuthor ? "숨겨진 댓글입니다."
                            : comment.getContext();

        String displayName = isDeleted ? "(삭제됨)" : comment.getAuthor().getNickname();

        return CommentResponse.builder()
                .id(comment.getId())
                .parentId(comment.getParent() != null ? comment.getParent().getId() : null)
                .authorName(displayName)
                .authorProfileImage(isDeleted ? null : comment.getAuthor().getProfileImage())
                .status(comment.getStatus())
                .context(displayContext)
                .createdAt(formatDateTime(comment.getCreatedAt()))
                .updatedAt(formatDateTime(comment.getUpdatedAt()))
                .likeCount(comment.getLikeCount())
                .isDeleted(isDeleted)
                .editable(!isDeleted && isAuthor)
                .deletable(!isDeleted && isAuthor)
                .hideable(false)
                .build();
    }

    // 관리자용 조회 메서드
    public static CommentResponse forAdmin(Comment comment, Long currentUserId) {
        boolean isDeleted = comment.getStatus() == STATUS.DELETED;
        boolean isAuthor = comment.getAuthor().getId().equals(currentUserId);

        return CommentResponse.builder()
                .id(comment.getId())
                .parentId(comment.getParent() != null ? comment.getParent().getId() : null)
                .authorName(comment.getAuthor().getNickname())
                .authorProfileImage(comment.getAuthor().getProfileImage())
                .status(comment.getStatus())
                .context(comment.getContext())
                .createdAt(formatDateTime(comment.getCreatedAt()))
                .updatedAt(formatDateTime(comment.getUpdatedAt()))
                .likeCount(comment.getLikeCount())
                .isDeleted(isDeleted)
                .editable(!isDeleted && isAuthor)
                .deletable(!isDeleted && isAuthor)
                .hideable(!isDeleted)
                .build();
    }

    // 관리자용 수정 및 삭제 반환 메서드
    public static CommentResponse forAdmin(Comment comment) {
        boolean isDeleted = comment.getStatus() == STATUS.DELETED;

        return CommentResponse.builder()
                .id(comment.getId())
                .parentId(comment.getParent() != null ? comment.getParent().getId() : null)
                .authorName(comment.getAuthor().getNickname())
                .authorProfileImage(comment.getAuthor().getProfileImage())
                .status(comment.getStatus())
                .context(comment.getContext())
                .createdAt(formatDateTime(comment.getCreatedAt()))
                .updatedAt(formatDateTime(comment.getUpdatedAt()))
                .likeCount(comment.getLikeCount())
                .isDeleted(isDeleted)
                .editable(false)
                .deletable(!isDeleted)
                .hideable(!isDeleted)
                .build();
    }

    private static String formatDateTime(LocalDateTime dateTime) {
        return dateTime != null ? dateTime.format(DateTimeFormatter.ofPattern("yyyy/MM/dd HH:mm")) : null;
    }
}
