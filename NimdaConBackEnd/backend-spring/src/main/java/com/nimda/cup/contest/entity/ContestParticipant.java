package com.nimda.cup.contest.entity;

/**
 * [역할]
 * - Contest와 StudyGroup(Team) 간의 매핑 테이블
 * - 단순히 대회 참가 정보만 저장
 * - 점수/랭킹 관련 로직은 rank 도메인에서 처리
 * 
 * [관계]
 * - Contest (N:1): contest_id → Contest.contest_id
 * - StudyGroup (N:1): team_id → StudyGroup.id (팀 단위 참가)
 * ========================================
 */

import com.nimda.cup.group.entity.StudyGroup;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "contest_participant", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"contest_id", "team_id"})
})
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ContestParticipant {

    // [기본 필드] 
    /**
     * 참가 기록 고유 ID (PK)
     * - 데이터베이스 컬럼명: participant_id
     * - AUTO_INCREMENT
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "participant_id")
    private Long id;

    // [관계 필드]
    /**
     * 대회 (N:1 관계)
     * - 데이터베이스 컬럼명: contest_id
     * - FK → Contest.contest_id
     * - 하나의 Contest에 여러 팀이 참가 가능
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contest_id", nullable = false)
    private Contest contest;

    /**
     * 팀 (N:1 관계)
     * - 데이터베이스 컬럼명: team_id
     * - FK → StudyGroup.id (group 패키지의 StudyGroup 엔티티)
     * 
     * 설계
     * - 팀 단위 참가: StudyGroup을 Team으로 사용
     * - 대회는 팀 단위로 참가, 개인 참가 아님
     * - 하나의 팀이 여러 Contest에 참가 가능
     * 
     * [관계]
     * StudyGroup (팀) → ContestParticipant (참가 기록) → Contest (대회)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id", nullable = false)
    private StudyGroup team;

    // [시간 필드]
    /**
     * 참가 등록 일시
     * - 데이터베이스 컬럼명: registered_at
     * - JPA Auditing으로 자동 설정
     * - 팀이 대회에 참가 등록한 시간
     */
    @CreatedDate
    @Column(name = "registered_at", nullable = false, updatable = false)
    private LocalDateTime registeredAt;

    // [생성자]
    /**
     * 대회 참가 등록용 생성자
     * - 팀이 대회에 참가 등록 시 사용
     */
    public ContestParticipant(Contest contest, StudyGroup team) {
        this.contest = contest;
        this.team = team;
    }
}

