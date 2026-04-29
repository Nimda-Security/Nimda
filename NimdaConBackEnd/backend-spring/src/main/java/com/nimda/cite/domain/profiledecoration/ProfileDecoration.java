package com.nimda.cite.domain.profiledecoration;

import com.nimda.cite.common.entity.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "profile_decorations")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ProfileDecoration extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "decoration_key", nullable = false, unique = true, length = 100)
    private String key;

    @Column(nullable = false, length = 100)
    private String label;

    @Column(name = "file_path", nullable = false, length = 500)
    private String filePath;

    @Column(name = "required_role", length = 50)
    private String requiredRole;

    @Column(nullable = false)
    private boolean active = true;

    public ProfileDecoration(String key, String label, String filePath) {
        this.key = key;
        this.label = label;
        this.filePath = filePath;
    }

    public void update(String label, String filePath, String requiredRole, boolean active) {
        this.label = label;
        this.filePath = filePath;
        this.requiredRole = requiredRole;
        this.active = active;
    }
}
