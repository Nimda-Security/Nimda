package judgeServer.domain.submission.controller;

import com.nimda.cite.common.response.ApiResponse;
import com.nimda.cite.common.util.JwtUtil;
import com.nimda.cite.user.repository.UserRepository;
import jakarta.validation.Valid;
import judgeServer.domain.problem.repository.ProblemRepository;
import judgeServer.domain.submission.dto.*;
import judgeServer.domain.submission.dto.judge.JudgeResultResponse;
import judgeServer.domain.submission.entity.Submission;
import judgeServer.domain.submission.repository.SubmissionRepository;
import judgeServer.domain.submission.service.SubmissionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("api/judge/submission")
public class SubmissionController {
    @Autowired
    private SubmissionService submissionService;
    @Autowired
    private SubmissionRepository submissionRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ProblemRepository problemRepository;
    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping
    public ResponseEntity<?> submitRequest(
            @CookieValue(name = "Authorization", required = false) String accessToken,
            @Valid @RequestBody SubmitRequest req) {
        Submission submission = submissionService.submit(req, accessToken);

        SubmitPendingResponse dto = SubmitPendingResponse.of(
                submission.getId(),
                submission.getStatus()
        );
        return ApiResponse.ok(dto).toResponse();
    }

    // 채점 완료시 채점서버가 호출할 api
    @PostMapping("/result")
    public ResponseEntity<?> updateResult(@RequestBody JudgeResultResponse result) {
        
        // result 내부에 제출 id와 결과가 들어있음
        Submission submission = submissionService.updateJudgeResult(result);

        return ApiResponse.ok(SubmitResult.from(submission)).toResponse();
    }

    // 내 제출 목록 확인하기
    @GetMapping("/my/status/{problemId}")
    public ResponseEntity<?> viewMySubmit(
            @CookieValue(name = "Authorization", required = false) String accessToken,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            @PathVariable Long problemId) {

        Long userId = jwtUtil.extractUserId(accessToken);
        if(!userRepository.existsById(userId))
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
        if(!problemRepository.existsById(problemId))
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "문제가 존재하지 않습니다.");

        Page<SubmitListResponse> dto = submissionService.getMySubmit(userId, problemId,pageable);
        return ApiResponse.ok(dto).toResponse();
    }

    // 제출 상세 보기
    @GetMapping("/detail/{submissionId}")
    public ResponseEntity<?> viewMySourceCode(
            @CookieValue(name = "Authorization", required = false) String accessToken,
            @PathVariable Long submissionId) {
        Long userId = jwtUtil.extractUserId(accessToken);
        if(!userRepository.existsById(userId))
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"로그인이 필요합니다.");

        SubDetailResponse dto = submissionService.getSubmitDetail(submissionId);
        return ApiResponse.ok(dto).toResponse();
    }

    // 유저 문제 상태 확인하기
    @GetMapping("/my/status")
    public ResponseEntity<?> viewMyStatus(
            @CookieValue(name = "Authorization", required = false) String accessToken) {
        Long userId = jwtUtil.extractUserId(accessToken);
        if(!userRepository.existsById(userId)) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");

        return ApiResponse.ok(submissionService.getMyProblemStatus(userId)).toResponse();
    }

    // 다른 유저 문제 상태 확인하기
    @GetMapping("/{userId}/status")
    public ResponseEntity<?> viewOtherStatus(@PathVariable Long userId) {
        if(!userRepository.existsById(userId))
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "조회하려는 유저가 존재하지 않습니다.");

        return ApiResponse.ok(submissionService.getMyProblemStatus(userId)).toResponse();
    }
}
