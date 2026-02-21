package com.nimda.cite.like.controller;

import com.nimda.cite.like.dto.CommentLikeResponseDto;
import com.nimda.cite.like.service.CommentLikeService;
import com.nimda.cup.common.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cite/like/comment")
@RequiredArgsConstructor
public class CommentLikeController {

    private final CommentLikeService commentLikeService;
    private final JwtUtil jwtUtil;

    @PostMapping("/{commentId}")
    public ResponseEntity<CommentLikeResponseDto> toggleLike(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long commentId) {

        String token = authHeader.substring(7);
        Long userId = jwtUtil.extractUserId(token);

        // 좋아요 토글 실행
        String message = commentLikeService.toggleCommentLike(userId, commentId);

        // 최신 상태 정보 조회
        long likeCount = commentLikeService.getLikeCount(commentId);
        boolean isLiked = !message.contains("취소");

        return ResponseEntity.ok(CommentLikeResponseDto.of(message, likeCount, isLiked));
    }
}