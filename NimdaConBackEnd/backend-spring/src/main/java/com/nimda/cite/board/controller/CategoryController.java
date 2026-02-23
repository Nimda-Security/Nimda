package com.nimda.cite.board.controller;

import com.nimda.cite.board.dto.CategoryCreateDTO;
import com.nimda.cite.board.dto.CategoryResponseDTO;
import com.nimda.cite.board.dto.CategoryUpdateDTO;
import com.nimda.cite.board.entity.Category;
import com.nimda.cite.board.service.CategoryService;
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
     * - 관리자만 카테고리 생성 가능
     * - JWT 토큰에서 사용자 정보 추출 후 권한 확인
     */
    @PostMapping
    public ResponseEntity<CategoryResponseDTO> createCategory(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @Valid @RequestBody CategoryCreateDTO createDTO) {
        try {
            // 사용자 정보 추출
            User user = getUserFromToken(authHeader);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            // 카테고리 생성 (관리자 권한 확인 포함)
            Category category = categoryService.createCategory(createDTO, user);
            CategoryResponseDTO categoryDTO = CategoryResponseDTO.from(category);
            return ResponseEntity.status(HttpStatus.CREATED).body(categoryDTO);

        } catch (RuntimeException e) {
            // 관리자 권한이 없거나 기타 비즈니스 로직 오류
            if (e.getMessage().contains("권한") || e.getMessage().contains("로그인")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * API3. updateCategoryAPI
     * feat. 카테고리 수정 API
     * - 관리자만 카테고리 수정 가능
     * - JWT 토큰에서 사용자 정보 추출 후 권한 확인
     */
    @PutMapping("/{id}")
    public ResponseEntity<CategoryResponseDTO> updateCategory(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long id,
            @Valid @RequestBody CategoryUpdateDTO updateDTO) {
        try {
            // 사용자 정보 추출
            User user = getUserFromToken(authHeader);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            // 카테고리 수정 (관리자 권한 확인 포함)
            Category category = categoryService.updateCategory(id, updateDTO, user);
            CategoryResponseDTO categoryDTO = CategoryResponseDTO.from(category);
            return ResponseEntity.ok(categoryDTO);

        } catch (RuntimeException e) {
            // 관리자 권한이 없거나 기타 비즈니스 로직 오류
            if (e.getMessage().contains("권한") || e.getMessage().contains("로그인")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
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
    public ResponseEntity<Void> deleteCategory(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long id) {
        try {
            // 사용자 정보 추출
            User user = getUserFromToken(authHeader);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            // 카테고리 삭제 (소프트 삭제, 관리자 권한 확인 포함)
            categoryService.deleteCategory(id, user);

            return ResponseEntity.ok().build();

        } catch (RuntimeException e) {
            // 관리자 권한이 없거나 기타 비즈니스 로직 오류
            if (e.getMessage().contains("권한") || e.getMessage().contains("로그인")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
