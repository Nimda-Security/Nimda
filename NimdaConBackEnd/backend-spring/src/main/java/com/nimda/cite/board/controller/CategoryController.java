package com.nimda.cite.board.controller;

import com.nimda.cite.board.dto.CategoryCreateDTO;
import com.nimda.cite.board.dto.CategoryResponseDTO;
import com.nimda.cite.board.dto.CategoryUpdateDTO;
import com.nimda.cite.board.entity.Category;
import com.nimda.cite.board.service.CategoryService;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cite/category")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    // API1. getAllCategories
    // feat. 모든 카테고리 조회 API
    @GetMapping
    public ResponseEntity<List<CategoryResponseDTO>> getAllCategories() {
        try {
            List<Category> categories = categoryService.getAllActiveCategories();

            // Entity를 DTO로 변환
            List<CategoryResponseDTO> categoryDTOList = categories.stream()
                    .map(CategoryResponseDTO::from)
                    .toList();

            return ResponseEntity.ok(categoryDTOList);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<CategoryResponseDTO> getCategoryBySlug(@PathVariable String slug) {
        try {
            Category category = categoryService.getCategoryBySlug(slug);

            CategoryResponseDTO categoryDTO = CategoryResponseDTO.from(category);
            return ResponseEntity.ok(categoryDTO);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * API2. createCategoryAPI
     * feat. 카테고리 생성 API
     * - TODO: 관리자만 카테고리 생성 가능 (1-3 단계에서 권한 체크 추가 예정)
     */
    @PostMapping
    public ResponseEntity<CategoryResponseDTO> createCategory(
            @Valid @RequestBody CategoryCreateDTO createDTO) {
        try {

            // TODO: 1-3 단계에서 관리자 권한 체크 추가 예정
            // User user = getUserFromToken(authHeader);
            // if (user == null) { ... }
            // 관리자 권한 확인

            Category category = categoryService.createCategory(createDTO);
            CategoryResponseDTO categoryDTO = CategoryResponseDTO.from(category);
            return ResponseEntity.status(HttpStatus.CREATED).body(categoryDTO);

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * API3. updateCategoryAPI
     * feat. 카테고리 수정 API
     * - 관리자만 카테고리 수정 가능 (1-3 단계에서 권한 체크 추가 예정)
     * - JWT 토큰에서 사용자 정보 추출 후 권한 확인 예정
     */
    @PutMapping("/{id}")
    public ResponseEntity<CategoryResponseDTO> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryUpdateDTO updateDTO) {
        try {
            // TODO: 1-3 단계에서 관리자 권한 체크 추가 예정
            // User user = getUserFromToken(authHeader);
            // if (user == null) { ... }
            // 관리자 권한 확인
            Category category = categoryService.updateCategory(id, updateDTO);
            CategoryResponseDTO categoryDTO = CategoryResponseDTO.from(category);
            return ResponseEntity.ok(categoryDTO);

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * API4. deleteCategory
     * feat. 카테고리 삭제 API
     * - 관리자만 카테고리 삭제 가능 (1-3 단계에서 권한 체크 추가 예정)
     * - JWT 토큰에서 사용자 정보 추출 후 권한 확인 예정
     * - 소프트 삭제 (isActive = false)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        try {
            // TODO: 1-3 단계에서 관리자 권한 체크 추가 예정
            // User user = getUserFromToken(authHeader);
            // if (user == null) { ... }
            // 관리자 권한 확인

            // 카테고리 삭제 (소프트 삭제)
            categoryService.deleteCategory(id);

            return ResponseEntity.ok().build();

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
