package com.nimda.cup.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // allowCredentials(true) 사용 시 패턴 사용 필요
        configuration.setAllowedOriginPatterns(Arrays.asList(
                "http://localhost:*", // 로컬 개발 (모든 포트)
                "https://nimda.kr", // 프로덕션 도메인
                "https://*.nimda.kr", // 서브도메인 포함
                "https://nimda-page.vercel.app", // Vercel 프로덕션 (레거시)
                "chrome-extension://*" // ✅ Chrome Extension 추가
        ));

        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true); // 쿠키, 인증 헤더, TLS 클라이언트 인증서와 같은 인증 정보를 CORS 요청에 포함하여 전송할 수 있도록 허용하는 설정

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }

    // Note. Spring Security FilterChain
    // 등록된 필터 체인 리스트
    // 1. CORS 필터
    // 2. CSRF 필터 (비활성화)
    // 3. Stateless 필터
    // 4. Authorization 필터 (permitAll)
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // 1. CORS 설정 적용 필터
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // 2. CSRF 비활성화 (JWT 기반)
                .csrf(csrf -> csrf.disable())

                // 3. 세션 정책 설정
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // 4. 요청별 권한 제어
                .authorizeHttpRequests(authz -> authz
                        // 공개 API (인증 불필요)
                        .requestMatchers("/api/auth/**").permitAll() // 로그인, 회원가입

                        // 관리자 전용 API
                        .requestMatchers("/api/contest").hasRole("ADMIN") // 대회 생성 (POST)
                        .requestMatchers("/api/contest/*/problems/**").hasRole("ADMIN") // 대회 문제 관리
                        .requestMatchers("/api/problems").hasRole("ADMIN") // 문제 생성 (POST)

                        // 나머지는 모두 허용 (JWT 필터 추가 전까지 임시)
                        .anyRequest().permitAll());

        return http.build();
    }
}
