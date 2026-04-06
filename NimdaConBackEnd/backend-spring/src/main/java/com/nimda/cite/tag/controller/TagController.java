package com.nimda.cite.tag.controller;


import com.nimda.cite.common.response.ApiResponse;
import com.nimda.cite.tag.dto.TagRequest;
import com.nimda.cite.tag.dto.TagResponse;
import com.nimda.cite.tag.entity.Tag;
import com.nimda.cite.tag.service.TagService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequestMapping("/api/cite/tag")
@RestController
@RequiredArgsConstructor
public class TagController {

    private final TagService tagService;

    // 태그 추가
    @PostMapping("/add-tag")
    public ResponseEntity<?> addTag(@RequestBody TagRequest req) {
        String name = req.getName();
        Integer value = req.getSortValue();
        Long categoryId = req.getCategoryId();

        Tag tag = tagService.addTag(name, value, categoryId);

        return ResponseEntity.ok(TagResponse.from(tag));
    }

    // 모든 태그 조회
    @GetMapping
    public ResponseEntity<?> getAllTags() {
        List<TagResponse> dto = tagService.getAllTags().stream().map(TagResponse::from)
                .toList();
        return ApiResponse.ok(dto).toResponse(HttpStatus.OK);
    }

    // 카테고리 id로 태그 조회
    @GetMapping("/{categoryId}")
    public ResponseEntity<?> searchTag(@PathVariable Long categoryId) {
        List<TagResponse> dto = tagService.searchTag(categoryId)
                .stream().map(TagResponse::from).toList();

        return ApiResponse.ok(dto).toResponse(HttpStatus.OK);
    }

    // 태그 삭제
    @DeleteMapping("/{tagId}")
    public ResponseEntity<?> deleteTag(@PathVariable Long tagId) {
        tagService.deleteTag(tagId);

        return ApiResponse.ok().toResponse(HttpStatus.OK);
    }

    // 태그 정보 수정
    @PatchMapping("/{tagId}")
    public ResponseEntity<?> updateTagName(@RequestBody TagRequest requestDto, @PathVariable
                                           Long tagId) {
        String newName = requestDto.getName();
        Integer sortValue = requestDto.getSortValue();
        Long categoryId = requestDto.getCategoryId();

        Tag tag = tagService.tagUpdate(tagId, newName, sortValue, categoryId);
        TagResponse dto = TagResponse.from(tag);

        return ApiResponse.ok(dto).toResponse(HttpStatus.OK);
    }
}
