package judgeServer.domain.challenge.download;

import com.nimda.cite.common.response.ApiResponse;
import com.nimda.cite.user.security.CustomUserDetails;
import judgeServer.domain.challenge.entity.Challenge;
import judgeServer.domain.challenge.mq.message.ChallengeDownloadResultMessage;
import judgeServer.domain.challenge.mq.message.DownloadStatus;
import judgeServer.domain.challenge.mq.producer.ChallengeDownloadProducer;
import judgeServer.domain.challenge.repository.ChallengeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/ctf/challenge")
@RequiredArgsConstructor
public class ChallengeDownloadController {

    // 발급 대기 시간
    private static final Duration WAIT_TIMEOUT = Duration.ofSeconds(3);
    // todo 폴링 대신 freeze 방식으로 변환 생각
    private static final long POLL_INTERVAL_MS = 100;

    private final ChallengeRepository challengeRepository;
    private final ChallengeDownloadProducer producer;
    private final ChallengeDownloadStore resultStore;
    private final ChallengeDownloadUrlCache urlCache;

    // 문제 코드로 다운로드 링크 요청
    @PostMapping("/{code}/download")
    public ResponseEntity<?> request(@PathVariable String code,
                                     @AuthenticationPrincipal CustomUserDetails user) {
        Challenge challenge = challengeRepository.findByCode(code)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "존재하지 않는 문제입니다."));

        // 비공개 문제(초안)는 관리자만. 코드만 알면 받아갈 수 있으면 안 된다.
        if (!Boolean.TRUE.equals(challenge.getIsPublic()) && !isAdmin(user)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "존재하지 않는 문제입니다.");
        }
        if (challenge.getAttachmentKey() == null || challenge.getAttachmentKey().isBlank()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "첨부파일이 없는 문제입니다.");
        }

        Long userId = requireUserId(user);

        // redis 캐싱 확인
        Optional<ChallengeDownloadUrlCache.CachedUrl> cached = urlCache.find(code);
        if (cached.isPresent()) {
            return ApiResponse.ok(Map.of(
                    "status", DownloadStatus.READY.name(),
                    "url", cached.get().url(),
                    "expiresAt", cached.get().expiresAt() != null ? cached.get().expiresAt() : "",
                    "cached", true)).toResponse();
        }

        String requestId = producer.requestDownload(challenge, userId);

        Optional<ChallengeDownloadResultMessage> result = awaitResult(requestId);
        if (result.isEmpty()) {
            return ApiResponse.ok(Map.of("status", "PENDING", "requestId", requestId))
                    .toResponse(HttpStatus.ACCEPTED);
        }
        return respond(result.get(), requestId);
    }

    /** 발급 결과를 조회한다 (아직이면 PENDING). */
    @GetMapping("/download/{requestId}")
    public ResponseEntity<?> status(@PathVariable String requestId,
                                    @AuthenticationPrincipal CustomUserDetails user) {
        ChallengeDownloadResultMessage result = resultStore.find(requestId).orElse(null);
        if (result == null) {
            return ApiResponse.ok(Map.of("status", "PENDING", "requestId", requestId)).toResponse();
        }
        checkOwner(result, user);
        return respond(result, requestId);
    }

    // redis 결과 대기
    private Optional<ChallengeDownloadResultMessage> awaitResult(String requestId) {
        long deadline = System.nanoTime() + WAIT_TIMEOUT.toNanos();
        while (true) {
            Optional<ChallengeDownloadResultMessage> found = resultStore.find(requestId);
            if (found.isPresent()) {
                return found;
            }
            if (System.nanoTime() >= deadline) {
                return Optional.empty();
            }
            try {
                Thread.sleep(POLL_INTERVAL_MS);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                return Optional.empty();
            }
        }
    }

    private ResponseEntity<?> respond(ChallengeDownloadResultMessage result, String requestId) {
        if (result.getStatus() != DownloadStatus.READY || result.getUrl() == null) {
            // 발급 실패는 CTF 서버가 준 사유를 그대로 전한다 (첨부파일 없음, 허용되지 않는 경로 등).
            String reason = result.getMessage() != null ? result.getMessage() : "다운로드 링크를 발급하지 못했습니다.";
            return ApiResponse.fail(reason).toResponse(HttpStatus.SERVICE_UNAVAILABLE);
        }
        return ApiResponse.ok(Map.of(
                "status", result.getStatus().name(),
                "requestId", requestId,
                "url", result.getUrl(),
                "expiresAt", result.getExpiresAt() != null ? result.getExpiresAt() : "",
                "cached", false)).toResponse();
    }

    private void checkOwner(ChallengeDownloadResultMessage result, CustomUserDetails user) {
        if (user == null || result.getUserId() == null
                || !result.getUserId().equals(user.getUser().getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "본인이 요청한 다운로드가 아닙니다.");
        }
    }

    private Long requireUserId(CustomUserDetails user) {
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
        }
        return user.getUser().getId();
    }

    private boolean isAdmin(CustomUserDetails user) {
        if (user == null) {
            return false;
        }
        return user.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch("ROLE_ADMIN"::equals);
    }
}
