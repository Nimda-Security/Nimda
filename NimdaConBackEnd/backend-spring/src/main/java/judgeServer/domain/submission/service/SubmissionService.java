package judgeServer.domain.submission.service;

import com.nimda.cite.common.util.JwtUtil;
import com.nimda.cite.user.repository.UserRepository;
import judgeServer.domain.problem.entity.Problem;
import judgeServer.domain.problem.repository.ProblemRepository;
import judgeServer.domain.submission.dto.SubDetailResponse;
import judgeServer.domain.submission.dto.SubmitListResponse;
import judgeServer.domain.submission.dto.SubmitRequest;
import judgeServer.domain.submission.dto.UserProblemStatusResponse;
import judgeServer.domain.submission.dto.judge.JudgeResultResponse;
import judgeServer.domain.submission.entity.Submission;
import judgeServer.domain.submission.enums.SupportedLanguage;
import judgeServer.domain.submission.mq.SubmissionMessage;
import judgeServer.domain.submission.mq.SubmissionProducer;
import judgeServer.domain.submission.repository.SubmissionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class SubmissionService {
    @Autowired
    private SubmissionRepository submissionRepository;
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ProblemRepository problemRepository;
    @Autowired
    private SubmissionProducer submissionProducer;

    public Submission submit(SubmitRequest req, String cookie) {
        Long userId = jwtUtil.extractUserId(cookie);
        if(!userRepository.existsById(userId))
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "존재하지 않는 유저입니다.");
        if (!SupportedLanguage.isValid(req.getLanguage()))
            throw new IllegalArgumentException("지원하지 않는 언어입니다: " + req.getLanguage());

        Problem problem = problemRepository.findById(req.getProblemId())
                .orElseThrow( () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "문제가 없습니다."));

        Submission submission = Submission.builder()
                .problemId(req.getProblemId())
                .problemTitle(problem.getTitle())
                .userId(userId)
                .language(req.getLanguage())
                .sourceCode(req.getSourceCode())
                .build();

        Submission savedSubmission = submissionRepository.save(submission);

        submissionProducer.publish(SubmissionMessage.of(savedSubmission, problem));

        return submission;
    }

    @Transactional
    public Submission updateJudgeResult(JudgeResultResponse response) {

        Submission submission = submissionRepository.findById(response.getSubmissionId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 제출 건입니다. ID: " + response.getSubmissionId()));

        submission.setStatus(response.getStatus());
        submission.setExecutionTimeMs(response.getExecutionTimeMs());
        submission.setUsedMemoryKb(response.getUsedMemoryKb());
        submission.setErrorMessage(response.getErrorMessage());

        return submission;
    }

    @Transactional(readOnly = true)
    public Page<SubmitListResponse> getMySubmit(Long userId, Long problemId, Pageable pageable) {

        Page<Submission> submissions = submissionRepository.findByUserIdAndProblemId(userId,problemId,pageable);
        return submissions.map(SubmitListResponse::from);
    }

    @Transactional(readOnly = true)
    public UserProblemStatusResponse getMyProblemStatus(Long userId) {
        List<Long> solved = submissionRepository.findSolvedProblemIdsByUserId(userId);
        List<Long> incorrect = submissionRepository.findIncorrectProblemIdsByUserId(userId);

        return new UserProblemStatusResponse(solved, incorrect);
    }

    /**
     * 제출 상세(소스코드 포함) 조회.
     *
     * 보안: 소스코드는 제출자 본인 또는 관리자만 볼 수 있다.
     * 검증이 없으면 로그인한 아무 유저가 submissionId 를 증가시켜가며
     * 타인의 제출 소스코드를 전부 수집할 수 있다(대회 부정행위/표절).
     */
    @Transactional(readOnly = true)
    public SubDetailResponse getSubmitDetail(Long submissionId, Long requesterId, boolean isAdmin) {

        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "제출 내역을 찾을 수 없습니다."));

        if (!isAdmin && !submission.getUserId().equals(requesterId)) {
            // 존재 여부 노출을 막기 위해 404 로 응답한다.
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "제출 내역을 찾을 수 없습니다.");
        }

        return SubDetailResponse.from(submission);
    }

    @Transactional(readOnly = true)
    public UserProblemStatusResponse getOtherProblemStatus(Long userId) {
        List<Long> solved = submissionRepository.findSolvedProblemIdsByUserId(userId);
        List<Long> incorrect = submissionRepository.findIncorrectProblemIdsByUserId(userId);

        return new UserProblemStatusResponse(solved, incorrect);
    }
}
