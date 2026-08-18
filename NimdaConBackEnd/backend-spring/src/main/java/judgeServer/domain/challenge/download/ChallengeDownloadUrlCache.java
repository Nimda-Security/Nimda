package judgeServer.domain.challenge.download;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;

// ChallengeDownloadStore 관련 유틸
@Slf4j
@Component
@RequiredArgsConstructor
public class ChallengeDownloadUrlCache {

    /** 문제별 링크 캐시 키: ctf:challenge:download:url:{challengeCode} */
    private static final String KEY_PREFIX = "ctf:challenge:download:url:";
    private static final Duration MAX_TTL = Duration.ofMinutes(10);
    private static final Duration SAFETY_MARGIN = Duration.ofSeconds(30);

    private final StringRedisTemplate redisTemplate;

    /** 살아 있는 링크가 있으면 돌려준다. 없으면(만료 포함) 비어 있다. */
    public Optional<CachedUrl> find(String challengeCode) {
        Map<Object, Object> raw = redisTemplate.opsForHash().entries(KEY_PREFIX + challengeCode);
        if (raw == null || raw.isEmpty()) {
            return Optional.empty();
        }
        Object url = raw.get("url");
        if (url == null) {
            return Optional.empty();
        }
        Object expiresAt = raw.get("expiresAt");
        return Optional.of(new CachedUrl(String.valueOf(url),
                expiresAt == null ? null : String.valueOf(expiresAt)));
    }
    
    public void put(String challengeCode, String url, String expiresAt) {
        Duration ttl = cacheTtl(expiresAt);
        if (ttl == null) {
            log.debug("다운로드 링크 캐시 생략: challengeCode={}, expiresAt={}", challengeCode, expiresAt);
            return;
        }

        String key = KEY_PREFIX + challengeCode;
        redisTemplate.opsForHash().putAll(key, Map.of("url", url, "expiresAt", expiresAt));
        redisTemplate.expire(key, ttl);

        log.info("다운로드 링크 캐시: challengeCode={}, ttl={}s, expiresAt={}",
                challengeCode, ttl.toSeconds(), expiresAt);
    }

    // utl TTL 설정
    Duration cacheTtl(String expiresAt) {
        if (expiresAt == null || expiresAt.isBlank()) {
            return null;
        }
        Instant expiry;
        try {
            expiry = Instant.parse(expiresAt);
        } catch (Exception e) {
            log.warn("다운로드 링크 만료 시각을 읽지 못해 캐시하지 않음: {}", expiresAt);
            return null;
        }

        Duration remaining = Duration.between(Instant.now(), expiry).minus(SAFETY_MARGIN);
        if (remaining.isNegative() || remaining.isZero()) {
            return null;
        }
        return remaining.compareTo(MAX_TTL) < 0 ? remaining : MAX_TTL;
    }

    /** 캐시에 들어 있던 링크와 그 만료 시각. */
    public record CachedUrl(String url, String expiresAt) {
    }
}
