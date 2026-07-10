package com.nimda.cite.user.service;

import com.nimda.cite.user.dto.ChangePassword.CheckUserValidateResponse;
import com.nimda.cite.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserRecoveryServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserRecoveryService userRecoveryService;

    @Test
    void fullIdentityMatchSetsEveryValidationFlag() {
        when(userRepository.existsByUserIdAndStudentNumAndEmail(
                "recovery-user", "202400001", "recovery@example.com"))
                .thenReturn(true);

        CheckUserValidateResponse response = userRecoveryService.checkValidate(
                "recovery-user", "202400001", "recovery@example.com");

        assertTrue(response.isValidateUserId());
        assertTrue(response.isValidateStudentNum());
        assertTrue(response.isValidateEmail());
        verify(userRepository).existsByUserIdAndStudentNumAndEmail(
                "recovery-user", "202400001", "recovery@example.com");
        verifyNoMoreInteractions(userRepository);
    }

    @Test
    void nonMatchingIdentitySetsEveryValidationFlagFalse() {
        when(userRepository.existsByUserIdAndStudentNumAndEmail(
                "recovery-user", "202400001", "wrong@example.com"))
                .thenReturn(false);

        CheckUserValidateResponse response = userRecoveryService.checkValidate(
                "recovery-user", "202400001", "wrong@example.com");

        assertFalse(response.isValidateUserId());
        assertFalse(response.isValidateStudentNum());
        assertFalse(response.isValidateEmail());
        verify(userRepository).existsByUserIdAndStudentNumAndEmail(
                "recovery-user", "202400001", "wrong@example.com");
        verifyNoMoreInteractions(userRepository);
    }
}
