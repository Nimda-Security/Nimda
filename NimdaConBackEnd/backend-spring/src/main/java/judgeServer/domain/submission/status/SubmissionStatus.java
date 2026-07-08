package judgeServer.domain.submission.status;

public enum SubmissionStatus {
    PENDING,        // 채점 대기 중
    JUDGING,        // 채점 중
    ACCEPTED,       // 정답
    WRONG_ANSWER,   // 오답
    TIME_LIMIT_EXCEEDED,   // 시간 초과
    MEMORY_LIMIT_EXCEEDED, // 메모리 초과
    COMPILE_ERROR,  // 컴파일 에러
    RUNTIME_ERROR   // 런타임 에러
}