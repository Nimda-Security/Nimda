package com.nimda.cite.domain.privacy;

import com.nimda.cite.domain.comment.repository.CommentRepository;
import com.nimda.cite.domain.like.controller.BoardLikeController;
import com.nimda.cite.domain.like.service.BoardLikeService;
import com.nimda.cite.domain.point.controller.PointController;
import com.nimda.cite.domain.point.entity.UserBalance;
import com.nimda.cite.domain.point.service.PointService;
import com.nimda.cite.user.entity.Authority;
import com.nimda.cite.user.entity.User;
import com.nimda.cite.user.repository.UserRepository;
import com.nimda.cite.user.security.CustomUserDetails;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PrivateActivityAuthorizationTest {

    @Mock
    private PointService pointService;
    @Mock
    private BoardLikeService boardLikeService;
    @Mock
    private CommentRepository commentRepository;
    @Mock
    private UserRepository userRepository;

    @Test
    void pointNicknameEndpointsRejectAnUnrelatedUserBeforeLookingUpTheTarget() {
        PointController controller = new PointController(pointService, userRepository);
        CustomUserDetails unrelatedUser = details("viewer", "ROLE_USER");

        assertEquals(HttpStatus.FORBIDDEN,
                controller.getBalanceByNickname(unrelatedUser, "target").getStatusCode());
        assertEquals(HttpStatus.FORBIDDEN,
                controller.getPointDetailsByNickname(unrelatedUser, "target").getStatusCode());

        verifyNoInteractions(userRepository);
    }

    @Test
    void likedBoardsByNicknameRejectsAnUnrelatedUserBeforeLookingUpTheTarget() {
        BoardLikeController controller = new BoardLikeController(boardLikeService, commentRepository, userRepository);

        assertEquals(HttpStatus.FORBIDDEN,
                controller.getLikedBoardsByNickname(details("viewer", "ROLE_USER"), "target").getStatusCode());

        verifyNoInteractions(userRepository);
    }

    @Test
    void pointNicknameEndpointsUseTheOwnersStableIdAndOnlyAdminsUseNicknameLookup() {
        PointController controller = new PointController(pointService, userRepository);
        when(pointService.findUserBalance(1L)).thenReturn(
                UserBalance.builder().totalAmount(0L).build());
        when(userRepository.findByNickname("target")).thenReturn(Optional.empty());

        assertEquals(HttpStatus.OK,
                controller.getBalanceByNickname(details("target", "ROLE_USER"), "target")
                        .getStatusCode());
        assertEquals(HttpStatus.OK,
                controller.getPointDetailsByNickname(details("target", "ROLE_USER"), "target")
                        .getStatusCode());
        assertNotFound(() -> controller.getBalanceByNickname(
                details("administrator", "ROLE_ADMIN"), "target"));
        assertNotFound(() -> controller.getPointDetailsByNickname(
                details("administrator", "ROLE_ADMIN"), "target"));

        verify(pointService).findUserBalance(1L);
        verify(pointService).findPointDetail(1L);
        verify(userRepository, org.mockito.Mockito.times(2)).findByNickname("target");
    }

    @Test
    void likedBoardsByNicknameUsesTheOwnersStableIdAndOnlyAdminsUseNicknameLookup() {
        BoardLikeController controller = new BoardLikeController(
                boardLikeService, commentRepository, userRepository);
        when(userRepository.findByNickname("target")).thenReturn(Optional.empty());

        assertEquals(HttpStatus.OK,
                controller.getLikedBoardsByNickname(
                        details("target", "ROLE_USER"), "target").getStatusCode());
        assertNotFound(() -> controller.getLikedBoardsByNickname(
                details("administrator", "ROLE_ADMIN"), "target"));

        verify(boardLikeService).getTotalLikeBoards(1L);
        verify(userRepository).findByNickname("target");
    }

    private void assertNotFound(ThrowingCall call) {
        ResponseStatusException exception = assertThrows(ResponseStatusException.class, call::run);
        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
    }

    private CustomUserDetails details(String nickname, String authorityName) {
        User user = new User();
        user.setId(1L);
        user.setNickname(nickname);
        user.getAuthorities().add(new Authority(1L, authorityName));
        return new CustomUserDetails(user);
    }

    @FunctionalInterface
    private interface ThrowingCall {
        void run();
    }
}
