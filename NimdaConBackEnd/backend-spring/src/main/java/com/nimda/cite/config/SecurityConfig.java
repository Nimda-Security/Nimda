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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;
import org.springframework.security.web.header.writers.StaticHeadersWriter;
import org.springframework.boot.web.servlet.FilterRegistrationBean;

import java.util.List;
import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true) // @PreAuthorize 활성화
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;
    @Autowired
    private JudgeCallbackAuthFilter judgeCallbackAuthFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Spring Boot 는 서블릿 컨테이너에 등록된 {@code Filter} 빈을 자동으로 전역 필터로
     * 등록한다. 두 필터는 {@code @Component} 이면서 아래 SecurityFilterChain 에도
     * 등록되므로, 자동 등록을 끄지 않으면 매 요청마다 두 번 실행되고
     * 보안 규칙의 실제 적용 지점이 SecurityFilterChain 이 아니게 된다.
     *
     * 자동 등록을 비활성화해서 필터 체인이 유일한 등록 지점이 되도록 한다.
     */
    @Bean
    public FilterRegistrationBean<JwtAuthenticationFilter> disableJwtFilterAutoRegistration(
            JwtAuthenticationFilter filter) {
        FilterRegistrationBean<JwtAuthenticationFilter> registration =
                new FilterRegistrationBean<>(filter);
        registration.setEnabled(false);
        return registration;
    }

    @Bean
    public FilterRegistrationBean<JudgeCallbackAuthFilter> disableJudgeCallbackFilterAutoRegistration(
            JudgeCallbackAuthFilter filter) {
        FilterRegistrationBean<JudgeCallbackAuthFilter> registration =
                new FilterRegistrationBean<>(filter);
        registration.setEnabled(false);
        return registration;
    }

    /**
     * CORS 허용 Origin 목록 (콤마 구분).
     *
     * 보안 주의: allowCredentials=true 이므로 서드파티 와일드카드(예: https://*.vercel.app)를
     * 넣으면 임의의 Vercel 배포본이 인증 쿠키를 실은 교차 출처 요청을 보낼 수 있다.
     * 프리뷰 배포를 허용해야 한다면 CORS_ALLOWED_ORIGINS 에 해당 배포 URL만 명시적으로 추가한다.
     */
    @Value("${cors.allowed-origins:https://nimda.kr,https://*.nimda.kr,http://localhost:*,http://127.0.0.1:*}")
    private String allowedOrigins;

    // CORS 설정: 프론트엔드 도메인 허용 및 쿠키 전송 허용
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        List<String> originPatterns = Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(origin -> !origin.isEmpty())
                .toList();

        configuration.setAllowedOriginPatterns(originPatterns);
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setExposedHeaders(Arrays.asList("Content-Disposition"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

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

                // 4-1. 채점 결과 콜백 공유 시크릿 검증 (fail-closed)
                .addFilterBefore(judgeCallbackAuthFilter, UsernamePasswordAuthenticationFilter.class)

                // 4-2. API 보안 응답 헤더
                .headers(headers -> headers
                        .contentTypeOptions(contentType -> {})
                        .frameOptions(frame -> frame.deny())
                        .httpStrictTransportSecurity(hsts -> hsts
                                .includeSubDomains(true)
                                .maxAgeInSeconds(31536000))
                        .referrerPolicy(referrer -> referrer
                                .policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.SAME_ORIGIN))
                        // 순수 API 서버이므로 문서/스크립트 렌더링을 전면 차단한다.
                        .contentSecurityPolicy(csp -> csp
                                .policyDirectives("default-src 'none'; frame-ancestors 'none'; base-uri 'none'"))
                        .addHeaderWriter(new StaticHeadersWriter(
                                "Permissions-Policy", "geolocation=(), microphone=(), camera=()"))
                )

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
                        .requestMatchers(HttpMethod.GET, "/api/cite/profile-decorations/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/cite/attendance/today").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/cite/category/**").permitAll()
                        .requestMatchers("/api/cite/mail/**").permitAll()
                        .requestMatchers("/api/cite/passwordChange/**").permitAll()
                        .requestMatchers("/error").permitAll()

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

                        // 채점 서버 api
                        .requestMatchers(HttpMethod.POST, "/api/judge/problem").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/judge/problem/toggle-public").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/judge/problem").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/judge/problem/**").authenticated()

                        // 재출 api
                        // 채점 결과 콜백: 채점 서버가 공유 시크릿 헤더로 인증한다.
                        // (JudgeCallbackAuthFilter 가 X-Judge-Secret 를 fail-closed 로 검증)
                        .requestMatchers(HttpMethod.POST, "/api/judge/submission/result").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/judge/submission").authenticated()

                        // [우선순위 7] 나머지 모든 요청은 기본적으로 인증 필요
                        .anyRequest().authenticated()
                );

        return http.build();
    }
}
