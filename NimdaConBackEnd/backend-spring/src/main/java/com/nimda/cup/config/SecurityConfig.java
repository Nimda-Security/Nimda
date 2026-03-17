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
                // 1. CORS 설정 (프론트엔드와 통신 허용)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // 2. CSRF 비활성화 (JWT 사용 시 필수)
                .csrf(csrf -> csrf.disable())

                // 3. 세션 정책 설정 (Stateless)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // 4. JWT 필터 추가
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)

                // 5. 요청별 권한 제어 (순서가 매우 중요함)
                .authorizeHttpRequests(authz -> authz
                        // [우선순위 1] OPTIONS 예비 요청은 무조건 전체 허용 (CORS 해결)
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // [우선순위 2] 로그인 및 회원가입 (통행증 발급 창구)
                        .requestMatchers("/api/auth/login", "/api/auth/register").permitAll()
                        .requestMatchers("/api/auth/me").authenticated()

                        // [우선순위 3] 도현님 마이페이지/좋아요/출석 API (최상단 보호)
                        // 다른 permitAll 규칙에 먹히지 않도록 위로 격상
                        .requestMatchers("/api/like/board/**").authenticated()
                        .requestMatchers("/api/cite/attendance/**").authenticated()
                        .requestMatchers("/api/cite/attachments/**").authenticated()
                        .requestMatchers("/api/cite/point/**").authenticated()

                        // [우선순위 4] 관리자 전용 API (구체적인 경로 우선)
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/users/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/users/*/role").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/groups").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/groups").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/problems/*/admin").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/problems", "/api/contest").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/problems/**", "/api/contest/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/problems/**", "/api/contest/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/cite/category/all").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/cite/category/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/cite/category/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/cite/category/**").hasRole("ADMIN")

                        // [우선순위 5] 공개 조회 API (인증 없이 누구나 GET 가능)
                        // 이 아래에 있는 것들은 오직 GET 요청만 로그인 없이 허용됨
                        .requestMatchers(HttpMethod.GET, "/api/contest/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/problems/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/scoreboard/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/cite/board/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/cite/category/**").permitAll()

                        // [우선순위 6] 게시판 쓰기/수정/삭제 (위의 GET 제외 나머지 메서드 보호)
                        .requestMatchers("/api/cite/board/**").authenticated()

                        // [우선순위 7] 나머지 모든 요청
                        .anyRequest().authenticated()
                );

        return http.build();
    }
}
