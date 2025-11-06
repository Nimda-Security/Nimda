package com.nimda.cup.judge.enums;

public enum JudgeStatus {
    
    PENDING("대기 중"),
    JUDGING("채점 중"),
    ACCEPTED("맞았습니다!!"),
    WRONG_ANSWER("틀렸습니다"),
    TIME_LIMIT_EXCEEDED("시간 초과"),
    MEMORY_LIMIT_EXCEEDED("메모리 초과"),
    RUNTIME_ERROR("런타임 에러"),
    COMPILATION_ERROR("컴파일 에러"),
    SYSTEM_ERROR("시스템 에러");
    
    private final String displayName;
    
    JudgeStatus(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}
