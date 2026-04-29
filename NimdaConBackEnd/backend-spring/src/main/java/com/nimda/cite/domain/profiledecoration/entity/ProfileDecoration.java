package com.nimda.cite.domain.profiledecoration.entity;

import com.nimda.cite.common.entity.BaseTimeEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
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

    @Column(nullable = false)
    private boolean active = true;

    public ProfileDecoration(String key, String label, String filePath) {
        this.key = key;
        this.label = label;
        this.filePath = filePath;
    }

    public void update(String label, String filePath, boolean active) {
        this.label = label;
        this.filePath = filePath;
        this.active = active;
    }
}
