package com.nimda.cite.like.service;

import com.nimda.cite.board.entity.Board;
import com.nimda.cite.like.entity.BoardLike;
import com.nimda.cite.board.repository.BoardRepository;
import com.nimda.cite.like.repository.BoardLikeRepository;
import com.nimda.cup.user.entity.User;
import com.nimda.cup.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BoardLikeService {

    private final BoardLikeRepository boardLikeRepository;
    private final BoardRepository boardRepository;
    private final UserRepository userRepository;

    // String 대신 ResponseEntity로 바꿔야 함
    @Transactional
    public String toggleLike(Long userId, Long boardId) {
        // 게시글 존재 확인
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new IllegalArgumentException("해당 게시글이 없습니다."));

        // 유저 존재 확인
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("해당 유저가 없습니다."));

        // 좋아요 존재 여부 확인
        Optional<BoardLike> boardLike = boardLikeRepository.findByBoardAndUser(board, user);

        if (boardLike.isPresent()) {
            // 이미 있으면 삭제 (좋아요 취소)
            boardLikeRepository.delete(boardLike.get());
            return "좋아요 취소 완료";
        } else {
            BoardLike newLike = BoardLike.builder().user(user).board(board).build();
            boardLikeRepository.save(newLike);
            return "좋아요 완료";
        }
    }

    @Transactional(readOnly = true)
    public long getLikeCount(Long boardId) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new IllegalArgumentException("해당 게시글이 없습니다."));
        return boardLikeRepository.countByBoardId(boardId);
    }

    // PostLikeService 내부에 추가
    @Transactional(readOnly = true)
    public boolean isUserLiked(Long userId, Long boardId) {
        // Board와 User 객체 존재 확인 후 존재 여부 반환
        return boardLikeRepository.existsByBoardIdAndUserId(boardId, userId);
    }
}
