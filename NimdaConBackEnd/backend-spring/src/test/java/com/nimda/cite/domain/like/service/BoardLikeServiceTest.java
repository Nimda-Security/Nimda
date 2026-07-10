package com.nimda.cite.domain.like.service;

import com.nimda.cite.domain.board.repository.BoardRepository;
import com.nimda.cite.domain.like.repository.BoardLikeRepository;
import com.nimda.cite.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.util.List;
import java.util.Map;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BoardLikeServiceTest {

    @Mock
    private BoardLikeRepository boardLikeRepository;
    @Mock
    private BoardRepository boardRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private BoardLikeService boardLikeService;

    @Test
    void emptyBatchInputsDoNotQueryTheDatabase() {
        assertTrue(boardLikeService.getLikeCounts(List.of()).isEmpty());
        assertTrue(boardLikeService.getLikedBoardIds(1L, List.of()).isEmpty());

        verifyNoInteractions(boardLikeRepository);
    }

    @Test
    void groupedLikeCountsAreConvertedToAnImmutableMap() {
        List<Long> boardIds = List.of(1L, 2L, 3L);
        when(boardLikeRepository.countByBoardIds(boardIds)).thenReturn(List.of(
                new Object[]{1L, 4L},
                new Object[]{3L, 2L}));

        Map<Long, Long> result = boardLikeService.getLikeCounts(boardIds);

        assertEquals(Map.of(1L, 4L, 3L, 2L), result);
        verify(boardLikeRepository).countByBoardIds(boardIds);
        assertThrowsUnsupportedMutation(result);
    }

    @Test
    void likedBoardIdsAreFetchedInOneQuery() {
        List<Long> boardIds = List.of(1L, 2L, 3L);
        when(boardLikeRepository.findLikedBoardIds(9L, boardIds)).thenReturn(List.of(1L, 3L));

        Set<Long> result = boardLikeService.getLikedBoardIds(9L, boardIds);

        assertEquals(Set.of(1L, 3L), result);
        verify(boardLikeRepository).findLikedBoardIds(9L, boardIds);
    }

    private void assertThrowsUnsupportedMutation(Map<Long, Long> result) {
        org.junit.jupiter.api.Assertions.assertThrows(
                UnsupportedOperationException.class,
                () -> result.put(5L, 1L));
    }
}
