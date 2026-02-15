package com.nimda.cup.user.enums;

/**
 * 사용자 승인 상태 Enum
 * 
 * - PENDING: 승인 대기 중 (기본값)
 * - APPROVED: 승인 완료
 * - REJECTED: 승인 거부
 */
public enum ApprovalStatus {
    PENDING, // 승인 대기 중
    APPROVED, // 승인 완료
    REJECTED // 승인 거부
}
