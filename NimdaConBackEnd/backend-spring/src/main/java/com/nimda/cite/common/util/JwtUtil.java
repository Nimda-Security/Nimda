package com.nimda.cite.common.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtUtil {

    private static final Logger log = LoggerFactory.getLogger(JwtUtil.class);

    @Value("${jwt.secret}")
    private String secret;

    /**
     * 토큰 만료 시간(초). TokenProvider 와 동일한 프로퍼티를 사용해
     * 두 컴포넌트의 토큰 수명이 어긋나지 않게 한다.
     */
    @Value("${jwt.token-validity-in-seconds:86400}")
    private long tokenValidityInSeconds;

    private Key key;

    @PostConstruct
    public void init() {
        // TokenProvider랑 같은 방식으로 통일
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        this.key = Keys.hmacShaKeyFor(keyBytes);
    }
    
    /**
     * JWT 토큰 생성
     * 
     * @param nickname 닉네임
     * @param userId   사용자 ID
     * @return JWT 토큰
     */
    public String generateToken(String nickname, Long userId) {
        Map<String, Object> claims = new HashMap<>();
        // 기존 코드 (문제 있음): claims.put("sub", userId);
        // 문제: setSubject()가 sub 필드를 String으로 덮어써서 userId 추출 실패
        claims.put("userId", userId);  // 수정: sub 대신 userId 클레임 사용
        claims.put("nickname", nickname);
        return createToken(claims, nickname);
    }

    /**
     * JWT 토큰 생성 (권한 정보 포함)
     * 
     * @param nickname    닉네임
     * @param userId      사용자 ID
     * @param authorities 권한 목록
     * @return JWT 토큰
     */
    public String generateToken(String nickname, Long userId, java.util.List<String> authorities) {
        Map<String, Object> claims = new HashMap<>();
        // 기존 코드 (문제 있음): claims.put("sub", userId);
        // 문제: setSubject()가 sub 필드를 String으로 덮어써서 userId 추출 실패
        claims.put("userId", userId);  // 수정: sub 대신 userId 클레임 사용
        claims.put("nickname", nickname);
        claims.put("authorities", authorities);
        return createToken(claims, nickname);
    }

    /**
     * JWT 토큰 생성 (내부 메서드)
     * 
     * @param claims  클레임
     * @param subject 주제
     * @return JWT 토큰
     */
    private String createToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
                .setClaims(claims)
                // 주의: setSubject()는 claims의 "sub" 필드를 String으로 덮어씁니다!
                // 따라서 userId는 "sub"가 아닌 "userId" 클레임에 저장해야 합니다.
                .setSubject(subject)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + tokenValidityInSeconds * 1000L))
                .signWith(this.key, SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * 토큰에서 닉네임 추출
     * 
     * @param token JWT 토큰
     * @return 닉네임
     */
    public String extractNickname(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * 토큰에서 사용자명 추출 (하위 호환성 유지)
     * 
     * @param token JWT 토큰
     * @return 닉네임
     * @deprecated extractNickname() 사용 권장
     */
    @Deprecated
    public String extractUsername(String token) {
        return extractNickname(token);
    }


    public String extractId(String token) {
        Claims claims = extractAllClaims(token);

        return claims.get("userId", String.class);
    }

    /**
     * 토큰에서 사용자 ID 추출
     * 
     * @param token JWT 토큰
     * @return 사용자 ID
     */
    public Long extractUserId(String token) {
        // 기존 코드 (문제 있음): return extractClaim(token, claims -> claims.get("sub", Long.class));
        // 문제: sub 필드가 String(닉네임)으로 덮어써져서 Long으로 변환 실패 → null 반환
        // 수정: userId 클레임에서 추출
        return extractClaim(token, claims -> {
            Object userIdObj = claims.get("userId");
            if (userIdObj instanceof Long) {
                return (Long) userIdObj;
            } else if (userIdObj instanceof Integer) {
                return ((Integer) userIdObj).longValue();
            } else if (userIdObj instanceof Number) {
                return ((Number) userIdObj).longValue();
            }
            return null;
        });
    }

    public String extractSubject(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claims.getSubject();
    }
    /**
     * 토큰에서 권한 목록 추출
     * 
     * @param token JWT 토큰
     * @return 권한 목록
     */
    @SuppressWarnings("unchecked")
    public java.util.List<String> extractAuthorities(String token) {
        Object authoritiesObj = extractClaim(token, claims -> claims.get("authorities"));
        if (authoritiesObj instanceof java.util.List) {
            return (java.util.List<String>) authoritiesObj;
        }
        return new java.util.ArrayList<>();
    }

    /**
     * 토큰에서 만료일 추출
     * 
     * @param token JWT 토큰
     * @return 만료일
     */
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    /**
     * 토큰에서 특정 클레임 추출
     * 
     * @param token          JWT 토큰
     * @param claimsResolver 클레임 리졸버
     * @return 클레임 값
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * 토큰에서 모든 클레임 추출
     * 
     * @param token JWT 토큰
     * @return 모든 클레임
     */
    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(this.key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public String extractClaimByKey(String token,String key) {
        return extractClaim(token, claims -> claims.get(key, String.class));
    }

    /**
     * 토큰 만료 여부 확인
     * 
     * @param token JWT 토큰
     * @return 만료 여부
     */
    public Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    /**
     * 토큰 유효성 검증
     * 
     * @param token    JWT 토큰
     * @param nickname 닉네임
     * @return 유효성 여부
     */
    public Boolean validateToken(String token, String nickname) {
        final String extractedNickname = extractNickname(token);
        return (extractedNickname.equals(nickname) && !isTokenExpired(token));
    }

    /**
     * 비밀번호 재설정 토큰 검증.
     *
     * 보안: 입력값/토큰 클레임(userId·학번·이메일)은 PII 이므로 로그로 남기지 않는다.
     */
    public Boolean validateToken(String token, String userId, String studentNum,
                                 String email) {
        try {
            final Claims claims = extractAllClaims(token);
            String tokenUserId = claims.get("userId", String.class);
            String tokenStudentNum = claims.get("studentNum", String.class);
            String tokenEmail = claims.get("email", String.class);

            return userId.equals(tokenUserId)
                    && studentNum.equals(tokenStudentNum)
                    && email.equals(tokenEmail);

        } catch (Exception e) {
            log.warn("비밀번호 재설정 토큰 검증 실패: {}", e.getClass().getSimpleName());
            return false;
        }
    }

    /**
     * 토큰 유효성 검증 (하위 호환성 유지)
     * 
     * @param token    JWT 토큰
     * @param username 닉네임
     * @return 유효성 여부
     * @deprecated validateToken(String token, String nickname) 사용 권장
     */
    @Deprecated
    public Boolean validateTokenWithUsername(String token, String username) {
        return validateToken(token, username);
    }



}
