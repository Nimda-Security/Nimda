package judgeServer.domain.challenge.instance.Repository;

import judgeServer.domain.challenge.mq.consumer.CtfResultConsumer;
import judgeServer.domain.challenge.mq.message.CtfResultMessage;
import judgeServer.domain.challenge.mq.stream.StreamResultStore;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Optional;

/**
 * ctf에서 받아온 인스턴스 정보는 접두사+uuid로 저장되어 만료되기 전까지 redis에 저장된다.
 * 읽는 방식은 다운로드 결과와 같아서 {@link StreamResultStore}가 담당하고, 여기서는
 * "어느 접두사에서 어떤 메시지로 읽을지"만 정한다.
 *
 * <p>여기에 더해 "이 사용자가 이 문제로 띄운 인스턴스가 무엇인가"를 찾기 위한 역방향 매핑을 둔다.
 * 결과는 uuid로만 저장되는데, 사용자는 문제 페이지에서 uuid를 들고 있지 않기 때문이다.
 *
 * <pre>
 *   ctf:instance:user-map:{userId}:{challengeId}  ─(String)─►  uuid
 *   ctf:result:{uuid}               ─(Hash)───►  status/host/port/...
 * </pre>
 */
@Service
public class InstanceResultStore extends StreamResultStore<CtfResultMessage> {

    /** 결과 키(ctf:result:{uuid})와 섞이지 않도록 접두사를 따로 판다. */
    private static final String USER_CHALLENGE_MAP_PREFIX = "ctf:instance:user-map:";

    private final StringRedisTemplate redisTemplate;

    public InstanceResultStore(StringRedisTemplate redisTemplate) {
        super(redisTemplate, CtfResultConsumer.RESULT_KEY_PREFIX, CtfResultMessage::fromStreamFields);
        this.redisTemplate = redisTemplate;
    }

    /**
     * 이 사용자가 이 문제로 요청해 둔 인스턴스의 uuid. 결과가 아직 안 왔어도(생성 중) 값이 있다.
     */
    public Optional<String> findUuid(Long userId, Long challengeId) {
        if (userId == null || challengeId == null) {
            return Optional.empty();
        }
        String uuid = redisTemplate.opsForValue().get(userChallengeKey(userId, challengeId));
        return (uuid == null || uuid.isBlank()) ? Optional.empty() : Optional.of(uuid);
    }

    /**
     * 이 사용자가 이 문제로 띄운 인스턴스의 결과. 매핑이 없거나 결과가 아직/더 이상 없으면 empty.
     *
     * <p>결과가 없다고 매핑을 지우지는 않는다. 생성 요청 직후에는 매핑만 있고 결과는 아직 없는
     * 것이 정상이라, 여기서 지우면 만들어지는 중인 인스턴스를 잃어버린다. 정리는 TTL에 맡긴다.
     */
    public Optional<CtfResultMessage> findByUserIdAndChallengeId(Long userId, Long challengeId) {
        return findUuid(userId, challengeId).flatMap(this::find);
    }

    /** userId:challengeId → uuid 매핑을 기록한다. 같은 문제로 다시 요청하면 덮어쓴다. */
    public void saveUserChallengeMapping(Long userId, Long challengeId, String uuid, Duration ttl) {
        redisTemplate.opsForValue().set(userChallengeKey(userId, challengeId), uuid, ttl);
    }

    /** 매핑을 지운다. 발행에 실패했거나 인스턴스를 버릴 때 쓴다. */
    public void deleteUserChallengeMapping(Long userId, Long challengeId) {
        redisTemplate.delete(userChallengeKey(userId, challengeId));
    }

    private String userChallengeKey(Long userId, Long challengeId) {
        return USER_CHALLENGE_MAP_PREFIX + userId + ":" + challengeId;
    }
}
