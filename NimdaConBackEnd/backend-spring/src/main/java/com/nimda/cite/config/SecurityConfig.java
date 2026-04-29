package com.nimda.cite.config;

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

    // CORS 설정: 프론트엔드 도메인 허용 및 쿠키 전송 허용
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOriginPatterns(Arrays.asList(
                "http://localhost:*",
                "https://nimda.kr",
                "https://*.nimda.kr",
                "https://*.vercel.app"
        ));

        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // 1. CORS 설정 연동
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // 2. CSRF 비활성화 (JWT 사용)
                .csrf(csrf -> csrf.disable())

                // 3. 세션 정책 설정 (Stateless)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // 4. JWT 인증 필터 추가 (UsernamePasswordAuthenticationFilter 실행 전 검사)
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)

                // 5. 요청별 권한 제어 (순서가 매우 중요함)
                .authorizeHttpRequests(authz -> authz
                        // [우선순위 1] OPTIONS 요청은 브라우저 CORS 정책을 위해 전체 허용
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // [우선순위 2] 인증 관련 기본 API
                        .requestMatchers("/api/auth/login", "/api/auth/register").permitAll()
                        .requestMatchers(
                                "/api/auth/me",
                                "/api/auth/email-hide",
                                "/api/auth/profile-image",
                                "/api/auth/profile-decoration"
                        ).authenticated()

                        // [우선순위 3] 비로그인 허용 (Public API - 정보성 데이터)
                        // 메인 페이지 구성에 필요한 기초 정보들은 로그인 없이 GET 허용
                        .requestMatchers(HttpMethod.GET, "/api/cite/attendance/today").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/cite/category/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/cite/attachments/*/download-url").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/cite/profile-decorations/**").permitAll()

                        // [우선순위 4] 인증 필수 API (로그인하지 않으면 접근 불가)
                        // 게시판 조회(GET)를 포함한 모든 게시판 활동은 인증 필요
                        .requestMatchers("/api/cite/board/**").authenticated()
                        .requestMatchers("/api/cite/attendance/**").authenticated()
                        .requestMatchers("/api/cite/point/**").authenticated()
                        .requestMatchers("/api/cite/attachments/**").authenticated()
                        .requestMatchers("/api/like/board/**").authenticated()

                        // 태그: GET은 카테고리와 동일하게 비로그인 허용, 수정/추가/삭제는 관리자 전용
                        .requestMatchers(HttpMethod.GET, "/api/cite/tag/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/cite/tag/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/cite/tag/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/cite/tag/**").hasRole("ADMIN")

                        // 유저 개인/공개 프로필 관련 정보 보호
                        .requestMatchers(HttpMethod.GET, "/api/like/board/user/**").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/cite/point/user/**").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/users/nickname/**").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/comments/user/**").authenticated()

                        // [우선순위 5] 관리자(ADMIN) 전용 API
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/cite/admin/profile-decorations/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/users/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/users/*/role").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/groups", "/api/cite/category/all").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/groups", "/api/problems", "/api/contest").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/problems/**", "/api/contest/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/problems/**", "/api/contest/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/cite/category/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/cite/category/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/cite/category/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/problems/*/admin").hasRole("ADMIN")

                        // [우선순위 6] 기타 공개 조회용 (문제/대회 등)
                        // .requestMatchers(HttpMethod.GET, "/api/contest/**").permitAll()
                        // .requestMatchers(HttpMethod.GET, "/api/problems/**").permitAll()
                        // .requestMatchers(HttpMethod.GET, "/api/scoreboard/**").permitAll()

                        // [우선순위 7] 나머지 모든 요청은 기본적으로 인증 필요
                        .anyRequest().authenticated()
                );

        return http.build();
    }
}
