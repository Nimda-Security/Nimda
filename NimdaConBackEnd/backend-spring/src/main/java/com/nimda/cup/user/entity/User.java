package com.nimda.cup.user.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.nimda.cup.group.entity.GroupMembership;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonIgnore
    private Long id;
    // IDNENTITY : AUTO_INCREMENT

    @NotBlank
    @Size(min = 3, max = 20)
    @Column(unique = true, nullable = false)
    private String username;
    // VARCHAR(255)

    @NotBlank
    @Size(min = 4, max = 20)
    @Column(nullable = false)
    private String password;

    @Email
    @NotBlank
    @Column(unique = true, nullable = false)
    private String email;

    // 기본 생성자
    public User() {
    }

    // 필요한 생성자 추가
    public User(String username, String password, String email) {
        this.username = username;
        this.password = password;
        this.email = email;
    }

    // 사용자 권한 관리 테이블
    @ManyToMany(fetch = FetchType.LAZY) // EAGER → LAZY로 변경
    @JoinTable(name = "user_authorities", joinColumns = @JoinColumn(name = "user_id"), // FK
            inverseJoinColumns = @JoinColumn(name = "authority_name") // FK - Authority의 기본키가 authority_name
    )
    @JsonIgnore
    private Set<Authority> authorities = new HashSet<>();

    // 그룹 멤버십 관계 (1:N 관계)
    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<GroupMembership> groupMemberships = new HashSet<>();
}
