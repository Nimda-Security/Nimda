package com.nimda.cite.like.service;

import com.nimda.cite.alarm.Event.PushLikeButtonEvent;
import com.nimda.cite.alarm.service.AlarmService;
import com.nimda.cite.board.entity.Board;
import com.nimda.cite.like.entity.BoardLike;
import com.nimda.cite.board.repository.BoardRepository;
import com.nimda.cite.like.repository.BoardLikeRepository;
import com.nimda.cite.notification.entity.Notification;
import com.nimda.cite.notification.enums.NotificationType;
import com.nimda.cup.user.entity.User;
import com.nimda.cup.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BoardLikeService {

    private final BoardLikeRepository boardLikeRepository;
    private final BoardRepository boardRepository;
    private final UserRepository userRepository;
    private final AlarmService alarmService;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public String toggleLike(Long userId, Long boardId) {
        // 좋아요 누른 사람
        User liker = userRepository.findById(userId).orElseThrow();
        Board board = boardRepository.findById(boardId).orElseThrow();

        Optional<BoardLike> like = boardLikeRepository.findByBoardAndLiker(board, liker);

        if (like.isPresent()) {
            boardLikeRepository.delete(like.get());
            return "좋아요 취소 완료";
        } else {
            boardLikeRepository.save(BoardLike.builder().liker(liker).board(board).author(board.getAuthor()).build());

            // 자신이 누른 좋아요는 발송되지 않음
            if (!board.getAuthor().getId().equals(userId)) {
                Notification notification = Notification.builder()
                        .recipient(board.getAuthor()) // 게시글 작성자
                        .sender(liker)                // 좋아요 누른 사람
                        .notificationType(NotificationType.PushLikeButtonAtBoard)
                        .message(liker.getNickname() + "님이 내 게시글 '" + board.getTitle() + "'을 좋아합니다.")
                        .relatedEntityId(boardId)
                        .relatedUrl("/api/cite/board/" + boardId)
                        .isRead(false)
                        .build();

                eventPublisher.publishEvent(new PushLikeButtonEvent(this,
                        board, board.getAuthor(), liker));


                alarmService.send(notification); // AlarmService의 send 메서드 호출
            }
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
        return boardLikeRepository.existsByBoardIdAndLikerId(boardId, userId);
    }

    @Transactional(readOnly = true)
    public long getTotalLikesReceived(Long authorId) {
        return boardLikeRepository.countTotalLikesByAuthorId(authorId);
    }

    @Transactional(readOnly = true)
    public List<Board> getTotalLikeBoards(Long userId) {
        return boardLikeRepository.findAllByLikerId(userId).stream()
                .map(BoardLike::getBoard)
                .collect(Collectors.toList());
    }
}
