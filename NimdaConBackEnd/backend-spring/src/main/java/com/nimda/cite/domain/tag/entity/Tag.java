package com.nimda.cite.domain.tag.entity;

import com.nimda.cite.domain.board.entity.Category;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "tags")
@Builder
@AllArgsConstructor
public class Tag {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(name = "tag_name")
    private String tagName;

    @Column(name = "sort_value")
    private Integer sortValue;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
