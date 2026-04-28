package com.nimda.cite.domain.comment.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Getter
@NoArgsConstructor
public class MyCommentsDeleteRequest {
    private List<Long> commentIds;

    @JsonProperty("commentIds")
    public void setCommentIds(List<?> raw) {
        if (raw == null) {
            this.commentIds = null;
            return;
        }
        this.commentIds = new ArrayList<>();
        for (Object o : raw) {
            if (o instanceof Number n) {
                this.commentIds.add(n.longValue());
            }
        }
    }
}