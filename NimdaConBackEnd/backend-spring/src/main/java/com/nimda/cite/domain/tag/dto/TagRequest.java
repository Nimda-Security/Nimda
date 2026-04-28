package com.nimda.cite.tag.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TagRequest {
    private String name;
    private Long categoryId;
    private Integer sortValue;
}
