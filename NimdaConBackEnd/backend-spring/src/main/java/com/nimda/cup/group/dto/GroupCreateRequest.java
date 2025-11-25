package com.nimda.cup.group.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class GroupCreateRequest {

    @NotBlank(message = "그룹 이름은 필수입니다.")
    @Size(max = 100, message = "그룹 이름은 100자 이하여야 합니다.")
    private String groupName;

    @NotNull(message = "최대 인원수는 필수입니다.")
    @Positive(message = "최대 인원수는 양수여야 합니다.")
    @Max(value = 1000, message = "최대 인원수는 1000명을 초과할 수 없습니다.")
    private Integer maxMembers;

    @Size(max = 20, message = "참여 코드는 20자 이하여야 합니다.")
    private String participationCode;

    private Boolean isPublic = Boolean.FALSE;

    @NotNull(message = "생성자 사용자 ID는 필수입니다.")
    private Long creatorUserId;
}
