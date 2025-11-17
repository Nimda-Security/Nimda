package com.nimda.cup.contest.repository;


import com.nimda.cup.contest.entity.Contest;
import com.nimda.cup.contest.entity.ContestParticipant;
import com.nimda.cup.group.entity.StudyGroup;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ContestParticipantRepository extends JpaRepository<ContestParticipant, Long> {

    /**
     * 대회별 참가자 조회
     * - 특정 대회에 참가한 모든 팀 조회
     */
    List<ContestParticipant> findByContest(Contest contest);

    /**
     * 대회별 참가자 조회 (페이지네이션)
     * - 특정 대회에 참가한 모든 팀 조회 (페이지네이션 지원)
     */
    Page<ContestParticipant> findByContest(Contest contest, Pageable pageable);

    /**
     * 팀별 참가 대회 조회
     * - 특정 팀이 참가한 모든 대회 조회
     */
    List<ContestParticipant> findByTeam(StudyGroup team);

    /**
     * 대회와 팀으로 참가자 조회
     * - 특정 대회에 특정 팀이 참가했는지 확인
     * - 중복 체크용
     */
    Optional<ContestParticipant> findByContestAndTeam(Contest contest, StudyGroup team);

    /**
     * 대회에 팀이 참가했는지 확인
     * - 특정 대회에 특정 팀이 참가했는지 확인
     */
    boolean existsByContestAndTeam(Contest contest, StudyGroup team);

    /**
     * 대회의 참가자 수 조회
     * - 특정 대회에 참가한 팀 수 조회
     */
    long countByContest(Contest contest);
}

