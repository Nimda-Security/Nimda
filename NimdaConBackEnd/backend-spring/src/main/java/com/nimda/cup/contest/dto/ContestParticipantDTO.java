package com.nimda.cup.contest.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/*
 * 대회 참가자 DTO
 * - 대회에 참가한 팀 정보
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ContestParticipantDTO {

    private Long participantId;
    private Long teamId; // StudyGroup.id
    private String teamName; // StudyGroup.groupName
    private LocalDateTime registeredAt;
}

