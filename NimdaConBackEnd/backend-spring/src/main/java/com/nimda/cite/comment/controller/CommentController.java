package com.nimda.cite.comment.controller;

import com.nimda.cite.comment.dto.*;
import com.nimda.cite.comment.service.CommentService;
import com.nimda.cite.common.response.ApiResponse;
import com.nimda.cup.common.util.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class CommentController {

    @Autowired
    private CommentService commentService;

    @Autowired
    private JwtUtil jwtUtil;

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
            CommentUserResponse response = commentService.createComment(boardId, request, userId);
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

            // 어드민 댓글 조회
            if (authorities.contains("ROLE_ADMIN")) {
                return ApiResponse.ok("댓글을 성공적으로 조회했습니다.",
                        Map.of("comments", commentService.getCommentsForAdmin(boardId))).toResponse();
            }

            // 유저 댓글 조회
            Long userId = jwtUtil.extractUserId(token);
            return ApiResponse.ok("댓글을 성공적으로 조회했습니다.",
                    Map.of("comments", commentService.getCommentsForUser(boardId, userId))).toResponse();

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
            CommentUserResponse response = commentService.updateComment(commentId, request, userId);
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
            CommentAdminResponse response = commentService.updateCommentStatus(commentId, request);
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

    // Bearer 토큰 추출 공통 로직
    private String resolveToken(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        throw new IllegalArgumentException("유효하지 않은 인증 헤더입니다.");
    }

}
