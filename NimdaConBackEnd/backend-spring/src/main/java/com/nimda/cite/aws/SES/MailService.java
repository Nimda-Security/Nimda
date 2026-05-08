package com.nimda.cite.aws.SES;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.MailSender;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MailService {
    private final MailSender mailSender;

    public void sendEmail(String to, String code) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setFrom("no-reply@nimda.kr"); // 인증받은 도메인
        message.setSubject("[Nimda] 본인인증 번호 안내");
        message.setText("인증 번호는 [" + code + "] 입니다. 5분 내에 입력해주세요.");

        mailSender.send(message);
    }
}
