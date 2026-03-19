package com.nimda.cite.like.controller;

import com.nimda.cite.common.response.ApiResponse;
import com.nimda.cite.like.dto.CommentLikeResponse;
import com.nimda.cite.like.service.CommentLikeService;
import com.nimda.cup.common.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/like/comment")
@RequiredArgsConstructor
public class CommentLikeController {

    private final CommentLikeService commentLikeService;
    private final JwtUtil jwtUtil;

    @PostMapping("/{commentId}")
    public ResponseEntity<?> toggleLike(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long commentId) {

        Long userId = jwtUtil.extractUserId(authHeader.substring(7));
        String message = commentLikeService.toggleCommentLike(userId, commentId);
        long likeCount = commentLikeService.getLikeCount(commentId);
        boolean isLiked = !message.contains("취소");

        return ApiResponse.ok(CommentLikeResponse.of(message, likeCount, isLiked)).toResponse();
    }

    @GetMapping("/{commentId}/likeCount")
    public ResponseEntity<?> getLikeCount(@PathVariable Long commentId) {
        Long likeCount = commentLikeService.getLikeCount(commentId);
        CommentLikeResponse dto = CommentLikeResponse.builder().likeCount(likeCount).build();
        return ApiResponse.ok(dto).toResponse();
    }


}