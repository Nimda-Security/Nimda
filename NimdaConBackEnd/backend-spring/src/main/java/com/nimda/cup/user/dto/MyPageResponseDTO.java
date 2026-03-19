package com.nimda.cup.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * 마이페이지 응답 DTO
 * 현재 로그인한 사용자의 정보를 반환할 때 사용
 * 민감 정보(password, studentNum, phoneNum, birth 등)는 제외
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MyPageResponseDTO {

    private Long id;
    private String userId;
    private String name;
    private String nickname;
    private String email;
    private String universityName;
    private String major;
    private String grade;
    private String profileImage;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
