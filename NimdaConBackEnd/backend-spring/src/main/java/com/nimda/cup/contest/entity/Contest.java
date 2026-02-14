package com.nimda.cup.contest.entity;

/**
 * [관계]
 * - User (N:1): created_by → User.id (하나의 User가 여러 Contest 생성 가능)
 * - ContestProblem (1:N): Contest → ContestProblem (하나의 Contest에 여러 Problem 연결)
 * - ContestParticipant (1:N): Contest → ContestParticipant (하나의 Contest에 여러 팀 참가)
 */

import com.nimda.cup.common.entity.BaseTimeEntity;
import com.nimda.cup.contest.enums.ContestRole;
import com.nimda.cup.user.entity.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "contest")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Contest extends BaseTimeEntity {

    // [기본 필드]
    /**
     * 대회 고유 ID (PK)
     * - 데이터베이스 컬럼명: contest_id
     * - AUTO_INCREMENT
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "contest_id")
    private Long id;

    /**
     * 대회 제목
     * - 필수 필드
     * - 최대 200자
     */
    @NotBlank
    @Column(nullable = false, length = 200)
    private String title;

    /**
     * 대회 설명
     * - TEXT 타입 (65,535자)
     * - 필수 필드
     */
    @NotBlank
    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    // [시간 관련 필드]
    /**
     * 대회 시작 시간
     * - 데이터베이스 컬럼명: start_time
     * - 대회 상태 계산에 사용 (현재 시간 < start_time → UPCOMING)
     */
    @NotNull
    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    /**
     * 대회 종료 시간
     * - 데이터베이스 컬럼명: end_time
     * - 대회 상태 계산에 사용 (현재 시간 >= end_time → ENDED)
     */
    @NotNull
    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    // [상태 필드]
    /**
     * 대회 상태
     * - 데이터베이스 컬럼명: status
     * - Enum 타입: UPCOMING, RUNNING, ENDED
     * - 자동 계산: Service에서 현재 시간 기준으로 상태 결정
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ContestRole status;

    // [관리자 권한 관리]
    /**
     * 대회 생성자 (관리자 권한 관리용)
     * - 데이터베이스 컬럼명: created_by
     * - FK → User.id
     * 
     * [설계 결정 사항]
     * - 관리자만 대회 생성/수정/삭제 가능하도록 권한 확인용
     * - Controller에서 Authority.ROLE_ADMIN 권한 확인 후 대회 관리 허용
     * 
     * [권한 확인 로직]
     * 1. User의 authorities에서 ROLE_ADMIN 권한 확인
     * 2. 또는 createdBy와 현재 사용자 ID 비교
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    // [생성자] 
    /**
     * 대회 생성용 생성자
     * - 대회 생성 시 사용
     * - 상태는 자동 계산되므로 기본값 설정 (Service에서 계산)
     */
    public Contest(String title, String description, LocalDateTime startTime, LocalDateTime endTime, User createdBy) {
        this.title = title;
        this.description = description;
        this.startTime = startTime;
        this.endTime = endTime;
        this.createdBy = createdBy;
        // 상태는 Service에서 계산하여 설정
        this.status = calculateStatus();
    }

    // [비즈니스 로직 메서드]
    /**
     * 대회 상태 계산
     * - 현재 시간 기준으로 상태 결정
     * 
     * [상태 계산 로직]
     * - 현재 시간 < start_time → UPCOMING
     * - start_time <= 현재 시간 < end_time → RUNNING
     * - 현재 시간 >= end_time → ENDED
     */
    public ContestRole calculateStatus() {
        LocalDateTime now = LocalDateTime.now();
        
        if (now.isBefore(startTime)) {
            return ContestRole.UPCOMING;
        } else if (now.isBefore(endTime)) {
            return ContestRole.RUNNING;
        } else {
            return ContestRole.ENDED;
        }
    }

    /**
     * 대회 상태 업데이트
     * - 현재 시간 기준으로 상태 재계산
     * - Service에서 주기적으로 호출하여 상태 업데이트
     */
    public void updateStatus() {
        this.status = calculateStatus();
    }

    /**
     * 대회가 진행 중인지 확인
     */
    public boolean isRunning() {
        return this.status == ContestRole.RUNNING;
    }

    /**
     * 대회가 종료되었는지 확인
     */
    public boolean isEnded() {
        return this.status == ContestRole.ENDED;
    }
}

