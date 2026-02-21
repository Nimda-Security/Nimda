package com.nimda.cite.like.controller;

import com.nimda.cite.like.dto.LikeStatusResponse;
import com.nimda.cite.like.service.BoardLikeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/board")
@RequiredArgsConstructor
public class BoardLikeController {

    private final BoardLikeService boardLikeService;

    // 게시글 내에서 표기할 좋아요 여부
    @GetMapping("/{boardId}/like-status")
    public ResponseEntity<LikeStatusResponse> getLikeStatus(
            @PathVariable Long boardId,
            @RequestParam Long userId) {

        long count = boardLikeService.getLikeCount(boardId);
        boolean isLiked = boardLikeService.isUserLiked(userId, boardId);

        return ResponseEntity.ok(new LikeStatusResponse(count, isLiked));
    }

    // 게시글 리스트에 보낼 게시글의 좋아요 수
    @GetMapping("/{boardId}/like-count")
    public ResponseEntity<Long> getLikeCount(@PathVariable Long boardId) {
        return ResponseEntity.ok(boardLikeService.getLikeCount(boardId));
    }
}
