package com.nimda.cup.user.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.nimda.cup.common.entity.BaseTimeEntity;
import com.nimda.cup.group.entity.GroupMembership;
import com.nimda.cup.user.enums.ApprovalStatus;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
@Getter
@Setter
@AllArgsConstructor
public class User extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(min = 3, max = 20)
    @Column(name = "user_id", unique = true, nullable = false)
    private String userId;
    // 로그인 아이디 (변경 불가능, 고유)

    @NotBlank
    @Size(min = 2, max = 10)
    @Column(name = "name", nullable = false, length = 10)
    private String name;
    // 실명

    @NotBlank
    @Size(min = 3, max = 20)
    @Column(name = "nickname", unique = true, nullable = false, length = 20)
    private String nickname;
    // 닉네임 (변경 가능, 표시용)

    @NotBlank
    @Size(min = 4, max = 255)
    @Column(nullable = false, length = 255)
    @JsonIgnore // 보안: 비밀번호는 JSON 응답에서 제외
    private String password;

    @NotBlank
    @Size(min = 9, max = 9)
    @Column(name = "student_num", nullable = false, length = 20)
    private String studentNum;
    // 학번 (9글자 고정)

    @NotBlank
    @Email
    @Column(unique = true, nullable = false, length = 40)
    private String email;

    @Column(name = "university_name", length = 100)
    private String universityName;

    @NotBlank
    @Size(max = 20)
    @Column(name = "major", nullable = false, length = 20)
    private String major;
    // 학과 (department → major로 변경)

    @Column(name = "grade", length = 20)
    private String grade;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private ApprovalStatus status = ApprovalStatus.PENDING;
    // 사용자 승인 상태 (PENDING: 승인 대기, APPROVED: 승인 완료, REJECTED: 승인 거부)

    @Column(name = "birth", length = 20)
    private String birth;
    // 생년월일

    @Column(name = "profile_image", length = 255)
    private String profileImage;
    // 프로필 이미지 URL

    // 기본 생성자
    public User() {
    }

    // ERD 기반 전체 필드 생성자
    public User(String userId, String name, String nickname, String password,
            String studentNum, String email, String major) {
        this.userId = userId;
        this.name = name;
        this.nickname = nickname;
        this.password = password;
        this.studentNum = studentNum;
        this.email = email;
        this.major = major;
    }

    // 사용자 권한 관리 테이블
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "user_authority", joinColumns = @JoinColumn(name = "user_id"), // FK → users.id
            inverseJoinColumns = @JoinColumn(name = "authority_id") // FK → authority.id
    )
    @JsonIgnore
    private Set<Authority> authorities = new HashSet<>();

    // 그룹 멤버십 관계 (1:N 관계)
    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<GroupMembership> groupMemberships = new HashSet<>();
}
