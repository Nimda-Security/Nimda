package com.nimda.cite.attendance.entity;

import com.nimda.cup.user.entity.User;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Data
@NoArgsConstructor
public class Attendance {

    @Id
    private Long id;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    private int totalCount;        // 누적 출석 횟수
    private int consecutiveCount;  // 연속 출석 횟수
    private LocalDate lastDate;    // 최근 출석 날짜

    // 출석 기록 시 통계 업데이트 로직
    public void updateStatus(LocalDate today) {
        if (this.lastDate != null && this.lastDate.plusDays(1).equals(today)) {
            this.consecutiveCount++; // 어제 오고 오늘 왔으면 연속 카운트 증가
        } else {
            this.consecutiveCount = 1; // 끊겼으면 1로 초기화
        }
        this.totalCount++;
        this.lastDate = today;
    }

    public Attendance(User user) {
        this.user = user;
        this.totalCount = 0; // 초기값 명시
        this.consecutiveCount = 0;
    }
}