package com.nimda.cup.user.exception;

/**
 * 사용자 승인 상태 관련 예외
 * - 승인 대기 중이거나 승인 거부된 경우 발생
 */
public class UserNotApprovedException extends RuntimeException {

    public UserNotApprovedException(String message) {
        super(message);
    }
}
