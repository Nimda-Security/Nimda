package com.nimda.cite.comment.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class MyCommentsDeleteRequest {
    private List<Long> commentIds;
}