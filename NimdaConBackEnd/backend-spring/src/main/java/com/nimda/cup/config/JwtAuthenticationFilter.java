package com.nimda.cup.config;

import com.nimda.cup.common.util.JwtUtil;
import com.nimda.cup.user.entity.User;
import com.nimda.cup.user.repository.UserRepository;
import com.nimda.cup.user.security.UserPrincipal;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Optional;

/**
 * JWT 인증 필터
 * 매 요청마다 JWT 토큰을 검증하고 SecurityContext에 인증 정보를 설정한다.
 * 
 * Logic
 * 1. Authorization Header에서 Token을 추출한다.
 * 2. 토큰을 검증한다.
 * 3. SecurityContext를 설정한다.
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        // Authorization 헤더에서 토큰 추출
        String authHeader = request.getHeader("Authorization");
        String token = null;

        // "Bearer " 접두사 제거
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
            try {
                // 토큰에서 사용자 ID 추출
                Long userId = jwtUtil.extractUserId(token);

                if (userId != null) {
                    // 사용자 ID로 사용자 조회 (권한 정보 포함)
                    Optional<User> userOpt = userRepository.findById(userId);

                    if (userOpt.isPresent()) {
                        User user = userOpt.get();

                        // 토큰 유효성 검증
                        if (jwtUtil.validateToken(token, user.getNickname())) {
                            // UserPrincipal 생성
                            UserPrincipal userPrincipal = new UserPrincipal(user);

                            // Authentication 객체 생성
                            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                                    userPrincipal,
                                    null,
                                    userPrincipal.getAuthorities());

                            // 요청 정보 설정
                            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                            // SecurityContext에 인증 정보 설정
                            SecurityContextHolder.getContext().setAuthentication(authentication);
                        }
                    }
                }
            } catch (Exception e) {
                // 토큰 검증 실패 시 로그만 남기고 계속 진행
                logger.error("JWT 토큰 검증 실패", e);
            }
        }

        // 다음 필터로 요청 전달
        filterChain.doFilter(request, response);
    }
}
