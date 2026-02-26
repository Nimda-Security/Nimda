package com.nimda.cite.board.controller;

import com.nimda.cite.board.dto.CategoryCreateDTO;
import com.nimda.cite.board.dto.CategoryResponseDTO;
import com.nimda.cite.board.dto.CategoryUpdateDTO;
import com.nimda.cite.board.entity.Category;
import com.nimda.cite.board.service.CategoryService;
import com.nimda.cite.common.response.ApiResponse;
import com.nimda.cup.common.util.JwtUtil;
import com.nimda.cup.user.entity.User;
import com.nimda.cup.user.repository.UserRepository;

import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cite/category")
public class CategoryController {

    private static final Logger logger = LoggerFactory.getLogger(CategoryController.class);

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    /**
     * JWT 토큰에서 사용자 정보 추출
     * 
     * @param authHeader Authorization 헤더 값
     * @return User 객체 (토큰이 유효하지 않으면 null)
     */
    // authHeader - Authorization Header
    private User getUserFromToken(String authHeader) {

        // [Exception] Authorization Header가 Null이거나 Bearer로 시작하지 않는경우 파싱 종료
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return null;
        }

        try {

            String token = authHeader.substring(7); // Delete "Bearer"
            String nickname = jwtUtil.extractNickname(token); // JWT Token Nickname Extract
            if (nickname != null && !jwtUtil.isTokenExpired(token)) {
                return userRepository.findByNickname(nickname).orElse(null);
            }

        } catch (Exception e) {
            // 토큰이 유효하지 않으면 null 반환
            // 로깅: 디버깅 및 보안 모니터링을 위해 예외 로그 기록
            logger.debug("JWT 토큰 파싱 실패: {}", e.getMessage());
        }

        return null;
    }

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
            return ApiResponse.fail(e.getMessage() != null ? e.getMessage() : "카테고리 조회 중 오류가 발생했습니다.")
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
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        try {
            User user = getUserFromToken(authHeader);
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
            return ApiResponse.fail(e.getMessage()).toResponse(HttpStatus.BAD_REQUEST);

        } catch (Exception e) {
            return ApiResponse.fail(e.getMessage() != null ? e.getMessage() : "서버 오류가 발생했습니다.")
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
            return ApiResponse.fail(e.getMessage() != null ? e.getMessage() : "카테고리를 찾을 수 없습니다.")
                    .toResponse(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return ApiResponse.fail(e.getMessage() != null ? e.getMessage() : "서버 오류가 발생했습니다.")
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
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @Valid @RequestBody CategoryCreateDTO createDTO) {
        try {
            User user = getUserFromToken(authHeader);
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
            return ApiResponse.fail(e.getMessage()).toResponse(HttpStatus.BAD_REQUEST);

        } catch (Exception e) {
            return ApiResponse.fail(e.getMessage() != null ? e.getMessage() : "서버 오류가 발생했습니다.")
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
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long id,
            @Valid @RequestBody CategoryUpdateDTO updateDTO) {
        try {
            User user = getUserFromToken(authHeader);
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
            return ApiResponse.fail(e.getMessage()).toResponse(HttpStatus.BAD_REQUEST);

        } catch (Exception e) {
            return ApiResponse.fail(e.getMessage() != null ? e.getMessage() : "서버 오류가 발생했습니다.")
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
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long id) {
        try {
            User user = getUserFromToken(authHeader);
            if (user == null) {
                return ApiResponse.fail("로그인이 필요합니다.").toResponse(HttpStatus.UNAUTHORIZED);
            }

            categoryService.deleteCategory(id, user);
            return ApiResponse.ok("카테고리가 삭제되었습니다.").toResponse();

        } catch (RuntimeException e) {
            if (e.getMessage() != null && (e.getMessage().contains("권한") || e.getMessage().contains("로그인"))) {
                return ApiResponse.fail(e.getMessage()).toResponse(HttpStatus.FORBIDDEN);
            }
            return ApiResponse.fail(e.getMessage()).toResponse(HttpStatus.BAD_REQUEST);

        } catch (Exception e) {
            return ApiResponse.fail(e.getMessage() != null ? e.getMessage() : "서버 오류가 발생했습니다.")
                    .toResponse(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
