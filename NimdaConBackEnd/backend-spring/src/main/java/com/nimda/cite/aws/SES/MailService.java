package com.nimda.cite.aws.SES;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * 이메일 발송 서비스 - Spring Mail을 사용한 SMTP 기반 이메일 전송
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MailService {
    private final JavaMailSender javaMailSender;

    /**
     * 인증 코드 이메일 발송
     * @param to 수신자 이메일
     * @param code 인증 코드
     */
    public void sendEmail(String to, String code) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setFrom("no-reply@nimda.kr"); // 인증받은 도메인 또는 발신자 이메일
            message.setSubject("[Nimda] 본인인증 번호 안내");
            message.setText("인증 번호는 [" + code + "] 입니다. 5분 내에 입력해주세요.");

            javaMailSender.send(message);
            log.info("인증 이메일 발송 성공: {}", to);
        } catch (MailException e) {
            log.error("이메일 발송 실패: {} - {}", to, e.getMessage());
            throw new RuntimeException("이메일 발송에 실패했습니다.", e);
        }
    }

    /**
     * 일반 이메일 발송
     * @param to 수신자 이메일
     * @param subject 제목
     * @param body 본문
     */
    public void sendSimpleEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setFrom("no-reply@nimda.kr");
            message.setSubject(subject);
            message.setText(body);

            javaMailSender.send(message);
            log.info("이메일 발송 성공: {} - {}", to, subject);
        } catch (MailException e) {
            log.error("이메일 발송 실패: {} - {}", to, e.getMessage());
            throw new RuntimeException("이메일 발송에 실패했습니다.", e);
        }
    }
}
