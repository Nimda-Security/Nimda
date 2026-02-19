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
public class CustomUserDetails implements UserDetails {

    private final User user;

    // Constructor
    public CustomUserDetails(User user) {
        this.user = user;
    }

    // getAuthorities - 사용자 권한 목록을 반환한다.
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return user.getAuthorities().stream()
                .map(authority -> new SimpleGrantedAuthority(authority.getAuthorityName()))
                .collect(Collectors.toList());
    }

    // getPassword - 사용자 비밀번호를 반환한다.
    @Override
    public String getPassword() {
        return user.getPassword();
    }

    // getUsername - 사용자명을 반환한다.
    @Override
    public String getUsername() {
        return user.getUserId();
    }

    // isAccountNonExpired - 계정 만료 기능 (Default : true)
    @Override
    public boolean isAccountNonExpired() {
        return true; // 현재는 계정 만료 기능 미사용
    }

    // isAccountNonLocked - 계정 잠금 기능
    @Override
    public boolean isAccountNonLocked() {
        return true; // 현재는 계정 잠금 기능 미사용
    }

    // isCredentialsNonExpired - 비밀번호 만료 기능
    @Override
    public boolean isCredentialsNonExpired() {
        return true; // 현재는 자격 증명 만료 기능 미사용
    }

    // isEnabled - 계정 활성화 기능
    @Override
    public boolean isEnabled() {
        return true; // 현재는 계정 비활성화 기능 미사용
    }

    // Domain Entity 반환용 Getter
    public User getUser() {
        return user;
    }
}
