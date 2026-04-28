package com.nimda.cite.tag.dto;

import com.nimda.cite.tag.entity.Tag;
import lombok.*;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Setter
@Builder
public class TagResponse {
    private Long id;
    private String tagName;
    private Integer sortValue;
    private String categoryName;
    private Long categoryId;

    public static TagResponse from(Tag tag) {
        return TagResponse.builder()
                .id(tag.getId())
                .tagName(tag.getTagName())
                .sortValue(tag.getSortValue())
                .categoryName(tag.getCategory().getName())
                .categoryId(tag.getCategory().getId())
                .build();
    }

}
