package com.nimda.con.word.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "word")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
public class Word {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // AUTO INCREMENT
    private Long id;

    // TODO: Chrome Extension OAuth 미구현 고려 nullable 허용
    @Column(name = "user_id", nullable = true)
    private String userId;

    // 단어
    @NotBlank
    @Size(max = 100)
    @Column(nullable = false, length = 100)
    private String word;

    // 번역
    @NotBlank
    @Size(max = 500)
    @Column(nullable = false, length = 500)
    private String translation;

    // 발음
    @Size(max = 100)
    @Column(length = 100)
    private String pronunciation;

    // 생성일시 (JPA Auditing으로 자동 설정)
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // 수정일시 (JPA Auditing으로 자동 업데이트)
    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // 편의 생성자
    public Word(String word, String translation, String pronunciation) {
        this.word = word;
        this.translation = translation;
        this.pronunciation = pronunciation;
    }
}
