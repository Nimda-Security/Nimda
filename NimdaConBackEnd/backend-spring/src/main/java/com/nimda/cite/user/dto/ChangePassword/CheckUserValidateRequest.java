package com.nimda.cite.user.dto.ChangePassword;

import lombok.*;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class CheckUserValidateRequest {
    private String userId;
    private String studentNum;
    private String email;
}
