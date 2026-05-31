package com.nimda.cite.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminUserListResponseDTO {

    private Long id;
    private String nickname;
    private String email;
    private LocalDateTime createdAt;
}
