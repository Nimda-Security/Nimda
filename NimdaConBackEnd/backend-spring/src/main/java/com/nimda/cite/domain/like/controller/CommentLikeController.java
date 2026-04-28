package com.nimda.cite.like.controller;

import com.nimda.cite.common.response.ApiResponse;
import com.nimda.cite.like.dto.CommentLikeResponse;
import com.nimda.cite.like.service.CommentLikeService;
import com.nimda.cite.user.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/like/comment")
@RequiredArgsConstructor
public class CommentLikeController {

    private final CommentLikeService commentLikeService;

    @PostMapping("/{commentId}")
    public ResponseEntity<?> toggleLike(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long commentId) {

        Long userId = userDetails.getUser().getId();
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