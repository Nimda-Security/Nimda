package com.nimda.cite.board.controller;

import com.nimda.cite.board.entity.Board;
import com.nimda.cite.board.entity.Category;
import com.nimda.cite.board.repository.CategoryRepository;
import com.nimda.cite.board.service.BoardService;
import com.nimda.cite.common.response.ApiResponse;
import com.nimda.cup.common.util.JwtUtil;
import com.nimda.cup.user.entity.User;
import com.nimda.cup.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cite/board")
public class BoardController {

    @Autowired
    private BoardService boardService;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<?> getPostsByCategory(
            @RequestParam(value = "categoryId", required = false) Long categoryId,
            @RequestParam(value = "slug", required = false) String slug,
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            @RequestParam(value = "includeChildren", required = false, defaultValue = "false") Boolean includeChildren,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        try {
            Category category = null;
            if (categoryId != null) {
                category = categoryRepository.findById(categoryId)
                        .orElseThrow(() -> new RuntimeException("카테고리를 찾을 수 없습니다: " + categoryId));
            } else if (slug != null) {
                category = categoryRepository.findBySlugAndIsActiveTrue(slug)
                        .orElseThrow(() -> new RuntimeException("카테고리를 찾을 수 없습니다: " + slug));
            } else {
                return ApiResponse.fail("categoryId 또는 slug 파라미터가 필요합니다.").toResponse(HttpStatus.BAD_REQUEST);
            }

            Page<Board> boards;

            // includeChildren=true 이면 하위 카테고리 게시글도 함께 조회
            if (Boolean.TRUE.equals(includeChildren)) {
                List<Category> categories = new ArrayList<>();
                categories.add(category);
                // 직계 자식 카테고리 추가
                List<Category> children = categoryRepository
                        .findByParentIdAndIsActiveTrueOrderBySortOrderAsc(category.getId());
                categories.addAll(children);
                // 손자 카테고리도 추가 (3단 지원)
                for (Category child : children) {
                    List<Category> grandChildren = categoryRepository
                            .findByParentIdAndIsActiveTrueOrderBySortOrderAsc(child.getId());
                    categories.addAll(grandChildren);
                }

                if (searchKeyword == null || searchKeyword.isEmpty()) {
                    boards = boardService.boardListByCategories(categories, pageable);
                } else {
                    boards = boardService.boardSearchListByCategories(categories, searchKeyword, pageable);
                }
            } else {
                if (searchKeyword == null || searchKeyword.isEmpty()) {
                    boards = boardService.boardListByCategory(category, pageable);
                } else {
                    boards = boardService.boardSearchListByCategory(category, searchKeyword, pageable);
                }
            }

            Map<String, Object> data = Map.of(
                    "posts", boards.getContent(),
                    "totalElements", boards.getTotalElements(),
                    "totalPages", boards.getTotalPages(),
                    "currentPage", boards.getNumber(),
                    "category", category);
            return ApiResponse.ok("게시글 목록을 성공적으로 조회했습니다.", data).toResponse();

        } catch (Exception e) {
            return ApiResponse.fail("게시글 목록 조회 중 오류가 발생했습니다: " + e.getMessage())
                    .toResponse(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/pinned")
    public ResponseEntity<?> getPinnedPosts(
            @RequestParam(value = "categoryId", required = false) Long categoryId,
            @RequestParam(value = "slug", required = false) String slug,
            @PageableDefault(size = 4, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        try {
            Category category = null;
            if (categoryId != null) {
                category = categoryRepository.findById(categoryId)
                        .orElseThrow(() -> new RuntimeException("카테고리를 찾을 수 없습니다: " + categoryId));
            } else if (slug != null) {
                category = categoryRepository.findBySlugAndIsActiveTrue(slug)
                        .orElseThrow(() -> new RuntimeException("카테고리를 찾을 수 없습니다: " + slug));
            } else {
                return ApiResponse.fail("categoryId 또는 slug 파라미터가 필요합니다.").toResponse(HttpStatus.BAD_REQUEST);
            }

            Page<Board> boards = boardService.boardListByCategoryWithPinned(category, pageable);
            Map<String, Object> data = Map.of(
                    "posts", boards.getContent(),
                    "totalElements", boards.getTotalElements());
            return ApiResponse.ok("고정글 목록을 성공적으로 조회했습니다.", data).toResponse();

        } catch (Exception e) {
            return ApiResponse.fail("고정글 목록 조회 중 오류가 발생했습니다: " + e.getMessage())
                    .toResponse(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/popular")
    public ResponseEntity<?> getPopularPosts(
            @RequestParam(value = "categoryId", required = false) Long categoryId,
            @RequestParam(value = "slug", required = false) String slug,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        try {
            Page<Board> boards;
            if (categoryId != null || slug != null) {
                Category category = null;
                if (categoryId != null) {
                    category = categoryRepository.findById(categoryId)
                            .orElseThrow(() -> new RuntimeException("카테고리를 찾을 수 없습니다: " + categoryId));
                } else {
                    category = categoryRepository.findBySlugAndIsActiveTrue(slug)
                            .orElseThrow(() -> new RuntimeException("카테고리를 찾을 수 없습니다: " + slug));
                }
                boards = boardService.boardListPopularByCategory(category, pageable);
            } else {
                boards = boardService.boardListPopular(pageable);
            }

            Map<String, Object> data = Map.of(
                    "posts", boards.getContent(),
                    "totalElements", boards.getTotalElements(),
                    "totalPages", boards.getTotalPages(),
                    "currentPage", boards.getNumber());
            return ApiResponse.ok("인기글 목록을 성공적으로 조회했습니다.", data).toResponse();

        } catch (Exception e) {
            return ApiResponse.fail("인기글 목록 조회 중 오류가 발생했습니다: " + e.getMessage())
                    .toResponse(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping
    public ResponseEntity<?> write(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestParam("categoryId") Long categoryId,
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        try {
            User author = null;
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                if (jwtUtil.isTokenExpired(token)) {
                    return ApiResponse.fail("토큰이 만료되었습니다. 다시 로그인해주세요.").toResponse(HttpStatus.UNAUTHORIZED);
                }

                Long userId = jwtUtil.extractUserId(token);
                if (userId != null) {
                    author = userRepository.findById(userId)
                            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다: " + userId));
                }
            }

            if (author == null) {
                return ApiResponse.fail("로그인이 필요합니다.").toResponse(HttpStatus.UNAUTHORIZED);
            }

            Category category = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new RuntimeException("카테고리를 찾을 수 없습니다: " + categoryId));

            Board board = new Board();
            board.setTitle(title);
            board.setContent(content);
            board.setCategory(category);

            boardService.write(board, author, file);

            return ApiResponse.ok("게시글이 성공적으로 작성되었습니다.", Map.of("board", board))
                    .toResponse(HttpStatus.CREATED);

        } catch (Exception e) {
            return ApiResponse.fail("게시글 작성 중 오류가 발생했습니다: " + e.getMessage())
                    .toResponse(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> view(@PathVariable("id") Long id) {
        try {
            Board board = boardService.boardView(id);
            return ApiResponse.ok("게시글을 성공적으로 조회했습니다.", Map.of("board", board)).toResponse();

        } catch (RuntimeException e) {
            return ApiResponse.fail(e.getMessage()).toResponse(HttpStatus.NOT_FOUND);

        } catch (Exception e) {
            return ApiResponse.fail("게시글 조회 중 오류가 발생했습니다: " + e.getMessage())
                    .toResponse(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable("id") Long id,
            @RequestParam("categoryId") Long categoryId,
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        try {
            Board boardTemp = boardService.boardView(id);

            User currentUser = null;
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                try {
                    Long userId = jwtUtil.extractUserId(token);
                    if (userId != null && !jwtUtil.isTokenExpired(token)) {
                        currentUser = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다: " + userId));
                    }
                } catch (Exception e) {
                    // 토큰이 유효하지 않으면 에러 반환
                }
            }

            if (currentUser == null) {
                return ApiResponse.fail("로그인이 필요합니다.").toResponse(HttpStatus.UNAUTHORIZED);
            }

            boolean isAdmin = currentUser.getAuthorities().stream()
                    .anyMatch(authority -> authority.getAuthorityName().equals("ROLE_ADMIN"));

            if (!isAdmin && !boardTemp.getAuthor().getId().equals(currentUser.getId())) {
                return ApiResponse.fail("게시글을 수정할 권한이 없습니다.").toResponse(HttpStatus.FORBIDDEN);
            }

            Category category = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new RuntimeException("카테고리를 찾을 수 없습니다: " + categoryId));

            boardTemp.setTitle(title);
            boardTemp.setContent(content);
            boardTemp.setCategory(category);

            boardService.write(boardTemp, currentUser, file);

            return ApiResponse.ok("게시글이 성공적으로 수정되었습니다.", Map.of("board", boardTemp)).toResponse();

        } catch (RuntimeException e) {
            return ApiResponse.fail(e.getMessage()).toResponse(HttpStatus.NOT_FOUND);

        } catch (Exception e) {
            return ApiResponse.fail("게시글 수정 중 오류가 발생했습니다: " + e.getMessage())
                    .toResponse(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable("id") Long id) {
        try {
            Board board = boardService.boardView(id);

            User currentUser = null;
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                try {
                    Long userId = jwtUtil.extractUserId(token);
                    if (userId != null && !jwtUtil.isTokenExpired(token)) {
                        currentUser = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다: " + userId));
                    }
                } catch (Exception e) {
                    // 토큰이 유효하지 않으면 에러 반환
                }
            }

            if (currentUser == null) {
                return ApiResponse.fail("로그인이 필요합니다.").toResponse(HttpStatus.UNAUTHORIZED);
            }

            boolean isAdmin = currentUser.getAuthorities().stream()
                    .anyMatch(authority -> authority.getAuthorityName().equals("ROLE_ADMIN"));

            if (!isAdmin && !board.getAuthor().getId().equals(currentUser.getId())) {
                return ApiResponse.fail("게시글을 삭제할 권한이 없습니다.").toResponse(HttpStatus.FORBIDDEN);
            }

            boardService.boardDelete(id);

            return ApiResponse.ok("게시글이 성공적으로 삭제되었습니다.").toResponse();

        } catch (RuntimeException e) {
            return ApiResponse.fail(e.getMessage()).toResponse(HttpStatus.NOT_FOUND);

        } catch (Exception e) {
            return ApiResponse.fail("게시글 삭제 중 오류가 발생했습니다: " + e.getMessage())
                    .toResponse(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
