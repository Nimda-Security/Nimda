package com.nimda.cite.comment.dto;

import com.nimda.cite.comment.enums.STATUS;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class CommentUpdateRequest {

    @NotBlank(message = "수정할 내용을 입력해주세요.")
    // @Size(max = 1000, message = "댓글은 1000자 이내로 입력해주세요.")
    private String context;

    private STATUS status;

}
