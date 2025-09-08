package com.nimda.con.util;

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
    
    @Value("${jwt.secret:nimda-con-secret-key-2024}")
    private String secret;
    
    @Value("${jwt.expiration:86400000}") // 24시간
    private Long expiration;
    
    /**
     * JWT 토큰 생성
     * @param username 사용자명
     * @param userId 사용자 ID
     * @return JWT 토큰
     */
    public String generateToken(String username, Long userId) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("sub", userId);
        claims.put("username", username);
        return createToken(claims, username);
    }
    
    /**
     * JWT 토큰 생성 (내부 메서드)
     * @param claims 클레임
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
     * 토큰에서 사용자명 추출
     * @param token JWT 토큰
     * @return 사용자명
     */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }
    
    /**
     * 토큰에서 사용자 ID 추출
     * @param token JWT 토큰
     * @return 사용자 ID
     */
    public Long extractUserId(String token) {
        return extractClaim(token, claims -> claims.get("sub", Long.class));
    }
    
    /**
     * 토큰에서 만료일 추출
     * @param token JWT 토큰
     * @return 만료일
     */
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }
    
    /**
     * 토큰에서 특정 클레임 추출
     * @param token JWT 토큰
     * @param claimsResolver 클레임 리졸버
     * @return 클레임 값
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }
    
    /**
     * 토큰에서 모든 클레임 추출
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
     * @param token JWT 토큰
     * @return 만료 여부
     */
    public Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }
    
    /**
     * 토큰 유효성 검증
     * @param token JWT 토큰
     * @param username 사용자명
     * @return 유효성 여부
     */
    public Boolean validateToken(String token, String username) {
        final String extractedUsername = extractUsername(token);
        return (extractedUsername.equals(username) && !isTokenExpired(token));
    }
    
    /**
     * 서명 키 생성
     * @return 서명 키
     */
    private SecretKey getSigningKey() {
        byte[] keyBytes = secret.getBytes();
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
