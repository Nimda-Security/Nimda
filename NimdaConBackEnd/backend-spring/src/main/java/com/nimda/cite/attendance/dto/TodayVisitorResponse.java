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
    // 여기에 유저 프로필 사진까지 추가해야함
    private Long id;
    private String userName;

    public static TodayVisitorResponse from(AttendanceLog log) {
        if (log == null || log.getUser() == null) {
            return null;
        }

        User user = log.getUser();

        return TodayVisitorResponse.builder()
                .id(log.getId())
                .userName(user.getNickname()) // 또는 user.getUserName()
                .build();
    }

}
