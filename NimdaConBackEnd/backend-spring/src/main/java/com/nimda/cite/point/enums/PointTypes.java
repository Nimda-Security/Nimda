package com.nimda.cite.point.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum PointTypes {
    ATTENDANCE("출석", 100L),
    ALGORITHM("알고리즘 문제풀이", 200L),
    STUDY_PARTICIPATION("스터디 참여", 100L),
    MANUAL("기타/수동 지급", 0L); // 기본 금액을 0으로 설정

    private final String description;
    private final Long defaultAmount;
}
