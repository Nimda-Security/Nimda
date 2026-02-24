package com.nimda.cite.comment.controller;

import com.nimda.cite.comment.dto.CommentCreateRequest;
import com.nimda.cite.comment.dto.CommentResponse;
import com.nimda.cite.comment.dto.CommentUpdateRequest;
import com.nimda.cite.comment.service.CommentService;
import com.nimda.cup.user.security.CustomUserDetails;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/cite")
public class CommentController {

    @Autowired
    private CommentService commentService;

    /**
     * 댓글 생성
     * POST /api/cite/board/{boardId}/comments
     */
    @PostMapping
    public ResponseEntity<CommentResponse> createComment(
            @PathVariable Long boardId,
            @Valid @RequestBody CommentCreateRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long userId = userDetails.getUser().getId();
        CommentResponse response = commentService.createComment(boardId, request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }


    /**
     * 특정 게시글의 댓글 조회
     * GET /api/cite/board/{boardId}/comments
     */
    @GetMapping("/board/{boardId}/comments")
    public ResponseEntity<List<CommentResponse>> getComments(
            @PathVariable Long boardId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        String role = userDetails.getAuthorities().stream()
                .findFirst()
                .map(GrantedAuthority::getAuthority)
                .orElse("ROLE_USER");

        return ResponseEntity.ok(commentService.getComments(boardId, role));
    }

    /**
     * 특정 댓글의 대댓글 조회
     * GET /api/cite/board/{boardId}/comments/{parendId}/children
     */
    @GetMapping("/board/{boardId}/comments/{parentId}/children")
    public ResponseEntity<List<CommentResponse>> getReplies(
            @PathVariable Long boardId,
            @PathVariable Long parentId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        String role = userDetails.getAuthorities().stream()
                .findFirst()
                .map(GrantedAuthority::getAuthority)
                .orElse("ROLE_USER");

        return ResponseEntity.ok(commentService.getReplies(boardId, parentId, role));
    }

    /**
     * 댓글 수정
     * PATCH /api/cite/board/{boardId}/comments/{commentId}
     */
    @PatchMapping("/{commentId}")
    public ResponseEntity<CommentResponse> updateComment(
            @PathVariable Long boardId,
            @PathVariable Long commentId,
            @Valid @RequestBody CommentUpdateRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long userId = userDetails.getUser().getId();
        String role = userDetails.getAuthorities().stream()
                .findFirst()
                .map(GrantedAuthority::getAuthority)
                .orElse("ROLE_USER");

        CommentResponse response = commentService.updateComment(boardId, commentId, request, userId, role);
        return ResponseEntity.ok(response);
    }

    /**
     * 댓글 삭제 (소프트 삭제)
     * DELETE /api/cite/board/{boardId}/comments/{commentId}
     */
    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long boardId,
            @PathVariable Long commentId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long userId = userDetails.getUser().getId();
        String role = userDetails.getAuthorities().stream()
                .findFirst()
                .map(GrantedAuthority::getAuthority)
                .orElse("ROLE_USER");

        commentService.deleteComment(boardId, commentId, userId, role);
        return ResponseEntity.noContent().build();
    }

}
