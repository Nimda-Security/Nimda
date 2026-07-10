package com.nimda.cite.domain.comment.service;

import com.nimda.cite.domain.alarm.Event.AddChildCommentEvent;
import com.nimda.cite.domain.board.entity.Board;
import com.nimda.cite.domain.board.entity.Category;
import com.nimda.cite.domain.board.enums.BoardStatus;
import com.nimda.cite.domain.board.repository.BoardRepository;
import com.nimda.cite.domain.board.repository.CategoryRepository;
import com.nimda.cite.domain.comment.dto.CommentCreateRequest;
import com.nimda.cite.domain.comment.dto.MyCommentResponse;
import com.nimda.cite.domain.comment.entity.Comment;
import com.nimda.cite.domain.comment.enums.STATUS;
import com.nimda.cite.domain.comment.repository.CommentRepository;
import com.nimda.cite.domain.like.repository.CommentLikeRepositroy;
import com.nimda.cite.user.entity.User;
import com.nimda.cite.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CommentServiceTest {

    @Mock
    private CommentRepository commentRepository;
    @Mock
    private BoardRepository boardRepository;
    @Mock
    private CategoryRepository categoryRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private ApplicationEventPublisher eventPublisher;
    @Mock
    private CommentLikeRepositroy commentLikeRepository;

    @InjectMocks
    private CommentService commentService;

    @Test
    void createCommentRejectsAParentFromAnotherBoard() {
        User author = user(10L);
        Board targetBoard = activeBoard(20L, normalCategory(1L));
        Board otherBoard = activeBoard(21L, normalCategory(2L));
        Comment foreignParent = Comment.builder()
                .id(30L)
                .board(otherBoard)
                .author(user(11L))
                .context("parent")
                .status(STATUS.PUBLIC)
                .build();

        when(userRepository.findById(10L)).thenReturn(Optional.of(author));
        when(boardRepository.findById(20L)).thenReturn(Optional.of(targetBoard));
        when(commentRepository.findById(30L)).thenReturn(Optional.of(foreignParent));

        assertThrows(
                IllegalStateException.class,
                () -> commentService.createComment(
                        20L, new CommentCreateRequest(30L, "reply"), 10L));

        verify(commentRepository, never()).save(any(Comment.class));
        verify(eventPublisher, never()).publishEvent(any(AddChildCommentEvent.class));
    }

    @Test
    void createCommentRejectsANonActiveBoard() {
        User author = user(10L);
        Board hiddenBoard = activeBoard(20L, normalCategory(1L));
        hiddenBoard.setStatus(BoardStatus.HIDDEN);

        when(userRepository.findById(10L)).thenReturn(Optional.of(author));
        when(boardRepository.findById(20L)).thenReturn(Optional.of(hiddenBoard));

        assertThrows(
                AccessDeniedException.class,
                () -> commentService.createComment(
                        20L, new CommentCreateRequest(null, "comment"), 10L));

        verify(commentRepository, never()).save(any(Comment.class));
    }

    @Test
    void publicProfileCommentsExcludeRestrictedBoardsAndHiddenComments() {
        User subject = user(10L);
        User ordinaryViewer = user(11L);
        Comment visible = comment(40L, subject, activeBoard(20L, normalCategory(1L)), STATUS.PUBLIC);
        Comment cartel = comment(41L, subject, activeBoard(21L, cartelCategory(2L)), STATUS.PUBLIC);
        Comment hidden = comment(42L, subject, activeBoard(22L, normalCategory(3L)), STATUS.HIDDEN);

        when(userRepository.findById(10L)).thenReturn(Optional.of(subject));
        when(userRepository.findById(11L)).thenReturn(Optional.of(ordinaryViewer));
        when(commentRepository.findByMyComments(subject, List.of(STATUS.DELETED)))
                .thenReturn(List.of(visible, cartel, hidden));

        List<MyCommentResponse> result = commentService.getVisibleCommentsByUser(10L, 11L);

        assertEquals(1, result.size());
        assertEquals(40L, result.get(0).getId());
    }

    private User user(Long id) {
        User user = new User();
        user.setId(id);
        return user;
    }

    private Category normalCategory(Long id) {
        return Category.builder().id(id).name("normal").slug("normal-" + id).build();
    }

    private Category cartelCategory(Long id) {
        return Category.builder().id(id).name("cartel").slug("cartel").build();
    }

    private Board activeBoard(Long id, Category category) {
        Board board = new Board();
        board.setId(id);
        board.setCategory(category);
        board.setStatus(BoardStatus.ACTIVE);
        board.setAuthor(user(99L));
        board.setTitle("board");
        return board;
    }

    private Comment comment(Long id, User author, Board board, STATUS status) {
        Comment comment = Comment.builder()
                .id(id)
                .author(author)
                .board(board)
                .context("comment-" + id)
                .status(status)
                .build();
        ReflectionTestUtils.setField(comment, "createdAt", LocalDateTime.of(2026, 7, 10, 12, 0));
        return comment;
    }
}
