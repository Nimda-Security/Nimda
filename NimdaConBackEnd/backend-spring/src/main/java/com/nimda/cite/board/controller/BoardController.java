package com.nimda.cite.board.controller;

import com.nimda.cite.board.entity.Board;
import com.nimda.cite.board.entity.Category;
import com.nimda.cite.board.repository.CategoryRepository;
import com.nimda.cite.board.service.BoardService;
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

import java.util.HashMap;
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
    public ResponseEntity<Map<String, Object>> getPostsByCategory(
            @RequestParam(value = "categoryId", required = false) Long categoryId,
            @RequestParam(value = "slug", required = false) String slug,
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
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
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "categoryId 또는 slug 파라미터가 필요합니다.");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }

            Page<Board> boards;
            if (searchKeyword == null || searchKeyword.isEmpty()) {
                boards = boardService.boardListByCategory(category, pageable);
            } else {
                boards = boardService.boardSearchListByCategory(category, searchKeyword, pageable);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "게시글 목록을 성공적으로 조회했습니다.");
            response.put("posts", boards.getContent());
            response.put("totalElements", boards.getTotalElements());
            response.put("totalPages", boards.getTotalPages());
            response.put("currentPage", boards.getNumber());
            response.put("category", category);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "게시글 목록 조회 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/pinned")
    public ResponseEntity<Map<String, Object>> getPinnedPosts(
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
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "categoryId 또는 slug 파라미터가 필요합니다.");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }

            Page<Board> boards = boardService.boardListByCategoryWithPinned(category, pageable);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "고정글 목록을 성공적으로 조회했습니다.");
            response.put("posts", boards.getContent());
            response.put("totalElements", boards.getTotalElements());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "고정글 목록 조회 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/popular")
    public ResponseEntity<Map<String, Object>> getPopularPosts(
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

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "인기글 목록을 성공적으로 조회했습니다.");
            response.put("posts", boards.getContent());
            response.put("totalElements", boards.getTotalElements());
            response.put("totalPages", boards.getTotalPages());
            response.put("currentPage", boards.getNumber());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "인기글 목록 조회 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> write(
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
                    Map<String, Object> errorResponse = new HashMap<>();
                    errorResponse.put("success", false);
                    errorResponse.put("message", "토큰이 만료되었습니다. 다시 로그인해주세요.");
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
                }

                Long userId = jwtUtil.extractUserId(token);
                if (userId != null) {
                    author = userRepository.findById(userId)
                            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다: " + userId));
                }
            }

            if (author == null) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "로그인이 필요합니다.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
            }

            Category category = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new RuntimeException("카테고리를 찾을 수 없습니다: " + categoryId));

            Board board = new Board();
            board.setTitle(title);
            board.setContent(content);
            board.setCategory(category);

            boardService.write(board, author, file);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "게시글이 성공적으로 작성되었습니다.");
            response.put("board", board);

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "게시글 작성 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> view(@PathVariable("id") Long id) {
        try {
            Board board = boardService.boardView(id);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "게시글을 성공적으로 조회했습니다.");
            response.put("board", board);

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "게시글 조회 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> update(
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
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "로그인이 필요합니다.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
            }

            boolean isAdmin = currentUser.getAuthorities().stream()
                    .anyMatch(authority -> authority.getAuthorityName().equals("ROLE_ADMIN"));

            if (!isAdmin && !boardTemp.getAuthor().getId().equals(currentUser.getId())) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "게시글을 수정할 권한이 없습니다.");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
            }

            Category category = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new RuntimeException("카테고리를 찾을 수 없습니다: " + categoryId));

            boardTemp.setTitle(title);
            boardTemp.setContent(content);
            boardTemp.setCategory(category);

            boardService.write(boardTemp, currentUser, file);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "게시글이 성공적으로 수정되었습니다.");
            response.put("board", boardTemp);

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "게시글 수정 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> delete(
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
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "로그인이 필요합니다.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
            }

            boolean isAdmin = currentUser.getAuthorities().stream()
                    .anyMatch(authority -> authority.getAuthorityName().equals("ROLE_ADMIN"));

            if (!isAdmin && !board.getAuthor().getId().equals(currentUser.getId())) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "게시글을 삭제할 권한이 없습니다.");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
            }

            boardService.boardDelete(id);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "게시글이 성공적으로 삭제되었습니다.");

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "게시글 삭제 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}
