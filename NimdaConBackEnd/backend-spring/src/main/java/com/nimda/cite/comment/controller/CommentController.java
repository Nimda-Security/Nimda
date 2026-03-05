package com.nimda.cite.comment.controller;

import com.nimda.cite.comment.dto.*;
import com.nimda.cite.comment.service.CommentService;
import com.nimda.cite.common.response.ApiResponse;
import com.nimda.cup.common.util.JwtUtil;
import com.nimda.cup.user.security.CustomUserDetails;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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
        Long userId = jwtUtil.extractUserId(resolveToken(authHeader));
        CommentUserResponse response = commentService.createComment(boardId, request, userId);
        return ApiResponse.ok(Map.of("comment", response)).toResponse(HttpStatus.CREATED);
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
        String token = resolveToken(authHeader);
        List<String> authorities = jwtUtil.extractAuthorities(token);

        if (authorities.contains("ROLE_ADMIN")) {
            return ApiResponse.ok(Map.of("comments", commentService.getCommentsForAdmin(boardId))).toResponse();
        }

        Long userId = jwtUtil.extractUserId(token);
        return ApiResponse.ok(Map.of("comments", commentService.getCommentsForUser(boardId, userId))).toResponse();
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
        Long userId = jwtUtil.extractUserId(resolveToken(authHeader));
        CommentUserResponse response = commentService.updateComment(commentId, request, userId);
        return ApiResponse.ok(Map.of("comment", response)).toResponse();
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
        CommentAdminResponse response = commentService.updateCommentStatus(commentId, request);
        return ApiResponse.ok(Map.of("comment", response)).toResponse();
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
        Long userId = jwtUtil.extractUserId(resolveToken(authHeader));
        commentService.deleteComment(commentId, userId);
        return ApiResponse.ok(Map.of("message", "댓글이 성공적으로 삭제되었습니다.")).toResponse();
    }


    // =============== PRIVATE ===============

    // Bearer 토큰 추출 공통 로직
    private String resolveToken(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        throw new IllegalArgumentException("유효하지 않은 인증 헤더입니다.");
    }

}
