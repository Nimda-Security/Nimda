package com.nimda.cite.point.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum PointTypes {
    ATTENDANCE("출석", 10L),
    ALGORITHM("알고리즘 문제풀이", 20L),
    STUDY_PARTICIPATION("스터디 참여", 20L),
    MANUAL("기타/수동 지급", 0L); // 기본 금액을 0으로 설정

    private final String description;
    private final Long defaultAmount;
}
