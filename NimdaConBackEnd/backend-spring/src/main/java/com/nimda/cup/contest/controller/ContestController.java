package com.nimda.cup.contest.controller;

/**
 * - 대회 CRUD API
 * - 대회 문제 관리 API
 * - 대회 참가자 관리 API
 * - 점수판 API
 * 
 * [관리자 권한 관리]
 * - 대회 생성/수정/삭제: 관리자만 가능
 * - 대회 문제 추가/제거: 관리자만 가능
 * - JWT 토큰에서 사용자 정보 추출
 * - Authority.ROLE_ADMIN 권한 확인
 */

import com.nimda.cup.common.util.JwtUtil;
import com.nimda.cup.contest.dto.*;
import com.nimda.cup.contest.entity.Contest;
import com.nimda.cup.contest.entity.ContestParticipant;
import com.nimda.cup.contest.entity.ContestProblem;
import com.nimda.cup.contest.enums.ContestRole;
import com.nimda.cup.contest.service.ContestService;
import com.nimda.cup.user.entity.User;
import com.nimda.cup.user.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/contest")
@CrossOrigin(origins = "*")
public class ContestController {

    @Autowired
    private ContestService contestService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    private User getUserFromToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return null;
        }

        try {
            String token = authHeader.substring(7); // "Bearer " 제거
            String nickname = jwtUtil.extractNickname(token);

            if (nickname != null && !jwtUtil.isTokenExpired(token)) {
                return userRepository.findByNickname(nickname).orElse(null);
            }
        } catch (Exception e) {
            // 토큰이 유효하지 않으면 null 반환
        }

        return null;
    }

    // Contest CRUD API
    /**
     * 대회 생성 API
     * - 관리자만 대회 생성 가능
     * - JWT 토큰에서 사용자 정보 추출 후 권한 확인
     *
     * - created_by 필드에 현재 사용자 설정 (관리자 권한 확인용)
     * - Authority.ROLE_ADMIN 권한 확인
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> createContest(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @Valid @RequestBody ContestCreateDTO createDTO) {
        try {
            // 사용자 정보 추출
            User user = getUserFromToken(authHeader);
            if (user == null) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "로그인이 필요합니다.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
            }

            // 대회 생성 (관리자 권한 확인 포함)
            Contest contest = contestService.createContest(createDTO, user);

            // 응답 생성
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "대회가 성공적으로 생성되었습니다.");
            response.put("contest", contest);

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "대회 생성 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * 대회 목록 조회 API
     * - 상태별 필터링 가능
     * - 페이지네이션 지원
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getContests(
            @RequestParam(required = false) ContestRole status,
            Pageable pageable) {
        try {
            Page<Contest> contests = contestService.getContests(status, pageable);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "대회 목록을 성공적으로 조회했습니다.");
            response.put("contests", contests.getContent());
            response.put("totalElements", contests.getTotalElements());
            response.put("totalPages", contests.getTotalPages());
            response.put("currentPage", contests.getNumber());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "대회 목록 조회 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * 대회 상세 조회 API
     */
    @GetMapping("/{contestId}")
    public ResponseEntity<Map<String, Object>> getContest(@PathVariable Long contestId) {
        try {
            Contest contest = contestService.getContest(contestId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "대회 정보를 성공적으로 조회했습니다.");
            response.put("contest", contest);

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "대회 조회 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * 대회 수정 API
     * - 관리자만 대회 수정 가능
     * - JWT 토큰에서 사용자 정보 추출 후 권한 확인
     * 
     * - created_by와 현재 사용자 비교하여 권한 확인
     * - 또는 관리자 권한 확인
     */
    @PutMapping("/{contestId}")
    public ResponseEntity<Map<String, Object>> updateContest(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long contestId,
            @Valid @RequestBody ContestCreateDTO createDTO) {
        try {
            // 사용자 정보 추출
            User user = getUserFromToken(authHeader);
            if (user == null) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "로그인이 필요합니다.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
            }

            // 대회 수정 (관리자 권한 확인 포함)
            Contest contest = contestService.updateContest(contestId, createDTO, user);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "대회가 성공적으로 수정되었습니다.");
            response.put("contest", contest);

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "대회 수정 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * 대회 삭제 API
     * - 관리자만 대회 삭제 가능
     * - JWT 토큰에서 사용자 정보 추출 후 권한 확인
     * 
     * - created_by와 현재 사용자 비교하여 권한 확인
     * - 또는 관리자 권한 확인
     */
    @DeleteMapping("/{contestId}")
    public ResponseEntity<Map<String, Object>> deleteContest(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long contestId) {
        try {
            // 사용자 정보 추출
            User user = getUserFromToken(authHeader);
            if (user == null) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "로그인이 필요합니다.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
            }

            // 대회 삭제 (관리자 권한 확인 포함)
            contestService.deleteContest(contestId, user);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "대회가 성공적으로 삭제되었습니다.");

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "대회 삭제 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // ========== [대회 문제 관리 API] ==========
    /**
     * 대회에 문제 추가 API
     * - 관리자만 문제 추가 가능
     */
    @PostMapping("/{contestId}/problems")
    public ResponseEntity<Map<String, Object>> addProblemToContest(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long contestId,
            @RequestBody Map<String, Object> request) {
        try {
            // 사용자 정보 추출
            User user = getUserFromToken(authHeader);
            if (user == null) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "로그인이 필요합니다.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
            }

            Long problemId = Long.valueOf(request.get("problemId").toString());
            Integer score = request.get("score") != null ? Integer.valueOf(request.get("score").toString()) : null;
            String problemAlias = request.get("problemAlias") != null ? request.get("problemAlias").toString() : null;

            // 대회에 문제 추가 (관리자 권한 확인 포함)
            ContestProblem contestProblem = contestService.addProblemToContest(contestId, problemId, score,
                    problemAlias, user);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "대회에 문제가 성공적으로 추가되었습니다.");
            response.put("contestProblem", contestProblem);

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "문제 추가 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * 대회에서 문제 제거 API
     * - 관리자만 문제 제거 가능
     */
    @DeleteMapping("/{contestId}/problems/{problemId}")
    public ResponseEntity<Map<String, Object>> removeProblemFromContest(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long contestId,
            @PathVariable Long problemId) {
        try {
            // 사용자 정보 추출
            User user = getUserFromToken(authHeader);
            if (user == null) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "로그인이 필요합니다.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
            }

            // 대회에서 문제 제거 (관리자 권한 확인 포함)
            contestService.removeProblemFromContest(contestId, problemId, user);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "대회에서 문제가 성공적으로 제거되었습니다.");

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "문제 제거 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * 대회 문제 목록 조회 API
     */
    @GetMapping("/{contestId}/problems")
    public ResponseEntity<Map<String, Object>> getContestProblems(@PathVariable Long contestId) {
        try {
            List<ContestProblem> contestProblems = contestService.getContestProblems(contestId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "대회 문제 목록을 성공적으로 조회했습니다.");
            response.put("problems", contestProblems);

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "대회 문제 목록 조회 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // ========== [대회 참가자 관리 API] ==========
    /**
     * 대회 참가 등록 API
     * - 팀 단위로 대회 참가 등록
     * 
     * - 팀 단위 참가: StudyGroup을 Team으로 사용
     */
    @PostMapping("/{contestId}/register")
    public ResponseEntity<Map<String, Object>> registerContest(
            @PathVariable Long contestId,
            @RequestBody Map<String, Object> request) {
        try {
            Long teamId = Long.valueOf(request.get("teamId").toString());

            // 대회 참가 등록
            ContestParticipant participant = contestService.registerContest(contestId, teamId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "대회 참가 등록이 완료되었습니다.");
            response.put("participant", participant);

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "대회 참가 등록 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * 대회 참가자 목록 조회 API
     * - 점수 정렬 지원
     */
    @GetMapping("/{contestId}/participants")
    public ResponseEntity<Map<String, Object>> getContestParticipants(
            @PathVariable Long contestId,
            Pageable pageable) {
        try {
            Page<ContestParticipant> participants = contestService.getContestParticipants(contestId, pageable);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "대회 참가자 목록을 성공적으로 조회했습니다.");
            response.put("participants", participants.getContent());
            response.put("totalElements", participants.getTotalElements());
            response.put("totalPages", participants.getTotalPages());
            response.put("currentPage", participants.getNumber());

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "대회 참가자 목록 조회 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // Contest 점수판 API
    /**
     * 대회 점수판 조회 API
     * - 대회 참가자 목록을 점수 기준으로 정렬
     * - 정렬: 총점 내림차순, 패널티 오름차순
     * 
     * - Submission과 Contest 연결 없음: 별도 테이블로 관리
     * - ContestProblem 매핑 테이블로 Contest-Problem 관계 관리
     * - 점수 계산 로직은 별도 구현 필요 (제출 내역 기반)
     */
    @GetMapping("/{contestId}/scoreboard")
    public ResponseEntity<Map<String, Object>> getScoreboard(
            @PathVariable Long contestId,
            Pageable pageable) {
        try {
            Page<ContestParticipant> scoreboard = contestService.getScoreboard(contestId, pageable);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "점수판을 성공적으로 조회했습니다.");
            response.put("scoreboard", scoreboard.getContent());
            response.put("totalElements", scoreboard.getTotalElements());
            response.put("totalPages", scoreboard.getTotalPages());
            response.put("currentPage", scoreboard.getNumber());

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "점수판 조회 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}
