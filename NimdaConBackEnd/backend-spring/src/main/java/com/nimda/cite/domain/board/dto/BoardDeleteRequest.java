package com.nimda.cite.domain.board.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;

import java.util.ArrayList;
import java.util.List;

@Getter
public class BoardDeleteRequest {

    private List<Long> boardIds;

    @JsonProperty("boardIds")
    public void setBoardIds(List<?> raw) {
        if (raw == null) {
            this.boardIds = null;
            return;
        }
        this.boardIds = new ArrayList<>();
        for (Object o : raw) {
            if (o instanceof Number n) {
                this.boardIds.add(n.longValue());
            }
        }
    }
}
