package com.nimda.cite.Verfication.Service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
@RequiredArgsConstructor
public class VerificationService {

    private final RedisTemplate<String, String> redisTemplate;
    private final long VERIFICATION_LIMIT_SEC = 300L; // 5분

    public void saveVerificationCode(String email, String code) {
        // key: 이메일, value: 인증번호, timeout: 5분
        redisTemplate.opsForValue().set(email, code, Duration.ofSeconds(VERIFICATION_LIMIT_SEC));
    }

    // 데이터 저장 (키, 값, 유효시간)
    public void setDataWithExpiration(String key, String value, long duration) {
        Duration expireDuration = Duration.ofSeconds(duration);
        ValueOperations<String, String> valueOperations = redisTemplate.opsForValue();
        valueOperations.set(key, value, expireDuration);
    }

    public boolean verifyCode(String email, String code) {
        String savedCode = redisTemplate.opsForValue().get(email);
        return code.equals(savedCode);
    }
}
