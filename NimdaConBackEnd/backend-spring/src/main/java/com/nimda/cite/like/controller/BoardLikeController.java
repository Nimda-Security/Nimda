package com.nimda.cite.like.controller;

import com.nimda.cite.like.dto.LikeResponseDto;
import com.nimda.cite.like.dto.LikeStatusResponseDto;
import com.nimda.cite.like.service.BoardLikeService;
import com.nimda.cup.common.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/board")
@RequiredArgsConstructor
public class BoardLikeController {

    private final BoardLikeService boardLikeService;
    private final JwtUtil jwtUtil;

    // 게시글 내에서 표기할 좋아요 여부
    @GetMapping("/{boardId}/likeStatus")
    public ResponseEntity<LikeStatusResponseDto> getLikeStatus(
            @PathVariable Long boardId,
            @RequestParam Long userId) {

        long count = boardLikeService.getLikeCount(boardId);
        boolean isLiked = boardLikeService.isUserLiked(userId, boardId);

        return ResponseEntity.ok(new LikeStatusResponseDto(count, isLiked));
    }

    // 게시글 리스트에 보낼 게시글의 좋아요 수
    @GetMapping("/{boardId}/likeCount")
    public ResponseEntity<Long> getLikeCount(@PathVariable Long boardId) {
        return ResponseEntity.ok(boardLikeService.getLikeCount(boardId));
    }

    @PostMapping("/{boardId}")
    public ResponseEntity<LikeResponseDto> toggleLike(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long boardId) {

        String token = authHeader.substring(7);
        Long userId = jwtUtil.extractUserId(token);

        // 좋아요 토글 실행 (여기서 AlarmService를 통해 알림도 발생)
        String message = boardLikeService.toggleLike(userId, boardId);
        long likeCount = boardLikeService.getLikeCount(boardId);
        // 이미 눌렀다면 true, 누르지 않았다면 false
        boolean isLiked = !message.contains("취소");

        return ResponseEntity.ok(LikeResponseDto.of(message, likeCount, isLiked));
    }
}
