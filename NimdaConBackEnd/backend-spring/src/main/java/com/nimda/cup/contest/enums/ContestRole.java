package com.nimda.cup.contest.enums;

/**
 * - 대회 상태를 3단계로 구분 (UPCOMING, RUNNING, ENDED)
 * - 현재 시간 기준으로 자동 계산
 * 
 * - UPCOMING: 현재 시간 < start_time (대회 시작 전)
 * - RUNNING: start_time <= 현재 시간 < end_time (대회 진행 중)
 * - ENDED: 현재 시간 >= end_time (대회 종료)
 * 
 * - ContestService에서 현재 시간과 대회 시작/종료 시간을 비교하여 상태 결정
 * - 목록 조회 시 상태별 필터링 가능
 */
public enum ContestRole {
    
    UPCOMING,
    RUNNING,
    ENDED
}

