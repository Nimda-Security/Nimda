package com.nimda.cite.user.dto.ChangePassword;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class CheckUserValidateResponse {
    private boolean isValidateUserId;
    private boolean isValidateStudentNum;
    private boolean isValidateEmail;
}
