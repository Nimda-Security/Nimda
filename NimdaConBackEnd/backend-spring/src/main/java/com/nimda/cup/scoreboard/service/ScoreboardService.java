package com.nimda.cup.scoreboard.service;

import com.nimda.cup.judge.entity.Problem;
import com.nimda.cup.judge.entity.Submission;
import com.nimda.cup.judge.enums.JudgeStatus;
import com.nimda.cup.judge.repository.ProblemRepository;
import com.nimda.cup.judge.repository.SubmissionRepository;
import com.nimda.cup.scoreboard.dto.ProblemScoreDTO;
import com.nimda.cup.scoreboard.dto.ScoreboardEntryDTO;
import com.nimda.cup.scoreboard.dto.ScoreboardResponseDTO;
import com.nimda.cup.user.entity.User;
import com.nimda.cup.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
// import java.time.temporal.ChronoUnit; // 주석 처리됨 (나중을 위해 보관 - 시간 계산에 사용)
import java.util.*;
import java.util.stream.Collectors;

/**
 * 스코어보드 서비스
 * - 사용자별 점수 계산
 * - 랭킹 정렬
 * - 문제별 시도 횟수 계산
 */
@Service
public class ScoreboardService {
    
    private static final Logger logger = LoggerFactory.getLogger(ScoreboardService.class);
    
    // 대회 시작 시간: 2024년 11월 27일 (목) 19:10:00 - 주석 처리됨 (나중을 위해 보관)
    // private static final LocalDateTime CONTEST_START_TIME = LocalDateTime.of(2024, 11, 27, 19, 10, 0);
    
    // 문제별 점수 (1번~7번)
    private static final Map<Long, Integer> PROBLEM_POINTS = new HashMap<>();
    static {
        PROBLEM_POINTS.put(1L, 5);   // 1번: 5점
        PROBLEM_POINTS.put(2L, 5);  // 2번: 5점
        PROBLEM_POINTS.put(3L, 10);  // 3번: 10점
        PROBLEM_POINTS.put(4L, 10);  // 4번: 10점
        PROBLEM_POINTS.put(5L, 15);  // 5번: 15점
        PROBLEM_POINTS.put(6L, 25);  // 6번: 25점
        PROBLEM_POINTS.put(7L, 30);  // 7번: 30점
    }
    
    // 문제 ID 목록 (1~7)
    private static final List<Long> PROBLEM_IDS = Arrays.asList(1L, 2L, 3L, 4L, 5L, 6L, 7L);

    // 스코어보드에 노출할 팀(user_id) 화이트리스트
    private static final Set<String> SCOREBOARD_TEAM_USER_IDS = Set.of(
            "team1",
            "team2",
            "team3",
            "team4",
            "team5",
            "team6"
    );
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ProblemRepository problemRepository;
    
    @Autowired
    private SubmissionRepository submissionRepository;
    
