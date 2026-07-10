package com.nimda.cite.user.dto.ChangePassword;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class ChangePasswordRequest {
    @NotBlank(message = "비밀번호를 입력해주세요.")
    @Size(min = 4, max = 72, message = "비밀번호는 4자 이상 72자 이하여야 합니다.")
    private String password;
}
