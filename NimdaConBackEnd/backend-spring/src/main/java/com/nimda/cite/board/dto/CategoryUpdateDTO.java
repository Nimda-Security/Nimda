package com.nimda.cite.board.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoryUpdateDTO {
    private String name;
    private String slug;
    private Long parentId;
    private Integer sortOrder;
    private Boolean isActive;
}
