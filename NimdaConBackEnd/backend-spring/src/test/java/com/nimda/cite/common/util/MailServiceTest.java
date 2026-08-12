package com.nimda.cite.common.util;

import redis.util.RedisUtil;
import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.MailSendException;
import org.springframework.mail.javamail.JavaMailSender;
import org.thymeleaf.spring6.SpringTemplateEngine;
import org.thymeleaf.context.Context;

import java.util.Properties;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MailServiceTest {

    @Mock
    private JavaMailSender javaMailSender;
    @Mock
    private RedisUtil redisUtil;
    @Mock
    private SpringTemplateEngine templateEngine;
    @InjectMocks
    private MailService mailService;

    @Test
    void verificationAtomicallyConsumesOnlyTheMatchingChallengeCode() {
        when(redisUtil.deleteIfValueMatches("AUTH_CODE:challenge-a", "correct"))
                .thenReturn(true);

        assertTrue(mailService.verifyCode("challenge-a", "correct"));
        assertFalse(mailService.verifyCode("", "correct"));
        assertFalse(mailService.verifyCode("challenge-a", ""));

        verify(redisUtil).deleteIfValueMatches("AUTH_CODE:challenge-a", "correct");
    }

    @Test
    void decoyRecoveryDispatchDoesNotTouchMailOrCodeStorage() {
        mailService.dispatchRecoveryCode(
                "unknown@example.com", "decoy-challenge", false);

        verifyNoInteractions(javaMailSender, redisUtil, templateEngine);
    }

    @Test
    void asynchronousRecoveryDispatchContainsMailFailures() {
        when(javaMailSender.createMimeMessage())
                .thenThrow(new IllegalStateException("mail unavailable"));

        assertDoesNotThrow(() -> mailService.dispatchRecoveryCode(
                "audit@example.com", "challenge-c", true));

        verify(javaMailSender).createMimeMessage();
    }

    @Test
    void failedMailDeliveryRemovesTheUndeliveredChallengeCode() {
        MimeMessage message = new MimeMessage(Session.getInstance(new Properties()));
        when(javaMailSender.createMimeMessage()).thenReturn(message);
        when(redisUtil.incrementAndSetTtl("MAIL_LIMIT:audit@example.com")).thenReturn(1L);
        when(templateEngine.process(eq("password-change-mail"), any(Context.class)))
                .thenReturn("<p>code</p>");
        doThrow(new MailSendException("mail unavailable"))
                .when(javaMailSender).send(message);

        assertThrows(
                MailSendException.class,
                () -> mailService.sendAuthCode("audit@example.com", "challenge-b"));

        ArgumentCaptor<String> codeCaptor = ArgumentCaptor.forClass(String.class);
        verify(redisUtil).setDataWithExpiration(
                eq("AUTH_CODE:challenge-b"), codeCaptor.capture(), eq(300L));
        verify(redisUtil).deleteIfValueMatches(
                "AUTH_CODE:challenge-b", codeCaptor.getValue());
    }
}
