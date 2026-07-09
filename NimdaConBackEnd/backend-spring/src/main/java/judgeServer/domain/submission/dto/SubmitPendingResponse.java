package judgeServer.domain.submission.dto;

import judgeServer.domain.submission.enums.SubmissionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class SubmitPendingResponse {

    private Long submissionId;

    private SubmissionStatus status;

    // 사용자 화면에 바로 보여줄 안내 메시지
    private String message;

    public static SubmitPendingResponse of(Long submissionId, SubmissionStatus status) {
        return SubmitPendingResponse.builder()
                .submissionId(submissionId)
                .status(status)
                .message("제출이 접수되었습니다. 채점을 시작합니다.")
                .build();
    }
}