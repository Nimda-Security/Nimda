package com.nimda.cite.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 마이페이지 응답 DTO
 * 현재 로그인한 사용자의 정보를 반환할 때 사용
 * 민감 정보(password)는 제외
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MyPageResponseDTO {

    private String userId;
    private String name;
    private String nickname;
    private String email;
    private String major;
    private String bojId;
    private String birth;
    private String studentNum;
    private boolean emailHide;
    private List<String> roles;

    private String profileImage;
    private String profileDecoration;
}
