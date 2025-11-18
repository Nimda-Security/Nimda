package com.nimda.cup.common.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtUtil {

    @Value("${jwt.secret:nimda-cup-secret-key-2024-very-long-secret-key-for-jwt-security}")
    private String secret;

    @Value("${jwt.expiration:86400000}") // 24시간
    private Long expiration;

    /**
     * JWT 토큰 생성
     * 
     * @param nickname 닉네임
     * @param userId   사용자 ID
     * @return JWT 토큰
     */
    public String generateToken(String nickname, Long userId) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("sub", userId);
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
        claims.put("sub", userId);
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
                .setSubject(subject)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
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

    /**
     * 토큰에서 사용자 ID 추출
     * 
     * @param token JWT 토큰
     * @return 사용자 ID
     */
    public Long extractUserId(String token) {
        return extractClaim(token, claims -> claims.get("sub", Long.class));
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
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
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

    /**
     * 서명 키 생성
     * 
     * @return 서명 키
     */
    private SecretKey getSigningKey() {
        byte[] keyBytes = secret.getBytes();
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
