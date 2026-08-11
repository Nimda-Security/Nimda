package judgeServer.domain.challenge.service;

import com.nimda.cite.domain.attachment.store.S3FileStore;
import judgeServer.domain.challenge.dto.AddChallengeRequest;
import judgeServer.domain.challenge.entity.Challenge;
import judgeServer.domain.challenge.enums.FlagType;
import judgeServer.domain.challenge.enums.IsolationType;
import judgeServer.domain.challenge.repository.ChallengeRepository;
import judgeServer.domain.challenge.util.FlagHasher;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class ChallengeService {

    private final ChallengeRepository challengeRepository;
    private final S3FileStore fileStore;

    /**
     * 문제를 등록한다.
     *
     * 압축파일은 풀지 않고 challenges/{code}/{code}.zip 으로 그대로 올린다.
     * 컨테이너를 만드는 쪽은 CTF 서버라, 여기서 풀어봐야 파일 수만큼 S3 요청만 늘어난다.
     */
    @Transactional
    public Challenge addChallenge(AddChallengeRequest request) {
        if (challengeRepository.existsByCode(request.getCode())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "이미 존재하는 문제 코드입니다: " + request.getCode());
        }

        FlagType flagType = request.getFlagType() != null ? request.getFlagType() : FlagType.STATIC;

        // DYNAMIC은 사용자마다 플래그가 달라 미리 저장할 값이 없다.
        String flagHash = null;
        if (flagType == FlagType.STATIC) {
            if (request.getFlag() == null || request.getFlag().isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "STATIC 문제는 플래그가 필요합니다.");
            }
            flagHash = FlagHasher.hash(request.getFlag());
        }

        Challenge challenge = Challenge.builder()
                .code(request.getCode())
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .points(request.getPoints() != null ? request.getPoints() : 100)
                .flagType(flagType)
                .flagHash(flagHash)
                .isolationType(request.getIsolationType() != null
                        ? request.getIsolationType() : IsolationType.NONE)
                .isPublic(request.getIsPublic() != null ? request.getIsPublic() : false)
                .build();

        boolean hasArchive = request.getZipFile() != null && !request.getZipFile().isEmpty();
        if (hasArchive) {
            challenge.setAttachmentKey(
                    fileStore.uploadChallengeArchive(request.getCode(), request.getZipFile()));
        }

        try {
            return challengeRepository.save(challenge);
        } catch (RuntimeException e) {
            // DB 저장이 실패하면 트랜잭션은 되돌아가지만 S3에 올린 파일은 남는다.
            // 다음 등록 때 같은 코드가 막히지 않도록 직접 지운다.
            if (hasArchive) {
                fileStore.deleteChallengeDirectory(request.getCode());
            }
            throw e;
        }
    }

    @Transactional
    public void deleteChallenge(Long id) {
        Challenge challenge = challengeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "삭제하려는 문제가 존재하지 않습니다."));

        challengeRepository.delete(challenge);
        fileStore.deleteChallengeDirectory(challenge.getCode());
    }

    @Transactional
    public boolean toggleIsPublic(Long id) {
        Challenge challenge = challengeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "존재하지 않는 문제입니다."));

        challenge.setIsPublic(!challenge.getIsPublic());
        return challenge.getIsPublic();
    }
}
