package com.nimda.cite.like.controller;

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
    public ResponseEntity<CommentLikeResponse> toggleLike(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long commentId) {

        Long userId = jwtUtil.extractUserId(authHeader.substring(7));
        // 좋아요 토글 실행
        String message = commentLikeService.toggleCommentLike(userId, commentId);

        // 최신 상태 정보 조회
        long likeCount = commentLikeService.getLikeCount(commentId);
        boolean isLiked = !message.contains("취소");

        return ResponseEntity.ok(CommentLikeResponse.of(message, likeCount, isLiked));
    }

    // 댓글 좋아요 수 조회
    @GetMapping("/{commentId}/likeCount")
    public ResponseEntity<CommentLikeResponse> getLikeCount(@PathVariable Long commentId) {
        Long likeCount = commentLikeService.getLikeCount(commentId);
        CommentLikeResponse dto = CommentLikeResponse.builder().likeCount(likeCount).build();
        return ResponseEntity.ok(dto);
    }


}