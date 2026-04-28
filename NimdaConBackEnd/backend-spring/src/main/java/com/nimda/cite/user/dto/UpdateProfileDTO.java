package com.nimda.cite.user.dto;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 사용자 프로필 수정 요청 DTO
 * null인 필드는 수정하지 않음 (부분 업데이트)
 */
@Getter
@Setter
@NoArgsConstructor
public class UpdateProfileDTO {

    @Size(min = 2, max = 6, message = "닉네임은 2~6자여야 합니다.")
    private String nickname;

    @Size(max = 50, message = "백준 ID는 50자 이하여야 합니다.")
    private String bojId;

    @Size(max = 20, message = "생년월일은 20자 이하여야 합니다.")
    private String birth;

    @Size(max = 20, message = "학과는 20자 이하여야 합니다.")
    private String major;

    @Size(max = 20, message = "학번은 20자 이하여야 합니다.")
    private String studentNum;
}
