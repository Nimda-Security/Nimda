package com.nimda.cite.domain.like.service;

import com.nimda.cite.domain.alarm.Event.PushLikeButtonEvent;
import com.nimda.cite.domain.board.entity.Board;
import com.nimda.cite.domain.like.entity.BoardLike;
import com.nimda.cite.domain.board.repository.BoardRepository;
import com.nimda.cite.domain.like.repository.BoardLikeRepository;
import com.nimda.cite.user.entity.User;
import com.nimda.cite.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BoardLikeService {

    private final BoardLikeRepository boardLikeRepository;
    private final BoardRepository boardRepository;
    private final UserRepository userRepository;
    private final ApplicationEventPublisher eventPublisher;

    
    @Transactional
    public String toggleLike(Long userId, Long boardId) {
        // 좋아요 누른 사람
        User liker = userRepository.findById(userId).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND)
        );

        Board board = boardRepository.findById(boardId).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND)
        );

        Optional<BoardLike> like = boardLikeRepository.findByBoardAndLiker(board, liker);

        if (like.isPresent()) {
            boardLikeRepository.delete(like.get());
            return "좋아요 취소 완료";
        } else {
            boardLikeRepository.save(BoardLike.builder().liker(liker).board(board).author(board.getAuthor()).build());

            // 자신이 누른 좋아요는 발송되지 않음
            if (!board.getAuthor().getId().equals(userId)) {

                eventPublisher.publishEvent(new PushLikeButtonEvent(this,
                        board, board.getAuthor(), liker));
            }
            return "좋아요 완료";
        }
    }

    @Transactional(readOnly = true)
    public long getLikeCount(Long boardId) {
        return boardLikeRepository.countByBoardId(boardId);
    }

    // PostLikeService 내부에 추가
    @Transactional(readOnly = true)
    public boolean isUserLiked(Long userId, Long boardId) {
        return boardLikeRepository.existsByBoardIdAndLikerId(boardId, userId);
    }

    @Transactional(readOnly = true)
    public Map<Long, Long> getLikeCounts(List<Long> boardIds) {
        if (boardIds == null || boardIds.isEmpty()) {
            return Map.of();
        }

        Map<Long, Long> counts = new HashMap<>();
        for (Object[] row : boardLikeRepository.countByBoardIds(boardIds)) {
            if (row != null && row.length >= 2 && row[0] instanceof Number boardId
                    && row[1] instanceof Number count) {
                counts.put(boardId.longValue(), count.longValue());
            }
        }
        return Map.copyOf(counts);
    }

    @Transactional(readOnly = true)
    public Set<Long> getLikedBoardIds(Long userId, List<Long> boardIds) {
        if (userId == null || boardIds == null || boardIds.isEmpty()) {
            return Set.of();
        }

        Set<Long> likedBoardIds = new HashSet<>();
        for (Long boardId : boardLikeRepository.findLikedBoardIds(userId, boardIds)) {
            if (boardId != null) {
                likedBoardIds.add(boardId);
            }
        }
        return Set.copyOf(likedBoardIds);
    }

    @Transactional(readOnly = true)
    public long getTotalLikesReceived(Long authorId) {
        User user = userRepository.findById(authorId).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND)
        );
        return boardLikeRepository.countTotalLikesByAuthorId(authorId);
    }

    @Transactional(readOnly = true)
    public List<Board> getTotalLikeBoards(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND)
        );
        return boardLikeRepository.findAllByLikerId(userId).stream()
                .map(BoardLike::getBoard)
                .collect(Collectors.toList());
    }
    
    // 좋아요 누른 게시글 개수 가지고 오기
    @Transactional(readOnly = true)
    public long countTotalLikeBoards(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "유저를 찾을 수 없습니다.")
        );
        // Repository에 countByLikerId 또는 유사한 메서드가 있어야 합니다.
        return boardLikeRepository.countByLikerId(userId);
    }
}