    /**
     * 스코어보드 조회
     *
     * 전체 사용자에 대해 문제별 점수 정보를 계산하고
     * 랭킹 정렬 → 순위 부여 → 문제 메타 정보(문제명/점수)까지 세트로 반환한다.
     */
    @Transactional(readOnly = true)
    public ScoreboardResponseDTO getScoreboard() {
        try {
            // 1. 스코어보드 대상 사용자 조회 (지정된 팀만)
            List<User> users = SCOREBOARD_TEAM_USER_IDS.isEmpty()
                    ? userRepository.findAll()
                    : userRepository.findByUserIdIn(SCOREBOARD_TEAM_USER_IDS);
            
            // 2. 문제 목록 조회 (1~7번)
            List<Problem> problems = problemRepository.findAllById(new ArrayList<>(PROBLEM_IDS));
            Map<Long, Problem> problemMap = problems.stream()
                    .collect(Collectors.toMap(Problem::getId, p -> p));
            
            // 3. 각 사용자별 스코어보드 항목 계산
            //    calculateUserScore 내부에서 문제별 점수/시도/시간을 모두 계산한다.
            List<ScoreboardEntryDTO> entries = new ArrayList<>();
            
            for (User user : users) {
                ScoreboardEntryDTO entry = calculateUserScore(user, problemMap);
                if (entry != null) {
                    entries.add(entry);
                }
            }
            
            // 4. 랭킹 정렬
            //    - 1차: 총점 내림차순 (높을수록 위)
            //    - 2차: 총 제출 횟수 오름차순 (적을수록 위)
            entries.sort((a, b) -> {
                int scoreCompare = Integer.compare(b.getTotalScore(), a.getTotalScore());
                if (scoreCompare != 0) {
                    return scoreCompare;
                }
                // 총점이 같으면 총 제출 횟수 오름차순 (적을수록 위)
                int attemptCompare = Integer.compare(
                    a.getTotalAttemptCount() != null ? a.getTotalAttemptCount() : Integer.MAX_VALUE,
                    b.getTotalAttemptCount() != null ? b.getTotalAttemptCount() : Integer.MAX_VALUE
                );
                return attemptCompare;
            });
            
            // 5. 순위 부여
            //    바로 앞 항목과 총점/제출 횟수가 모두 같으면 같은 순위를 부여한다.
            int rank = 1;
            for (int i = 0; i < entries.size(); i++) {
                if (i > 0) {
                    ScoreboardEntryDTO prev = entries.get(i - 1);
                    ScoreboardEntryDTO current = entries.get(i);
                    // 이전과 점수와 제출 횟수가 모두 같으면 같은 순위
                    if (!prev.getTotalScore().equals(current.getTotalScore()) ||
                        !Objects.equals(prev.getTotalAttemptCount(), current.getTotalAttemptCount())) {
                        rank = i + 1;
                    }
                } else {
                    rank = 1;
                }
                entries.get(i).setRank(rank);
            }
            
            // 6. 문제 정보 목록 생성
            List<ScoreboardResponseDTO.ProblemInfoDTO> problemInfos = problems.stream()
                    .map(p -> new ScoreboardResponseDTO.ProblemInfoDTO(
                            p.getId(),
                            p.getTitle(),
                            PROBLEM_POINTS.get(p.getId())
                    ))
                    .collect(Collectors.toList());
            
            return new ScoreboardResponseDTO(
                    true,
                    "스코어보드를 성공적으로 조회했습니다.",
                    entries,
                    problemInfos
            );
            
        } catch (Exception e) {
            logger.error("스코어보드 조회 중 오류 발생", e);
            return new ScoreboardResponseDTO(
                    false,
                    "스코어보드 조회 중 오류가 발생했습니다: " + e.getMessage(),
                    new ArrayList<>(),
                    new ArrayList<>()
            );
        }
    }
    
    /**
     * 사용자별 점수 계산
     *
     * - 문제 1~7에 대해 차례로 ProblemScoreDTO를 만든다.
     * - 누적 총점, 해결 수를 함께 계산한다.
     * - 총 제출 횟수는 ScoreboardEntryDTO 생성자에서 자동 계산된다.
     */
    private ScoreboardEntryDTO calculateUserScore(User user, Map<Long, Problem> problemMap) {
        List<ProblemScoreDTO> problemScores = new ArrayList<>();
        int totalScore = 0;
        int solvedCount = 0;
        // 시간 합계 계산은 주석 처리됨 (나중을 위해 보관 - 현재는 랭킹 정렬에 사용하지 않음)
        // long totalTime = 0;
        long totalTime = 0L; // DTO 생성에 필요하지만 계산하지 않음 (나중을 위해 0으로 설정)
        
        // 각 문제별로 계산
        // ProblemScoreDTO 내부에 정답/오답/미제출 정보를 모두 담는다.
        for (Long problemId : PROBLEM_IDS) {
            Problem problem = problemMap.get(problemId);
            if (problem == null) {
                continue;
            }
            
            ProblemScoreDTO problemScore = calculateProblemScore(user, problem);
            problemScores.add(problemScore);
            
            // 총점 계산
            totalScore += problemScore.getScore();
            
            // 정답 수 계산
            if ("ACCEPTED".equals(problemScore.getStatus())) {
                solvedCount++;
                // 시간 합계 계산 (ACCEPTED 문제만) - 주석 처리됨 (나중을 위해 보관)
                // 현재 랭킹 정렬에는 사용하지 않음
                // if (problemScore.getTimeFromStart() != null) {
                //     totalTime += problemScore.getTimeFromStart();
                // }
            }
        }
        
        return new ScoreboardEntryDTO(
                user.getId(),
                user.getNickname(),
                totalScore,
                solvedCount,
                totalTime, // 0으로 고정 (나중을 위해 필드는 유지)
                problemScores
        );
    }
    
