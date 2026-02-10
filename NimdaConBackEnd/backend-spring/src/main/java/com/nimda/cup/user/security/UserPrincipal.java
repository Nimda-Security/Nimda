package com.nimda.cup.user.security;

import com.nimda.cup.user.entity.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.stream.Collectors;

/**
 * UserDetails 구현 클래스
 * Spring Security가 사용하는 사용자 인증 정보를 제공
 */
public class UserPrincipal implements UserDetails {

    private final User user;

    public UserPrincipal(User user) {
        this.user = user;
    }

    /**
     * 사용자 권한 목록 반환
     * User 엔터티의 authorities를 GrantedAuthority로 변환
     */
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return user.getAuthorities().stream()
                .map(authority -> new SimpleGrantedAuthority(authority.getAuthorityName()))
                .collect(Collectors.toList());
    }

    /**
     * 사용자 비밀번호 반환
     */
    @Override
    public String getPassword() {
        return user.getPassword();
    }

    /**
     * 사용자 식별자 반환 (userId 사용)
     * Spring Security는 username을 식별자로 사용
     */
    @Override
    public String getUsername() {
        return user.getUserId();
    }

    /**
     * 계정이 만료되지 않았는지 확인
     */
    @Override
    public boolean isAccountNonExpired() {
        return true; // 현재는 계정 만료 기능 미사용
    }

    /**
     * 계정이 잠겨있지 않은지 확인
     */
    @Override
    public boolean isAccountNonLocked() {
        return true; // 현재는 계정 잠금 기능 미사용
    }

    /**
     * 자격 증명(비밀번호)이 만료되지 않았는지 확인
     */
    @Override
    public boolean isCredentialsNonExpired() {
        return true; // 현재는 자격 증명 만료 기능 미사용
    }

    /**
     * 계정이 활성화되어 있는지 확인
     */
    @Override
    public boolean isEnabled() {
        return true; // 현재는 계정 비활성화 기능 미사용
    }

    /**
     * User 엔터티 반환 (추가 정보 접근용)
     */
    public User getUser() {
        return user;
    }
}
