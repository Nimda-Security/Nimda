package com.nimda.cite.Verfication.Service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
@RequiredArgsConstructor
public class VerificationService {
    private final StringRedisTemplate redisTemplate;

    public void saveVerificationCode(String email, String code) {
        // key: 이메일, value: 인증번호, 유효시간: 5분
        ValueOperations<String, String> ops = redisTemplate.opsForValue();
        ops.set(email, code, Duration.ofMinutes(5));
    }

    // 데이터 저장 (키, 값, 유효시간)
    public void setDataWithExpiration(String key, String value, long duration) {
        Duration expireDuration = Duration.ofSeconds(duration);
        ValueOperations<String, String> valueOperations = redisTemplate.opsForValue();
        valueOperations.set(key, value, expireDuration);
    }

    // 데이터 가져오기
    public String getData(String key) {
        ValueOperations<String, String> valueOperations = redisTemplate.opsForValue();
        return valueOperations.get(key);
    }

    // 데이터 삭제하기
    public void deleteData(String key) {
        redisTemplate.delete(key);
    }
}
