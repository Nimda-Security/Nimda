package judgeServer.domain.challenge.dto;

import judgeServer.domain.challenge.entity.Challenge;
import judgeServer.domain.challenge.enums.ChallengeCategory;
import judgeServer.domain.challenge.enums.IsolationType;

public record ChallengeSummaryResponse(
        Long id,
        String code,
        String title,
        ChallengeCategory category,
        Integer points,
        IsolationType isolationType,
        /** 첨부파일(문제 파일)이 붙어 있는지. 실제 S3 키는 내보내지 않는다. */
        boolean hasAttachment,
        Boolean isPublic
) {
    public static ChallengeSummaryResponse from(Challenge challenge) {
        return new ChallengeSummaryResponse(
                challenge.getId(),
                challenge.getCode(),
                challenge.getTitle(),
                challenge.getCategory(),
                challenge.getPoints(),
                challenge.getIsolationType(),
                challenge.getAttachmentKey() != null && !challenge.getAttachmentKey().isBlank(),
                challenge.getIsPublic()
        );
    }
}
