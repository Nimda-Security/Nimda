package judgeServer.domain.challenge.dto;

import judgeServer.domain.challenge.entity.Challenge;
import judgeServer.domain.challenge.enums.ChallengeCategory;
import judgeServer.domain.challenge.enums.FlagType;
import judgeServer.domain.challenge.enums.IsolationType;

public record ChallengeDetailResponse(
        Long id,
        String code,
        String title,
        String description,
        ChallengeCategory category,
        Integer points,
        FlagType flagType,
        IsolationType isolationType,
        boolean hasAttachment,
        Boolean isPublic
) {
    public static ChallengeDetailResponse from(Challenge challenge) {
        return new ChallengeDetailResponse(
                challenge.getId(),
                challenge.getCode(),
                challenge.getTitle(),
                challenge.getDescription(),
                challenge.getCategory(),
                challenge.getPoints(),
                challenge.getFlagType(),
                challenge.getIsolationType(),
                challenge.getAttachmentKey() != null && !challenge.getAttachmentKey().isBlank(),
                challenge.getIsPublic()
        );
    }
}
