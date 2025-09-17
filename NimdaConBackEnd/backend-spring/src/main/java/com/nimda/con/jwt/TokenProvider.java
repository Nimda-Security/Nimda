package com.nimda.con.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.*;
import java.security.Key;

@Component
public class TokenProvider implements InitializingBean {

    private final Logger logger = LoggerFactory.getLogger(TokenProvider.class);
    private final long tokenValidityInMilliseconds; 
    private final String secret; 
    private Key key; // JWT는 보안상 이유는 문자열을 직접 받지 않으며, Key 객체를 요구한다. 

    // Logic1 : Bean 생성 후 의존성 주입 
    // @Value("${jwt.secret}") String secret : application.yml에서 jwt.secret 탐색
    // JWT 토큰을 서명할 때 사용하는 비밀키로, 
    // 토큰의 무결성을 보장하는 핵심 키이다. 

    public TokenProvider (
        @Value("${jwt.secret}") String secret, 
        @Value("${jwt.token-validity-in-seconds}") long tokenValidityInSeconds)
    {
        this.secret = secret;
        this.tokenValidityInMilliseconds = tokenValidityInSeconds * 1000; // 초를 밀리초로 변환
    }


    // Logic2 : 주입받은 Secret Value를 Base64 Decoding 
    // And Key value에 할당 
    // key : JWT 서명/검증에 사용할 실제 키
    // HMAC-SHA256 알고리즘에 맞는 키로 변환한다. 

    @Override
    public void afterPropertiesSet() throws Exception {
        byte[] keyBytes = Decoders.BASE64.decode(secret); // BASE64 디코딩 
        this.key = Keys.hmacShaKeyFor(keyBytes); // 
    }




}
