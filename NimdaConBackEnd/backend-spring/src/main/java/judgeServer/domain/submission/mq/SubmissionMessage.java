package judgeServer.domain.submission.mq;

import judgeServer.domain.problem.entity.Problem;
import judgeServer.domain.submission.entity.Submission;
import lombok.Builder;
import lombok.Getter;

import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 채점 큐(Redis Stream)에 발행되는 메시지.
 * 채점 서버(consumer)는 이 필드 구성을 계약(contract)으로 삼아 구현한다.
 * docs/judge-queue-contract.md 참고.
 */
@Getter
@Builder
public class SubmissionMessage {

    private final Long submissionId;
    private final Long problemId;
    private final Long userId;
    private final String language;
    private final String sourceCode;
    private final Double timeLimitSeconds;
    private final Integer memoryLimitMb;
    private final String submittedAt;

    public static SubmissionMessage of(Submission submission, Problem problem) {
        return SubmissionMessage.builder()
                .submissionId(submission.getId())
                .problemId(submission.getProblemId())
                .userId(submission.getUserId())
                .language(submission.getLanguage())
                .sourceCode(submission.getSourceCode())
                .timeLimitSeconds(problem.getTimeLimit())
                .memoryLimitMb(problem.getMemoryLimit())
                .submittedAt(submission.getCreatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME))
                .build();
    }

    /** Redis Stream 엔트리는 문자열 필드로 구성되므로 Map<String, String>으로 변환한다. */
    public Map<String, String> toStreamFields() {
        Map<String, String> fields = new LinkedHashMap<>();
        fields.put("submissionId", String.valueOf(submissionId));
        fields.put("problemId", String.valueOf(problemId));
        fields.put("userId", String.valueOf(userId));
        fields.put("language", language);
        fields.put("sourceCode", sourceCode);
        fields.put("timeLimitSeconds", String.valueOf(timeLimitSeconds));
        fields.put("memoryLimitMb", String.valueOf(memoryLimitMb));
        fields.put("submittedAt", submittedAt);
        return fields;
    }
}