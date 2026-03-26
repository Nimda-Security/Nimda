package com.nimda.cite.like.controller;

import com.nimda.cite.board.dto.BoardResponseDTO;
import com.nimda.cite.board.entity.Board;
import com.nimda.cite.comment.enums.STATUS;
import com.nimda.cite.comment.repository.CommentRepository;
import com.nimda.cite.common.response.ApiResponse;
import com.nimda.cite.like.dto.BoardLikeResponse;
import com.nimda.cite.like.service.BoardLikeService;
import com.nimda.cup.common.util.JwtUtil;
import com.nimda.cup.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

// 매핑 이름 바꿔야 함

@RestController
@RequestMapping("/api/like/board")
@RequiredArgsConstructor
public class BoardLikeController {

    private final BoardLikeService boardLikeService;
    private final JwtUtil jwtUtil;
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;

    /**
     * 타인의 좋아요한 게시글 목록 조회 (공개 프로필용, 인증 불필요)
     * GET /api/like/board/user/{nickname}/liked
     */
    @GetMapping("/user/{nickname}/liked")
    public ResponseEntity<?> getLikedBoardsByNickname(@PathVariable String nickname) {
        try {
            return userRepository.findByNickname(nickname)
                    .map(user -> {
                        List<Board> boards = boardLikeService.getTotalLikeBoards(user.getId());
                        List<BoardResponseDTO> dtos = boards.stream()
                                .map(b -> BoardResponseDTO.from(b,
                                        boardLikeService.getLikeCount(b.getId()),
                                        commentRepository.countByBoardIdAndStatusNot(b.getId(), STATUS.DELETED)))
                                .toList();
                        return ApiResponse.ok(Map.of("boards", dtos)).toResponse();
                    })
                    .orElseThrow(() ->
                            new ResponseStatusException(HttpStatus.NOT_FOUND));
        } catch (Exception e) {
            return ApiResponse.fail("조회 중 오류가 발생했습니다: " + e.getMessage())
                    .toResponse(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // 게시글 내에서 표기할 좋아요 개수와 좋아요 여부
    @GetMapping("/{boardId}/likeStatus")
    public ResponseEntity<?> getLikeStatus(
            @PathVariable Long boardId,
            @RequestHeader("Authorization") String authHeader) {

        Long userId = jwtUtil.extractUserId(authHeader.substring(7));
        long count = boardLikeService.getLikeCount(boardId);
        boolean isLiked = boardLikeService.isUserLiked(userId, boardId);
        BoardLikeResponse dto = BoardLikeResponse.builder().likeCount(count).isLiked(isLiked).build();
        return ApiResponse.ok(dto).toResponse();
    }

    @GetMapping("/{boardId}/likeCount")
    public ResponseEntity<?> getLikeCount(@PathVariable Long boardId) {
        long likeCount = boardLikeService.getLikeCount(boardId);
        return ApiResponse.ok(BoardLikeResponse.builder().likeCount(likeCount).build()).toResponse();
    }

    @PostMapping("/{boardId}")
    public ResponseEntity<?> toggleLike(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long boardId) {

        Long userId = jwtUtil.extractUserId(authHeader.substring(7));
        String message = boardLikeService.toggleLike(userId, boardId);
        long likeCount = boardLikeService.getLikeCount(boardId);
        boolean isLiked = !message.contains("취소");
        return ApiResponse.ok(BoardLikeResponse.of(message, likeCount, isLiked)).toResponse();
    }

    @GetMapping("/totalLikes")
    public ResponseEntity<?> getTotalLikesReceived(@RequestHeader("Authorization") String authHeader) {
        Long userId = jwtUtil.extractUserId(authHeader.substring(7));
        long totalReceived = boardLikeService.getTotalLikesReceived(userId);
        BoardLikeResponse dto = BoardLikeResponse.builder().likeCount(totalReceived).build();
        return ApiResponse.ok(dto).toResponse();
    }

    @GetMapping("/pushedLikes")
    public ResponseEntity<?> getLikeBoards(@RequestHeader("Authorization") String authHeader) {
        Long userId = jwtUtil.extractUserId(authHeader.substring(7));
        List<Board> boards = boardLikeService.getTotalLikeBoards(userId);
        List<BoardResponseDTO> dtos = boards.stream()
                .map(b -> BoardResponseDTO.from(b,
                        boardLikeService.getLikeCount(b.getId()),
                        commentRepository.countByBoardIdAndStatusNot(b.getId(), STATUS.DELETED)))
                .toList();
        return ApiResponse.ok(Map.of("boards", dtos)).toResponse();
    }

    @GetMapping("/pushedLikes/count")
    public ResponseEntity<?> getPushedLikesCount(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        // 1. 헤더가 없는 경우 즉시 처리 (NPE 방지)
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ApiResponse.fail("로그인 정보가 없습니다.").toResponse(HttpStatus.UNAUTHORIZED);
        }

        try {
            String token = authHeader.substring(7);
            Long userId = jwtUtil.extractUserId(token);

            long count = boardLikeService.countTotalLikeBoards(userId);

            // 2. 프론트엔드 boardLike.ts의 'result.data?.count'와 맞추기 위해 "count"로 키값 설정
            return ApiResponse.ok(Map.of("likeCount", count)).toResponse();
        } catch (Exception e) {
            return ApiResponse.fail("유효하지 않은 토큰입니다.").toResponse(HttpStatus.UNAUTHORIZED);
        }
    }
}