    /**
     * 사용자의 특정 문제에 대한 점수 계산
     *
     * - 제출 기록이 없으면 NOT_SUBMITTED
     * - 채점 중인 제출만 있고 정답이 없으면 JUDGING
     * - 최초 ACCEPTED가 있으면 attemptCount/시간/점수 계산
     * - 그 외는 WRONG_ANSWER (오답 횟수만 표시)
     */
    private ProblemScoreDTO calculateProblemScore(User user, Problem problem) {
        Long problemId = problem.getId();
        Integer problemPoints = PROBLEM_POINTS.get(problemId);
        
        // 모든 제출 기록 조회 (시간순)
        //  → 최초 정답까지 몇 번 제출했는지 카운팅하기 위해 전체 목록이 필요하다.
        List<Submission> allSubmissions = submissionRepository
                .findAllSubmissionsByUserAndProblem(user, problemId);
        
        if (allSubmissions.isEmpty()) {
            // 미제출
            return ProblemScoreDTO.notSubmitted(problemId, problem.getTitle());
        }
        
        // ACCEPTED 제출 찾기
        //  → 최초 정답 제출의 submittedAt과 ID가 필요하다.
        List<Submission> acceptedSubmissions = submissionRepository
                .findAcceptedSubmissionsByUserAndProblem(user, problemId);
        
        // 채점 중인 제출이 있는지 확인
        boolean hasJudging = allSubmissions.stream()
                .anyMatch(s -> s.getStatus() == JudgeStatus.PENDING || 
                              s.getStatus() == JudgeStatus.JUDGING);
        
        if (hasJudging && acceptedSubmissions.isEmpty()) {
            // 채점 중이고 아직 정답이 없음
            return ProblemScoreDTO.judging(problemId, problem.getTitle());
        }
        
        if (!acceptedSubmissions.isEmpty()) {
            // 정답이 있음
            Submission firstAccepted = acceptedSubmissions.get(0); // 최초 ACCEPTED
            
            // ACCEPTED까지의 총 제출 횟수 계산
            int attemptCount = 0;
            for (Submission s : allSubmissions) {
                attemptCount++;
                if (s.getId().equals(firstAccepted.getId())) {
                    break; // 최초 ACCEPTED까지
                }
            }
            
            // 시작 시간으로부터의 경과 시간 계산 (초 단위) - 주석 처리됨 (나중을 위해 보관)
            // 현재 랭킹 정렬에는 사용하지 않음
            // long timeFromStart = ChronoUnit.SECONDS.between(CONTEST_START_TIME, firstAccepted.getSubmittedAt());
            Long timeFromStart = null; // 나중을 위해 null로 설정 (필드는 유지)
            
            return new ProblemScoreDTO(
                    problemId,
                    problem.getTitle(),
                    problemPoints,
                    attemptCount,
                    firstAccepted.getSubmittedAt(),
                    timeFromStart // null로 전달 (나중을 위해 필드는 유지)
            );
        } else {
            // 오답만 있음
            // 오답 제출 횟수 계산
            int wrongAttemptCount = (int) allSubmissions.stream()
                    .filter(s -> s.getStatus() != JudgeStatus.PENDING && 
                                s.getStatus() != JudgeStatus.JUDGING)
                    .count();
            
            return new ProblemScoreDTO(problemId, problem.getTitle(), wrongAttemptCount);
        }
    }
}

