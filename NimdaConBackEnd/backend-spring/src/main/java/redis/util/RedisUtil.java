package redis.util;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
public class RedisUtil {

    private final StringRedisTemplate redisTemplate;

    public void setDataWithExpiration(String key, String value, long duration) {
        ValueOperations<String, String> valueOperations = redisTemplate.opsForValue();
        Duration expireDuration = Duration.ofSeconds(duration);
        valueOperations.set(key, value, expireDuration);

        // 디버깅 로그
        System.out.println(key+" "+value+" "+duration);
    }

    public String getData(String key) {
        return redisTemplate.opsForValue().get(key);
    }

    public void deleteData(String key) {
        redisTemplate.delete(key);
    }

    // 블랙 리스트 구현 메소드
    /**
     * [추가] 키의 값을 1 증가시키고, 최초 생성 시에만 만료 시간을 설정합니다.
     * 원자적 연산(INCR)을 수행하므로 동시성 문제를 완벽히 방지합니다.
     */
    public long incrementAndSetTtl(String key) {
        ValueOperations<String, String> valueOperations = redisTemplate.opsForValue();

        // Redis INCR 수행 (값이 없었다면 0에서 1이 되고, 있었다면 기존 값 + 1)
        Long count = valueOperations.increment(key);

        // 만료시간 계산
        long secToMid = getSecondsToMidnight();

        // 최초로 키가 생성된 경우 (값이 1인 경우)에만 만료시간(자정까지의 시간 등)을 설정
        if (count != null && count == 1) {
            redisTemplate.expire(key, Duration.ofSeconds(secToMid));
        }

        return count != null ? count : 0L;
    }

    // 자정까지 남은 초 계산하는 모듈
    private long getSecondsToMidnight() {
        LocalDateTime now = LocalDateTime.now();

        // 오늘 날짜에서 하루를 더한 뒤, 시간은 00:00:00(자정)으로 셋팅
        LocalDateTime nextMidnight = now.plusDays(1).toLocalDate().atStartOfDay();

        // 두 시간 사이의 차이를 초(Seconds) 단위로 정확하게 반환
        return ChronoUnit.SECONDS.between(now, nextMidnight);
    }
}