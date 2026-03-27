package com.nimda.cite.comment.controller;

import com.nimda.cite.comment.dto.*;
import com.nimda.cite.comment.service.CommentService;
import com.nimda.cite.common.response.ApiResponse;
import com.nimda.cite.common.s3.S3Service;
import com.nimda.cup.common.util.JwtUtil;
import com.nimda.cup.user.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class CommentController {

    @Autowired
    private CommentService commentService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired(required = false)
    private S3Service s3Service;

    @Autowired
    private UserRepository userRepository;

    private void resolveCommentProfileImages(List<CommentResponse> comments) {
        if (s3Service == null || comments == null) return;
        for (CommentResponse c : comments) {
            String img = c.getAuthorProfileImage();
            if (img != null && !img.isBlank() && !img.startsWith("http")) {
                c.setAuthorProfileImage(s3Service.createPresignedGetUrl(img, 60));
            }
            resolveCommentProfileImages(c.getChildren());
        }
    }

    private void resolveCommentProfileImage(CommentResponse c) {
        if (s3Service == null || c == null) return;
        String img = c.getAuthorProfileImage();
        if (img != null && !img.isBlank() && !img.startsWith("http")) {
            c.setAuthorProfileImage(s3Service.createPresignedGetUrl(img, 60));
        }
        resolveCommentProfileImages(c.getChildren());
    }

    /**
     * 특정 게시글 댓글 생성
     * POST /api/board/{boardId}/comments
     */
    @PostMapping("/board/{boardId}/comments")
    public ResponseEntity<?> createComment(
            @PathVariable Long boardId,
            @Valid @RequestBody CommentCreateRequest request,
            @RequestHeader("Authorization") String authHeader
    ) {
        try {
            Long userId = jwtUtil.extractUserId(resolveToken(authHeader));
            CommentResponse response = commentService.createComment(boardId, request, userId);
            resolveCommentProfileImage(response);
            return ApiResponse.ok("댓글이 성공적으로 작성되었습니다.",
                    Map.of("comment", response)).toResponse(HttpStatus.CREATED);

        } catch(Exception e) {
            return ApiResponse.fail("댓글 작성 중 오류가 발생했습니다: " + e.getMessage())
                    .toResponse(HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }


    /**
     * 특정 게시글 댓글 조회
     * GET /api/board/{boardId}/comments
     */
    @GetMapping("/board/{boardId}/comments")
    public ResponseEntity<?> getComments(
            @PathVariable Long boardId,
            @RequestHeader("Authorization") String authHeader
    ) {
        try {
            String token = resolveToken(authHeader);
            List<String> authorities = jwtUtil.extractAuthorities(token);
            Long userId = jwtUtil.extractUserId(token);

            boolean isAdmin = authorities.contains("ROLE_ADMIN");
            // 댓글 조회
            List<CommentResponse> comments = commentService.getComments(boardId, userId, isAdmin);
            resolveCommentProfileImages(comments);
            return ApiResponse.ok("댓글을 성공적으로 조회했습니다.",
                    Map.of("comments", comments)).toResponse();

        } catch (Exception e) {
            return ApiResponse.fail("댓글 조회 중 오류가 발생했습니다: " + e.getMessage())
                    .toResponse(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * 마이페이지 작성 댓글 조회
     * GET /api/my-page/comments
     */
    @GetMapping("/my-page/comments")
    public ResponseEntity<?> getMyComments(
            @RequestHeader("Authorization") String authHeader
    ) {
        try {
            Long userId = jwtUtil.extractUserId(resolveToken(authHeader));
            return ApiResponse.ok("댓글을 성공적으로 조회했습니다.",
                    Map.of("comments", commentService.getMyComments(userId))).toResponse();

        } catch (Exception e) {
            return ApiResponse.fail("마이 페이지 작성 댓글 조회 중 오류가 발생했습니다: " + e.getMessage())
                    .toResponse(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    /**
     * 댓글 수정
     * PATCH /api/comments/{commentId}
     */
    @PatchMapping("/comments/{commentId}")
    public ResponseEntity<?> updateComment(
            @PathVariable Long commentId,
            @Valid @RequestBody CommentUpdateRequest request,
            @RequestHeader("Authorization") String authHeader
    ) {
        try {
            Long userId = jwtUtil.extractUserId(resolveToken(authHeader));
            CommentResponse response = commentService.updateComment(commentId, request, userId);
            resolveCommentProfileImage(response);
            return ApiResponse.ok("댓글을 성공적으로 수정했습니다.",
                    Map.of("comment", response)).toResponse();

        } catch (Exception e) {
            return ApiResponse.fail("댓글 수정 중 오류가 발생했습니다: " + e.getMessage())
                    .toResponse(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * 댓글 숨김
     * PATCH /api/comments/{commentId}/status
     */
    @PatchMapping("/comments/{commentId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> hideComment(
            @PathVariable Long commentId,
            @Valid @RequestBody CommentStatusUpdateRequest request,
            @RequestHeader("Authorization") String authHeader
    ) {
        try {
            CommentResponse response = commentService.updateCommentStatus(commentId, request);
            resolveCommentProfileImage(response);
            return ApiResponse.ok("댓글을 성공적으로 숨겼습니다.",
                    Map.of("comment", response)).toResponse();

        } catch (Exception e) {
            return ApiResponse.fail("댓글 숨김 중 오류가 발생했습니다: " + e.getMessage())
                    .toResponse(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }



    /**
     * 댓글 삭제 (소프트 삭제)
     * DELETE /api/comments/{commentId}
     */
    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<?> deleteComment(
            @PathVariable Long commentId,
            @RequestHeader("Authorization") String authHeader
    ) {
        try {
            Long userId = jwtUtil.extractUserId(resolveToken(authHeader));
            commentService.deleteComment(commentId, userId);
            return ApiResponse.ok("댓글이 성공적으로 삭제되었습니다.").toResponse();

        } catch (Exception e) {
            return ApiResponse.fail("댓글 삭제 중 오류가 발생했습니다: " + e.getMessage())
                    .toResponse(HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }

    /**
     * 내가 작성한 댓글 개수 조회
     * GET /api/comments/my/count
     */
    @GetMapping("/comments/my/count")
    public ResponseEntity<?> getMyCommentCount(
            @RequestHeader("Authorization") String authHeader
    ) {
        try {
            // 토큰에서 유저 ID 추출
            Long userId = jwtUtil.extractUserId(resolveToken(authHeader));

            // Service에서 해당 유저의 댓글 개수 조회
            // commentService에 countByUserId(userId) 메서드가 구현되어 있어야 합니다.
            long commentCount =     commentService.countByUserId(userId);

            return ApiResponse.ok("댓글 개수를 성공적으로 조회했습니다.",
                    Map.of("commentCount", commentCount)).toResponse();

        } catch (Exception e) {
            return ApiResponse.fail("댓글 개수 조회 중 오류가 발생했습니다: " + e.getMessage())
                    .toResponse(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * 마이페이지 선택 댓글 삭제
     * DELETE /api/my-page/comments
     */
    @DeleteMapping("/my-page/comments")
    public ResponseEntity<?> deleteMyComments(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody MyCommentsDeleteRequest request
    ) {
        try {
            Long userId = jwtUtil.extractUserId(resolveToken(authHeader));
            commentService.deleteMyComments(request.getCommentIds(), userId);
            return ApiResponse.ok("선택한 댓글이 성공적으로 삭제되었습니다.").toResponse();

        } catch (Exception e) {
            return ApiResponse.fail("댓글 삭제 중 오류가 발생했습니다: " + e.getMessage())
                    .toResponse(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * 특정 유저의 작성 댓글 목록 조회 (공개 프로필용, 인증 불필요)
     * GET /api/comments/user/{nickname}
     */
    @GetMapping("/comments/user/{nickname}")
    public ResponseEntity<?> getCommentsByNickname(@PathVariable String nickname) {
        try {
            return userRepository.findByNickname(nickname)
                    .map(user -> {
                        List<MyCommentResponse> comments = commentService.getMyComments(user.getId());
                        return ApiResponse.ok("댓글 목록을 조회했습니다.",
                                Map.of("comments", comments)).toResponse();
                    })
                    .orElseThrow(
                            () -> new ResponseStatusException(HttpStatus.NOT_FOUND)
                    );
        } catch (Exception e) {
            return ApiResponse.fail("댓글 조회 중 오류가 발생했습니다: " + e.getMessage())
                    .toResponse(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Bearer 토큰 추출 공통 로직
    private String resolveToken(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        throw new IllegalArgumentException("유효하지 않은 인증 헤더입니다.");
    }

}
