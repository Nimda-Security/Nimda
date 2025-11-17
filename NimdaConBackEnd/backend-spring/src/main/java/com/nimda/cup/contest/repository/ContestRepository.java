package com.nimda.cup.contest.repository;


import com.nimda.cup.contest.entity.Contest;
import com.nimda.cup.contest.enums.ContestRole;
import com.nimda.cup.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ContestRepository extends JpaRepository<Contest, Long> {

    /*
     * 대회 상태별 조회
     */
    Page<Contest> findByStatus(ContestRole status, Pageable pageable);

    /*
     * 생성자별 대회 조회
     */
    Page<Contest> findByCreatedBy(User createdBy, Pageable pageable);

    /*
     * 생성자별 + 상태별 대회 조회
     * - 특정 사용자가 생성한 대회 중 특정 상태의 대회 조회
     */
    Page<Contest> findByCreatedByAndStatus(User createdBy, ContestRole status, Pageable pageable);

    /*
     * 시작 시간 기준 조회
     * - 특정 시간 이후에 시작하는 대회 조회
     */
    List<Contest> findByStartTimeAfter(LocalDateTime startTime);

    /*
     * 종료 시간 기준 조회
     * - 특정 시간 이전에 종료되는 대회 조회
     */
    List<Contest> findByEndTimeBefore(LocalDateTime endTime);

    /*
     * 제목으로 검색
     * - 대회 제목에 키워드가 포함된 대회 조회
     */
    Page<Contest> findByTitleContaining(String title, Pageable pageable);
}
