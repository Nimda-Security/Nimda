package com.nimda.cup.contest.service;

/**
 * - 대회 생성, 수정, 삭제, 조회
 * - 대회 상태 자동 계산
 * - 관리자 권한 확인
 * - 대회 문제 관리
 * - 대회 참가자 관리
 */

import com.nimda.cup.contest.dto.*;
import com.nimda.cup.contest.entity.Contest;
import com.nimda.cup.contest.entity.ContestProblem;
import com.nimda.cup.contest.entity.ContestParticipant;
import com.nimda.cup.contest.enums.ContestRole;
import com.nimda.cup.contest.repository.ContestParticipantRepository;
import com.nimda.cup.contest.repository.ContestProblemRepository;
import com.nimda.cup.contest.repository.ContestRepository;
import com.nimda.cup.group.entity.StudyGroup;
import com.nimda.cup.group.repository.StudyGroupRepository;
import com.nimda.cup.judge.entity.Problem;
import com.nimda.cup.judge.repository.ProblemRepository;
import com.nimda.cup.user.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ContestService {

    @Autowired
    private ContestRepository contestRepository;

    @Autowired
    private ContestProblemRepository contestProblemRepository;

    @Autowired
    private ContestParticipantRepository contestParticipantRepository;

    @Autowired
    private StudyGroupRepository studyGroupRepository;

    @Autowired
    private ProblemRepository problemRepository;

    // [관리자 권한 확인]
    /**
     * 관리자 권한 확인
     * - User의 authorities에서 ROLE_ADMIN 권한 확인
     * 
     * 설계
     * - 관리자만 대회 생성/수정/삭제 가능
     * - Authority.ROLE_ADMIN 권한 확인
     * 
     * [사용 방법]
     * - 대회 생성/수정/삭제 전에 호출하여 권한 확인
     * - 권한이 없으면 RuntimeException
     */
    private void checkAdminAuthority(User user) {
        if (user == null) {
            throw new RuntimeException("로그인이 필요합니다.");
        }

        // User의 authorities에서 ROLE_ADMIN 권한 확인
        boolean isAdmin = user.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthorityName().equals("ROLE_ADMIN"));

        if (!isAdmin) {
            throw new RuntimeException("관리자 권한이 필요합니다.");
        }
    }

    // [대회 CRUD]
    /**
     * 대회 생성
     * - 관리자 권한 확인 후 대회 생성
     * - 대회 상태 자동 계산 (현재 시간 기준)
     * 
     * 설계
     * - created_by 필드에 현재 사용자 설정 (관리자 권한 확인용)
     * - 대회 상태는 자동 계산 (UPCOMING, RUNNING, ENDED)
     */
    @Transactional
    public Contest createContest(ContestCreateDTO createDTO, User creator) {
        // 관리자 권한 확인
        checkAdminAuthority(creator);

        // 대회 엔티티 생성
        Contest contest = new Contest(
                createDTO.getTitle(),
                createDTO.getDescription(),
                createDTO.getStartTime(),
                createDTO.getEndTime(),
                creator // created_by 필드 설정 (관리자 권한 확인용)
        );

        // 대회 상태 자동 계산
        contest.updateStatus();

        // 대회 저장
        return contestRepository.save(contest);
    }

    /**
     * 대회 목록 조회
     * - 상태별 필터링 가능
     * - 페이지네이션 지원
     */
    @Transactional(readOnly = true)
    public Page<Contest> getContests(ContestRole status, Pageable pageable) {
        if (status != null) {
            return contestRepository.findByStatus(status, pageable);
        }
        return contestRepository.findAll(pageable);
    }

    /**
     * 대회 상세 조회
     */
    @Transactional(readOnly = true)
    public Contest getContest(Long contestId) {
        return contestRepository.findById(contestId)
                .orElseThrow(() -> new RuntimeException("대회를 찾을 수 없습니다: " + contestId));
    }

    /**
     * 대회 수정
     * - 관리자 권한 확인 후 대회 수정
     * - 대회 상태 자동 재계산
     * 
     * 설계
     * - created_by와 현재 사용자 비교하여 권한 확인
     * - 또는 관리자 권한 확인
     */
    @Transactional
    public Contest updateContest(Long contestId, ContestCreateDTO createDTO, User user) {
        // 관리자 권한 확인
        checkAdminAuthority(user);

        // 대회 조회
        Contest contest = getContest(contestId);

        // 대회 정보 수정
        contest.setTitle(createDTO.getTitle());
        contest.setDescription(createDTO.getDescription());
        contest.setStartTime(createDTO.getStartTime());
        contest.setEndTime(createDTO.getEndTime());

        // 대회 상태 자동 재계산
        contest.updateStatus();

        // 대회 저장
        return contestRepository.save(contest);
    }

    /**
     * 대회 삭제
     * - 관리자 권한 확인 후 대회 삭제
     * 
     * 설계
     * - created_by와 현재 사용자 비교하여 권한 확인
     * - 또는 관리자 권한 확인
     */
    @Transactional
    public void deleteContest(Long contestId, User user) {
        // 관리자 권한 확인
        checkAdminAuthority(user);

        // 대회 조회
        Contest contest = getContest(contestId);

        // 대회 삭제
        contestRepository.delete(contest);
    }

    // [대회 문제 관리]
    /**
     * 대회에 문제 추가
     * - 관리자 권한 확인 후 문제 추가
     */
    @Transactional
    public ContestProblem addProblemToContest(Long contestId, Long problemId, Integer score, String problemAlias, User user) {
        // 관리자 권한 확인
        checkAdminAuthority(user);

        // 대회 조회
        Contest contest = getContest(contestId);

        // 문제 조회
        Problem problem = problemRepository.findById(problemId)
                .orElseThrow(() -> new RuntimeException("문제를 찾을 수 없습니다: " + problemId));

        // 중복 체크
        if (contestProblemRepository.existsByContestAndProblem(contest, problem)) {
            throw new RuntimeException("이미 대회에 추가된 문제입니다.");
        }

        // 대회-문제 매핑 생성
        ContestProblem contestProblem = new ContestProblem(contest, problem, score, problemAlias);

        // 저장
        return contestProblemRepository.save(contestProblem);
    }

    /**
     * 대회에서 문제 제거
     * - 관리자 권한 확인 후 문제 제거
     */
    @Transactional
    public void removeProblemFromContest(Long contestId, Long problemId, User user) {
        // 관리자 권한 확인
        checkAdminAuthority(user);

        // 대회 조회
        Contest contest = getContest(contestId);

        // 문제 조회
        Problem problem = problemRepository.findById(problemId)
                .orElseThrow(() -> new RuntimeException("문제를 찾을 수 없습니다: " + problemId));

        // 대회-문제 매핑 삭제
        contestProblemRepository.deleteByContestAndProblem(contest, problem);
    }

    /**
     * 대회 문제 목록 조회
     */
    @Transactional(readOnly = true)
    public List<ContestProblem> getContestProblems(Long contestId) {
        Contest contest = getContest(contestId);
        return contestProblemRepository.findByContest(contest);
    }

    // [대회 참가 팀 관리]
    /**
     * 대회 참가 팀 등록
     * - 팀 단위로 대회 참가 등록
     * - 중복 참가 방지
     * 
     * 설계
     * - 팀 단위 참가: StudyGroup을 Team으로 사용
     * - 하나의 팀이 여러 Contest에 참가 가능
     * - 하나의 Contest에 여러 팀 참가 가능
     */
    @Transactional
    public ContestParticipant registerContest(Long contestId, Long teamId) {
        // 대회 조회
        Contest contest = getContest(contestId);

        // 팀 조회
        StudyGroup team = studyGroupRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("팀을 찾을 수 없습니다: " + teamId));

        // 중복 체크
        if (contestParticipantRepository.existsByContestAndTeam(contest, team)) {
            throw new RuntimeException("이미 참가한 대회입니다.");
        }

        // 참가 기록 생성
        ContestParticipant participant = new ContestParticipant(contest, team);

        // 저장
        return contestParticipantRepository.save(participant);
    }

    /**
     * 대회 참가 팀 목록 조회
     */
    @Transactional(readOnly = true)
    public Page<ContestParticipant> getContestParticipants(Long contestId, Pageable pageable) {
        Contest contest = getContest(contestId);
        return contestParticipantRepository.findByContest(contest, pageable);
    }

    // 점수판 조회
    @Transactional(readOnly = true)
    public Page<ContestParticipant> getScoreboard(Long contestId, Pageable pageable) {
        // ★ 점수/랭킹 관련 로직은 추후 rank 도메인에서 처리 ★
        // 현재는 단순히 참가자 목록만 반환
        return getContestParticipants(contestId, pageable);
    }
}

