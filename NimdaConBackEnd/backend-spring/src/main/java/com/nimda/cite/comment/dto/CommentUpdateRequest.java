package com.nimda.cite.comment.dto;

import com.nimda.cite.comment.enums.STATUS;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class CommentUpdateRequest {

    @NotBlank(message = "수정할 내용을 입력해주세요.")
    @Size(max = 500, message = "댓글은 500자 이내로 입력해주세요.")
    private String context;
}
