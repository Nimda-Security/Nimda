package com.nimda.cite.attendance.dto;

import com.nimda.cite.attendance.entity.AttendanceLog;
import com.nimda.cup.user.entity.User;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class TodayVisitorResponse {
    private Long id;
    private String userName;
    private String profileImageUrl;

    public static TodayVisitorResponse from(AttendanceLog log) {
        if (log == null || log.getUser() == null) {
            return null;
        }

        User user = log.getUser();

        return TodayVisitorResponse.builder()
                .id(user.getId())
                .userName(user.getNickname())
                .profileImageUrl(user.getProfileImage())
                .build();
    }

}
