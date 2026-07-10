package com.nimda.cite.domain.like.controller;

import com.nimda.cite.domain.board.dto.BoardResponseDTO;
import com.nimda.cite.domain.board.entity.Board;
import com.nimda.cite.domain.comment.enums.STATUS;
import com.nimda.cite.domain.comment.repository.CommentRepository;
import com.nimda.cite.common.response.ApiResponse;
import com.nimda.cite.domain.like.dto.BoardLikeResponse;
import com.nimda.cite.domain.like.service.BoardLikeService;
import com.nimda.cite.user.entity.User;
import com.nimda.cite.user.repository.UserRepository;
import com.nimda.cite.user.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;

    /**
     * 특정 유저가 좋아요한 게시글 목록 조회
     * GET /api/like/board/user/{nickname}/liked
     */
    @GetMapping("/user/{nickname}/liked")
    public ResponseEntity<?> getLikedBoardsByNickname(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String nickname) {
        Long targetUserId = resolvePrivateActivityUserId(userDetails, nickname);
        if (targetUserId == null) {
            return ApiResponse.fail("접근 권한이 없습니다.").toResponse(HttpStatus.FORBIDDEN);
        }

        List<Board> boards = boardLikeService.getTotalLikeBoards(targetUserId);
        List<BoardResponseDTO> dtos = boards.stream()
                .map(board -> BoardResponseDTO.from(
                        board,
                        boardLikeService.getLikeCount(board.getId()),
                        true,
                        commentRepository.countByBoardIdAndStatusNot(
                                board.getId(), STATUS.DELETED)))
                .toList();
        return ApiResponse.ok(Map.of("boards", dtos)).toResponse();
    }

    private Long resolvePrivateActivityUserId(
            CustomUserDetails userDetails, String nickname) {
        if (userDetails == null || userDetails.getUser() == null) {
            return null;
        }
        boolean isAdministrator = userDetails.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));
        if (!isAdministrator) {
            return userDetails.getUser().getNickname().equals(nickname)
                    ? userDetails.getUser().getId()
                    : null;
        }
        return userRepository.findByNickname(nickname)
                .map(User::getId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    // 게시글 내에서 표기할 좋아요 개수와 좋아요 여부
    @GetMapping("/{boardId}/likeStatus")
    public ResponseEntity<?> getLikeStatus(
            @PathVariable Long boardId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        Long userId = userDetails.getUser().getId();
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
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long boardId) {

        Long userId = userDetails.getUser().getId();
        String message = boardLikeService.toggleLike(userId, boardId);
        long likeCount = boardLikeService.getLikeCount(boardId);
        boolean isLiked = !message.contains("취소");
        return ApiResponse.ok(BoardLikeResponse.of(message, likeCount, isLiked)).toResponse();
    }

    @GetMapping("/totalLikes")
    public ResponseEntity<?> getTotalLikesReceived(@AuthenticationPrincipal CustomUserDetails userDetails) {
        Long userId = userDetails.getUser().getId();
        long totalReceived = boardLikeService.getTotalLikesReceived(userId);
        BoardLikeResponse dto = BoardLikeResponse.builder().likeCount(totalReceived).build();
        return ApiResponse.ok(dto).toResponse();
    }

    @GetMapping("/pushedLikes")
    public ResponseEntity<?> getLikeBoards(@AuthenticationPrincipal CustomUserDetails userDetails) {
        Long userId = userDetails.getUser().getId();
        List<Board> boards = boardLikeService.getTotalLikeBoards(userId);
        List<BoardResponseDTO> dtos = boards.stream()
                .map(b -> BoardResponseDTO.from(b,
                        boardLikeService.getLikeCount(b.getId()),
                        true,
                        commentRepository.countByBoardIdAndStatusNot(b.getId(), STATUS.DELETED)))
                .toList();
        return ApiResponse.ok(Map.of("boards", dtos)).toResponse();
    }

    @GetMapping("/pushedLikes/count")
    public ResponseEntity<?> getPushedLikesCount(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        if (userDetails == null) {
            return ApiResponse.fail("로그인 정보가 없습니다.").toResponse(HttpStatus.UNAUTHORIZED);
        }

        try {
            Long userId = userDetails.getUser().getId();

            long count = boardLikeService.countTotalLikeBoards(userId);

            // 2. 프론트엔드 boardLike.ts의 'result.data?.count'와 맞추기 위해 "count"로 키값 설정
            return ApiResponse.ok(Map.of("likeCount", count)).toResponse();
        } catch (Exception e) {
            return ApiResponse.fail("유효하지 않은 토큰입니다.").toResponse(HttpStatus.UNAUTHORIZED);
        }
    }
}
