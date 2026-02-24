package com.nimda.cite.like.controller;

import com.nimda.cite.board.entity.Board;
import com.nimda.cite.like.dto.BoardLikeResponse;
import com.nimda.cite.like.service.BoardLikeService;
import com.nimda.cup.common.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// 매핑 이름 바꿔야 함

@RestController
@RequestMapping("/api/like/board")
@RequiredArgsConstructor
public class BoardLikeController {

    private final BoardLikeService boardLikeService;
    private final JwtUtil jwtUtil;

    // 게시글 내에서 표기할 좋아요 개수와 좋아요 여부
    @GetMapping("/{boardId}/likeStatus")
    public ResponseEntity<BoardLikeResponse> getLikeStatus(
            @PathVariable Long boardId,
            @RequestHeader("Authorization") String authHeader) {

        Long userId = jwtUtil.extractUserId(authHeader.substring(7));

        long count = boardLikeService.getLikeCount(boardId);
        boolean isLiked = boardLikeService.isUserLiked(userId, boardId);
        BoardLikeResponse dto = BoardLikeResponse.builder().likeCount(count).isLiked(isLiked).build();

        return ResponseEntity.ok(dto);
    }

    // 게시글 리스트에 보낼 게시글의 좋아요 수
    @GetMapping("/{boardId}/likeCount")
    public ResponseEntity<BoardLikeResponse> getLikeCount(@PathVariable Long boardId) {
        long likeCount = boardLikeService.getLikeCount(boardId);

        return ResponseEntity.ok(BoardLikeResponse.builder().likeCount(likeCount).build());
    }

    // 좋아요 누르기
    @PostMapping("/{boardId}")
    public ResponseEntity<BoardLikeResponse> toggleLike(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long boardId) {

        Long userId = jwtUtil.extractUserId(authHeader.substring(7));
        // 좋아요 토글 실행 (여기서 AlarmService를 통해 알림도 발생)
        String message = boardLikeService.toggleLike(userId, boardId);
        long likeCount = boardLikeService.getLikeCount(boardId);
        // 이미 눌렀다면 true, 누르지 않았다면 false
        boolean isLiked = !message.contains("취소");

        return ResponseEntity.ok(BoardLikeResponse.of(message, likeCount, isLiked));
    }
    
    // 본인 게시글에 달린 좋아요 전체 개수
    @GetMapping("/totalLikes")
    public ResponseEntity<BoardLikeResponse> getTotalLikesReceived(
            @RequestHeader("Authorization") String authHeader)
    {
        Long userId = jwtUtil.extractUserId(authHeader.substring(7));

        long totalReceived = boardLikeService.getTotalLikesReceived(userId);
        BoardLikeResponse dto = BoardLikeResponse.builder().likeCount(totalReceived).build();
        return ResponseEntity.ok(dto);
    }

    // 좋아요 누른 게시글 가지고 오기
    @GetMapping("/pushedLikes")
    public ResponseEntity<List<Board>> getLikeBoards(@RequestHeader("Authorization") String authHeader) {

        Long userId = jwtUtil.extractUserId(authHeader.substring(7));

        return ResponseEntity.ok(boardLikeService.getTotalLikeBoards(userId));
    }
}