package judgeServer.domain.submission.dto;

import judgeServer.domain.submission.entity.Submission;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
public class SubDetailResponse extends SubmitListResponse {

    // 추가되는 필드 딱 하나!
    private String sourceCode;

    // 엔티티 -> 상세 DTO 변환 팩토리 메서드
    public static SubDetailResponse from(Submission submission) {
        return SubDetailResponse.builder()
                // 부모 필드
                .submissionId(submission.getId())
                .problemId(submission.getProblemId())
                .problemTitle(submission.getProblemTitle())
                .userId(submission.getUserId())
                .language(submission.getLanguage())
                .status(submission.getStatus())
                .executionTimeMs(submission.getExecutionTimeMs())
                .usedMemoryKb(submission.getUsedMemoryKb())
                .errorMessage(submission.getErrorMessage())
                .createdAt(submission.getCreatedAt())
                // 자식 필드
                .sourceCode(submission.getSourceCode())
                .build();
    }
}