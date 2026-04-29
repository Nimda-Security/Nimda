package com.nimda.cite.domain.profiledecoration.entity;

import com.nimda.cite.common.entity.BaseTimeEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(
        name = "profile_decoration_roles",
        uniqueConstraints = @UniqueConstraint(columnNames = {"decoration_id", "authority_name"})
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ProfileDecorationRole extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "decoration_id", nullable = false)
    private ProfileDecoration decoration;

    @Column(name = "authority_name", nullable = false, length = 50)
    private String authorityName;

    public ProfileDecorationRole(ProfileDecoration decoration, String authorityName) {
        this.decoration = decoration;
        this.authorityName = authorityName;
    }
}
