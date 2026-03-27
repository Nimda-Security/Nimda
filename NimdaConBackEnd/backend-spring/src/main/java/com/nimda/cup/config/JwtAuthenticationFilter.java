package com.nimda.cup.config;

import com.nimda.cup.common.util.JwtUtil;
import com.nimda.cup.user.entity.User;
import com.nimda.cup.user.repository.UserRepository;
import com.nimda.cup.user.security.CustomUserDetails;
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

        String token = null;

        // 1. Authorization 헤더 대신 쿠키에서 토큰 추출
        jakarta.servlet.http.Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (jakarta.servlet.http.Cookie cookie : cookies) {
                if ("Authorization".equals(cookie.getName())) { // 쿠키 이름 설정
                    token = cookie.getValue();
                    break;
                }
            }
        }

        // 2. 토큰이 존재할 경우 기존 로직 수행
        if (token != null) {
            try {
                Long userId = jwtUtil.extractUserId(token);

                if (userId != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    Optional<User> userOpt = userRepository.findById(userId);

                    if (userOpt.isPresent()) {
                        User user = userOpt.get();

                        // 닉네임 기반 검증 (기존 로직 유지)
                        if (jwtUtil.validateToken(token, user.getNickname())) {
                            CustomUserDetails customUserDetails = new CustomUserDetails(user);
                            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                                    customUserDetails,
                                    null,
                                    customUserDetails.getAuthorities());

                            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                            SecurityContextHolder.getContext().setAuthentication(authentication);
                        }
                    }
                }
            } catch (Exception e) {
                logger.error("JWT 토큰 검증 실패", e);
            }
        }

        filterChain.doFilter(request, response);
    }
}