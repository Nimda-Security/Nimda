package com.nimda.cite.domain.comment.dto;

import com.nimda.cite.domain.comment.enums.STATUS;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class CommentStatusUpdateRequest {

    @NotNull(message = "변경할 상태를 입력해주세요.")
    private STATUS status;
}
