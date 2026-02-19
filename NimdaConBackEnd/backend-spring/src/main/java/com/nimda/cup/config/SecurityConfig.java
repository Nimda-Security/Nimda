package com.nimda.cup.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpMethod;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true) // @PreAuthorize 활성화
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // Note. URL 기반 접근 제어
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // allowCredentials(true) 사용 시 패턴 사용 필요
        configuration.setAllowedOriginPatterns(Arrays.asList(
                "http://localhost:*", // 로컬 개발 (모든 포트)
                "https://nimda.kr", // 프로덕션 도메인
                "https://*.nimda.kr" // 서브도메인 포함
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
    // 4. JWT 인증 필터 (UsernamePasswordAuthenticationFilter 전에 실행)
    // 5. Authorization 필터 (권한 기반 접근 제어)
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // 1. CORS 설정 적용 필터
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // 2. CSRF 비활성화 (JWT 기반)
                .csrf(csrf -> csrf.disable())

                // 3. 세션 정책 설정
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // 4. JWT 필터 추가 (UsernamePasswordAuthenticationFilter 전에 실행)
                // 폼 로그인용 필터라 JWT 방식에서는 사용되지 않으나, 표준 관례상 기준점으로 사용
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)

                // 5. 요청별 권한 제어
                .authorizeHttpRequests(authz -> authz
                        // 공개 API (인증 불필요)
                        .requestMatchers("/api/auth/login").permitAll() // 로그인
                        .requestMatchers("/api/auth/register").permitAll() // 회원가입
                        .requestMatchers("/api/auth/me").authenticated() // 현재 사용자 정보 조회 (인증 필요)

                        // 관리자 전용 API
                        // AdminUserController: /api/admin/** 패턴으로 관리자 권한 설정
                        .requestMatchers("/api/admin/**").hasRole("ADMIN") // 관리자 전용 API

                        // 기존 사용자 관리 API (하위 호환성 유지)
                        .requestMatchers(HttpMethod.DELETE, "/api/users/**").hasRole("ADMIN") // 사용자 삭제
                        .requestMatchers(HttpMethod.PUT, "/api/users/*/role").hasRole("ADMIN") // 사용자 권한 변경

                        // 그룹 관리
                        .requestMatchers(HttpMethod.GET, "/api/groups").hasRole("ADMIN") // 모든 그룹 조회
                        .requestMatchers(HttpMethod.POST, "/api/groups").hasRole("ADMIN") // 그룹 생성

                        // 문제 관리
                        .requestMatchers(HttpMethod.GET, "/api/problems/*/admin").hasRole("ADMIN") // 관리자용 문제 조회 (공개
                                                                                                   // 조회보다 먼저)
                        .requestMatchers(HttpMethod.POST, "/api/problems").hasRole("ADMIN") // 문제 생성
                        .requestMatchers(HttpMethod.PUT, "/api/problems/**").hasRole("ADMIN") // 문제 수정
                        .requestMatchers(HttpMethod.DELETE, "/api/problems/**").hasRole("ADMIN") // 문제 삭제

                        // 대회 관리
                        .requestMatchers(HttpMethod.POST, "/api/contest").hasRole("ADMIN") // 대회 생성
                        .requestMatchers(HttpMethod.PUT, "/api/contest/**").hasRole("ADMIN") // 대회 수정
                        .requestMatchers(HttpMethod.DELETE, "/api/contest/**").hasRole("ADMIN") // 대회 삭제
                        // /api/contest/*/problems/**는 /api/contest/**에 포함되므로 별도 설정 불필요

                        // 공개 조회 API (인증 불필요)
                        .requestMatchers(HttpMethod.GET, "/api/contest/**").permitAll() // 대회 목록/상세 조회
                        .requestMatchers(HttpMethod.GET, "/api/problems/**").permitAll() // 문제 목록/상세 조회
                        .requestMatchers(HttpMethod.GET, "/api/scoreboard/**").permitAll() // 스코어보드 조회
                        .requestMatchers("/api/cite/board/**").permitAll() // 게시판 전체 (조회/작성/수정/삭제 모두 공개)
                        .requestMatchers("/api/cite/category/**").permitAll() // 카테고리 조회 (공개)

                        // 나머지는 인증 필요
                        .anyRequest().authenticated());

        return http.build();
    }
}
