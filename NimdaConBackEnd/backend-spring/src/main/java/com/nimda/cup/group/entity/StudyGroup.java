package com.nimda.cup.group.entity;

import com.nimda.cup.user.entity.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "study_groups")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StudyGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "group_id")
    private Long id;

    @NotBlank
    @Column(name = "group_name", nullable = false, length = 100)
    private String groupName;

    @NotNull
    @Positive
    @Column(name = "max_members", nullable = false)
    private Integer maxMembers;

    @Column(name = "participation_code", unique = true, length = 20)
    private String participationCode; // 초대 코드

    @NotNull
    @Column(name = "is_public", nullable = false)
    private Boolean isPublic = false; // 기본값: 비공개

    // 그룹 생성자 (N:1 관계)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    // 그룹 멤버십 관계 (1:N 관계)
    @OneToMany(mappedBy = "group", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<GroupMembership> members = new HashSet<>();

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // 생성용 생성자
    public StudyGroup(String groupName, Integer maxMembers, String participationCode, Boolean isPublic,
            User createdBy) {
        this.groupName = groupName;
        this.maxMembers = maxMembers;
        this.participationCode = participationCode;
        this.isPublic = isPublic;
        this.createdBy = createdBy;
    }

    /**
     * 현재 활성 멤버 수 반환
     */
    public int getActiveMemberCount() {
        return (int) members.stream()
                .filter(m -> m.getLeftAt() == null)
                .count();
    }

    /**
     * 그룹이 가득 찼는지 확인
     */
    public boolean isFull() {
        return getActiveMemberCount() >= maxMembers;
    }

    /**
     * 사용자가 그룹에 속해있는지 확인
     */
    public boolean hasMember(User user) {
        return members.stream()
                .anyMatch(m -> m.getUser().getId().equals(user.getId()) && m.getLeftAt() == null);
    }
}
