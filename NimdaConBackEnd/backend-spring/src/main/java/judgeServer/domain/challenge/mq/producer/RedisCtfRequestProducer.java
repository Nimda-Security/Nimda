package judgeServer.domain.challenge.mq.producer;

import judgeServer.config.CtfQueueProperties;
import judgeServer.domain.challenge.entity.Challenge;
import judgeServer.domain.challenge.mq.message.CtfRequestMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.connection.stream.RecordId;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class RedisCtfRequestProducer implements CtfRequestProducer {

    /** uuid → {userId, challengeCode} 매핑 키 접두사. */
    public static final String OWNER_KEY_PREFIX = "ctf:request:owner:";

    /** 결과를 받아 처리할 때까지만 있으면 된다. 결과 보관 TTL(10분)보다 넉넉히 잡는다. */
    private static final Duration OWNER_TTL = Duration.ofMinutes(30);

    private final StringRedisTemplate redisTemplate;
    private final CtfQueueProperties queueProperties;

    @Override
    public String request(Challenge challenge, Long userId, String uuid) {
        // 매핑을 먼저 남긴다. 발행 뒤에 남기면 그 사이에 결과가 도착해 매핑을 못 찾을 수 있다.
        Map<String, String> owner = new LinkedHashMap<>();
        owner.put("userId", String.valueOf(userId));
        owner.put("challengeCode", challenge.getCode());
        String ownerKey = OWNER_KEY_PREFIX + uuid;
        redisTemplate.opsForHash().putAll(ownerKey, owner);
        redisTemplate.expire(ownerKey, OWNER_TTL);

        RecordId recordId = redisTemplate.opsForStream().add(
                queueProperties.getStreamKey(),
                CtfRequestMessage.of(challenge, uuid).toStreamFields());

        log.info("CTF 요청 발행: uuid={}, challengeCode={}, category={}, stream={}, recordId={}",
                uuid, challenge.getCode(), challenge.getCategory(),
                queueProperties.getStreamKey(), recordId);

        return uuid;
    }

    /** 이 uuid를 요청한 사용자. 매핑이 만료됐으면 null. */
    public Long findUserId(String uuid) {
        Object raw = redisTemplate.opsForHash().get(OWNER_KEY_PREFIX + uuid, "userId");
        if (raw == null) {
            return null;
        }
        try {
            return Long.valueOf(raw.toString());
        } catch (NumberFormatException e) {
            log.warn("요청 매핑의 userId를 읽지 못했습니다: uuid={}, raw={}", uuid, raw);
            return null;
        }
    }

    /** 이 uuid가 어느 문제의 요청이었는지. 매핑이 만료됐으면 null. */
    public String findChallengeCode(String uuid) {
        Object raw = redisTemplate.opsForHash().get(OWNER_KEY_PREFIX + uuid, "challengeCode");
        return raw == null ? null : raw.toString();
    }
}
