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
        // allowCredentials(true) 사용 시 정확한 Origin 명시 필요
        configuration.setAllowedOrigins(Arrays.asList(
                "http://localhost:3000", // 로컬 개발 (React/Next.js)
                "http://localhost:5173", // 로컬 개발 (Vite)
                "http://localhost:5174", // 로컬 개발 (Vite 대체 포트)
                "https://nimda-page.vercel.app" // Vercel 프로덕션
        ));

        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    // 기존 Configure - Spring Security 설정
    // CORS, CSRF, 세션정책, 인증규칙 등을 설정한다.
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authz -> authz
                        .requestMatchers("/api/**").permitAll()
                        .requestMatchers("/").permitAll()
                        .anyRequest().permitAll());

        return http.build();
    }
}

// authorizeHttpRequests() (Spring Security 6.x) (기존 : authorizeRequest*()
// Spring Security 5.x)
// HttpServeletRequest를 사용하는 요청들에 대한 접근 제한을 설정한다.
// 기존 방식 : 메서드 체이닝
// 새로운 방식 : 람다 함수 사용

// requstMatchers(path) (기존 : antMatchers Spring Security 5.x)
// 해당 path로 들어오는 요청은 인증 없이 접근을 허용한다.
// .anyRequest().authenticated() 나머지 요청들은 모두 인증 되어야 함