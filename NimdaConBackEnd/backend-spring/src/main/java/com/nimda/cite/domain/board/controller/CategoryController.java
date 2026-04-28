package com.nimda.cite.board.controller;

import com.nimda.cite.board.dto.CategoryCreateDTO;
import com.nimda.cite.board.dto.CategoryResponseDTO;
import com.nimda.cite.board.dto.CategorySortOrderDTO;
import com.nimda.cite.board.dto.CategoryUpdateDTO;
import com.nimda.cite.board.entity.Category;
import com.nimda.cite.board.service.CategoryService;
import com.nimda.cite.common.response.ApiResponse;
import com.nimda.cite.user.entity.User;
import com.nimda.cite.user.security.CustomUserDetails;

import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cite/category")
public class CategoryController {

    private static final Logger log = LoggerFactory.getLogger(CategoryController.class);

    @Autowired
    private CategoryService categoryService;

    // API1. getAllCategories
    // feat. 활성화된 카테고리 조회 API (일반 사용자용)
    @GetMapping
    public ResponseEntity<?> getAllCategories() {
        try {
            List<Category> categories = categoryService.getAllActiveCategories();
            List<CategoryResponseDTO> categoryDTOList = categories.stream()
                    .map(CategoryResponseDTO::from)
                    .toList();
            return ApiResponse.ok(categoryDTOList).toResponse();
        } catch (Exception e) {
            return ApiResponse.fail("카테고리 조회 중 오류가 발생했습니다.")
                    .toResponse(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * API1-1. getAllCategoriesAdmin
     * feat. 모든 카테고리 조회 API (관리자용, isActive 여부 관계없이)
     * - 관리자만 접근 가능
     * - 활성화/비활성화 모든 카테고리 반환
     */
    @GetMapping("/all")
    public ResponseEntity<?> getAllCategoriesAdmin(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        try {
            User user = userDetails != null ? userDetails.getUser() : null;
            if (user == null) {
                return ApiResponse.fail("로그인이 필요합니다.").toResponse(HttpStatus.UNAUTHORIZED);
            }

            List<Category> categories = categoryService.getAllCategories(user);
            List<CategoryResponseDTO> categoryDTOList = categories.stream()
                    .map(CategoryResponseDTO::from)
                    .toList();
            return ApiResponse.ok(categoryDTOList).toResponse();

        } catch (RuntimeException e) {
            if (e.getMessage() != null && (e.getMessage().contains("권한") || e.getMessage().contains("로그인"))) {
                return ApiResponse.fail(e.getMessage()).toResponse(HttpStatus.FORBIDDEN);
            }
            log.warn("카테고리 조회 중 오류 발생", e);
            return ApiResponse.fail("요청을 처리할 수 없습니다.").toResponse(HttpStatus.BAD_REQUEST);

        } catch (Exception e) {
            log.error("카테고리 조회 중 예기치 않은 오류 발생", e);
            return ApiResponse.fail("오류가 발생했습니다.")
                    .toResponse(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // API1-2 getCategoryBySlug
    // feat. 카테고리명(slug)로 조회 API
    @GetMapping("/slug/{slug}")
    public ResponseEntity<?> getCategoryBySlug(@PathVariable String slug) {
        try {
            Category category = categoryService.getCategoryBySlug(slug);
            CategoryResponseDTO categoryDTO = CategoryResponseDTO.from(category);
            return ApiResponse.ok(categoryDTO).toResponse();
        } catch (RuntimeException e) {
            return ApiResponse.fail("오류가 발생했습니다.")
                    .toResponse(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return ApiResponse.fail("오류가 발생했습니다.")
                    .toResponse(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * API2. createCategoryAPI
     * feat. 카테고리 생성 API
     * - 관리자만 카테고리 생성 가능
     * - JWT 토큰에서 사용자 정보 추출 후 권한 확인
     */
    @PostMapping
    public ResponseEntity<?> createCategory(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody CategoryCreateDTO createDTO) {
        try {
            User user = userDetails != null ? userDetails.getUser() : null;
            if (user == null) {
                return ApiResponse.fail("로그인이 필요합니다.").toResponse(HttpStatus.UNAUTHORIZED);
            }

            Category category = categoryService.createCategory(createDTO, user);
            CategoryResponseDTO categoryDTO = CategoryResponseDTO.from(category);
            return ApiResponse.ok(categoryDTO).toResponse(HttpStatus.CREATED);

        } catch (RuntimeException e) {
            if (e.getMessage() != null && (e.getMessage().contains("권한") || e.getMessage().contains("로그인"))) {
                return ApiResponse.fail(e.getMessage()).toResponse(HttpStatus.FORBIDDEN);
            }
            log.warn("카테고리 생성 중 오류 발생", e);
            return ApiResponse.fail("요청을 처리할 수 없습니다.").toResponse(HttpStatus.BAD_REQUEST);

        } catch (Exception e) {
            log.error("카테고리 생성 중 예기치 않은 오류 발생", e);
            return ApiResponse.fail("오류가 발생했습니다.")
                    .toResponse(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * API3. updateCategoryAPI
     * feat. 카테고리 수정 API
     * - 관리자만 카테고리 수정 가능
     * - JWT 토큰에서 사용자 정보 추출 후 권한 확인
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCategory(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody CategoryUpdateDTO updateDTO) {
        try {
            User user = userDetails != null ? userDetails.getUser() : null;
            if (user == null) {
                return ApiResponse.fail("로그인이 필요합니다.").toResponse(HttpStatus.UNAUTHORIZED);
            }

            Category category = categoryService.updateCategory(id, updateDTO, user);
            CategoryResponseDTO categoryDTO = CategoryResponseDTO.from(category);
            return ApiResponse.ok(categoryDTO).toResponse();

        } catch (RuntimeException e) {
            if (e.getMessage() != null && (e.getMessage().contains("권한") || e.getMessage().contains("로그인"))) {
                return ApiResponse.fail(e.getMessage()).toResponse(HttpStatus.FORBIDDEN);
            }
            log.warn("카테고리 수정 중 오류 발생", e);
            return ApiResponse.fail("요청을 처리할 수 없습니다.").toResponse(HttpStatus.BAD_REQUEST);

        } catch (Exception e) {
            log.error("카테고리 수정 중 예기치 않은 오류 발생", e);
            return ApiResponse.fail("오류가 발생했습니다.")
                    .toResponse(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * API4. deleteCategory
     * feat. 카테고리 삭제 API
     * - 관리자만 카테고리 삭제 가능
     * - JWT 토큰에서 사용자 정보 추출 후 권한 확인
     * - 소프트 삭제 (isActive = false)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCategory(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id) {
        try {
            User user = userDetails != null ? userDetails.getUser() : null;
            if (user == null) {
                return ApiResponse.fail("로그인이 필요합니다.").toResponse(HttpStatus.UNAUTHORIZED);
            }

            categoryService.deleteCategory(id, user);
            return ApiResponse.ok("카테고리가 삭제되었습니다.").toResponse();

        } catch (RuntimeException e) {
            if (e.getMessage() != null && (e.getMessage().contains("권한") || e.getMessage().contains("로그인"))) {
                return ApiResponse.fail(e.getMessage()).toResponse(HttpStatus.FORBIDDEN);
            }
            log.warn("카테고리 삭제 중 오류 발생", e);
            return ApiResponse.fail("요청을 처리할 수 없습니다.").toResponse(HttpStatus.BAD_REQUEST);

        } catch (Exception e) {
            log.error("카테고리 삭제 중 예기치 않은 오류 발생", e);
            return ApiResponse.fail("오류가 발생했습니다.")
                    .toResponse(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * API5. updateSortOrders
     * feat. 카테고리 순서 일괄 업데이트 API
     * - 관리자만  수 있음
     */
    @PutMapping("/sort-order")
    public ResponseEntity<?> updateSortOrders(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody List<CategorySortOrderDTO> sortOrders) {
        try {
            User user = userDetails != null ? userDetails.getUser() : null;
            if (user == null) {
                return ApiResponse.fail("로그인이 필요합니다.").toResponse(HttpStatus.UNAUTHORIZED);
            }

            categoryService.updateSortOrders(sortOrders, user);
            return ApiResponse.ok("카테고리 순서가 업데이트되었습니다.").toResponse();

        } catch (RuntimeException e) {
            if (e.getMessage() != null && (e.getMessage().contains("권한") || e.getMessage().contains("로그인"))) {
                return ApiResponse.fail(e.getMessage()).toResponse(HttpStatus.FORBIDDEN);
            }
            log.warn("카테고리 순서 업데이트 중 오류 발생", e);
            return ApiResponse.fail("요청을 처리할 수 없습니다.").toResponse(HttpStatus.BAD_REQUEST);

        } catch (Exception e) {
            log.error("카테고리 순서 업데이트 중 예기치 않은 오류 발생", e);
            return ApiResponse.fail("오류가 발생했습니다.")
                    .toResponse(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}

