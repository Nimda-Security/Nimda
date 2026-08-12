package judgeServer.domain.submission.dto.judge;

import judgeServer.domain.submission.enums.SubmissionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JudgeResultResponse {
    private Long submissionId;

    // 최종 채점 상태 (ACCEPTED, WRONG_ANSWER, COMPILE_ERROR 등)
    private SubmissionStatus status;

    // 실행 시간 (ms 단위)
    private Integer executionTimeMs;

    // 사용 메모리 (KB 단위)
    private Integer usedMemoryKb;

    // 컴파일 에러 메시지나 런타임 에러 로그
    private String errorMessage;
}