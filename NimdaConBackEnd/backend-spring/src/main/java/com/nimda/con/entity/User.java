package com.nimda.con.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter
@NoArgsConstructor
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
    public User() {}
    
    // 필요한 생성자 추가
    public User(String username, String password, String email) {
        this.username = username;
        this.password = password;
        this.email = email;
    }

    // 사용자 권한 관리 테이블 
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "user_authorities",
        joinColumns = @JoinColumn(name = "user_id"), // FK
        inverseJoinColumns = @JoinColumn(name = "authority_id") // FK
    )
    @JsonIgnore
    private Set<Authority> authorities = new HashSet<>();
}
