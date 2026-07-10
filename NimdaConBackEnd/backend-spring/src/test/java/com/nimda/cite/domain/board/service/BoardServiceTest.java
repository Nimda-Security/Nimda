package com.nimda.cite.domain.board.service;

import com.nimda.cite.domain.alarm.service.AlarmService;
import com.nimda.cite.domain.attachment.service.AttachmentService;
import com.nimda.cite.domain.board.entity.Board;
import com.nimda.cite.domain.board.enums.BoardStatus;
import com.nimda.cite.domain.board.repository.BoardRepository;
import com.nimda.cite.domain.comment.repository.CommentRepository;
import com.nimda.cite.domain.like.repository.BoardLikeRepository;
import com.nimda.cite.user.entity.User;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BoardServiceTest {

    @Mock
    private BoardRepository boardRepository;
    @Mock
    private CommentRepository commentRepository;
    @Mock
    private BoardLikeRepository boardLikeRepository;
    @Mock
    private AlarmService alarmService;
    @Mock
    private AttachmentService attachmentService;

    @InjectMocks
    private BoardService boardService;

    @Test
    void incrementViewCountUsesOneAtomicUpdateWithoutSavingTheEntity() {
        Board board = activeBoard(7L, 12);
        when(boardRepository.incrementPostView(7L, BoardStatus.ACTIVE)).thenReturn(1);

        boardService.incrementViewCount(board);

        assertEquals(13, board.getPostView());
        verify(boardRepository).incrementPostView(7L, BoardStatus.ACTIVE);
        verify(boardRepository, never()).save(any(Board.class));
    }

    @Test
    void incrementViewCountTreatsANullCounterAsZero() {
        Board board = activeBoard(8L, null);
        when(boardRepository.incrementPostView(8L, BoardStatus.ACTIVE)).thenReturn(1);

        boardService.incrementViewCount(board);

        assertEquals(1, board.getPostView());
    }

    @Test
    void incrementViewCountFailsWhenTheBoardIsNoLongerActive() {
        Board board = activeBoard(9L, 4);
        when(boardRepository.incrementPostView(9L, BoardStatus.ACTIVE)).thenReturn(0);

        RuntimeException error = assertThrows(
                RuntimeException.class,
                () -> boardService.incrementViewCount(board));

        assertEquals("게시글을 찾을 수 없습니다: 9", error.getMessage());
        assertEquals(4, board.getPostView());
    }

    @Test
    void recentBoardsAreRestrictedToActiveRows() {
        Board board = activeBoard(10L, 0);
        when(boardRepository.findTop10ByStatusOrderByCreatedAtDesc(BoardStatus.ACTIVE))
                .thenReturn(List.of(board));

        List<Board> result = boardService.getRecentBoards();

        assertEquals(1, result.size());
        assertSame(board, result.get(0));
        verify(boardRepository).findTop10ByStatusOrderByCreatedAtDesc(BoardStatus.ACTIVE);
    }
    @Test
    void updatingABoardPreservesItsOriginalAuthor() {
        User originalAuthor = new User();
        originalAuthor.setId(1L);
        User actingAdmin = new User();
        actingAdmin.setId(2L);
        Board board = activeBoard(11L, 3);
        board.setAuthor(originalAuthor);

        boardService.write(board, actingAdmin, null);

        assertSame(originalAuthor, board.getAuthor());
        verify(boardRepository).save(board);
    }

    private Board activeBoard(Long id, Integer views) {
        Board board = new Board();
        board.setId(id);
        board.setStatus(BoardStatus.ACTIVE);
        board.setPostView(views);
        return board;
    }
}
