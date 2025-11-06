package com.nimda.cup.common.entity;

import jakarta.persistence.*;
import lombok.Getter;

import java.time.LocalDateTime;

@Embeddable
@Getter
public class BaseTimeEntity {
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // 기본 생성자 (JPA 필수)
    protected BaseTimeEntity() {}
    
    // 생성용 생성자
    public BaseTimeEntity(LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    
    // 현재 시간으로 초기화하는 팩토리 메서드
    public static BaseTimeEntity now() {
        LocalDateTime now = LocalDateTime.now();
        return new BaseTimeEntity(now, now);
    }
    
    // 수정 시간만 갱신한 새 객체 반환
    public BaseTimeEntity updateTime() {
        return new BaseTimeEntity(this.createdAt, LocalDateTime.now());
    }
    
    @PrePersist
    public void prePersist() {
        if (this.createdAt == null || this.updatedAt == null) {
            LocalDateTime now = LocalDateTime.now();
            this.createdAt = now;
            this.updatedAt = now;
        }
    }
    
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
