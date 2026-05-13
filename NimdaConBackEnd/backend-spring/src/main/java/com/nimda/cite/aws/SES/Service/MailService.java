package com.nimda.cite.aws.SES.Service;

import com.nimda.cite.common.util.RandomModule;
import com.nimda.cite.common.util.RedisUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.Random;

@Slf4j
@Service
@RequiredArgsConstructor
public class MailService {

    private final JavaMailSender javaMailSender;
    private final RedisUtil redisUtil;
    private final String AUTH_PREFIX = "AUTH_CODE:";

    public void sendSimpleEmail(String to, String subject, String text) {
        SimpleMailMessage message = new SimpleMailMessage();

        String code = RandomModule.GenerateRandomStr(10,true);
        // 발신자 주소는 반드시 SES에서 인증(Verified)받은 이메일이어야 합니다.
        message.setFrom("xtkww97178@gmail.com");
        message.setTo(to);
        message.setSubject("[Nimda] 회원가입 인증번호 안내");
        message.setText("인증번호는 [" + code + "] 입니다. 5분 이내에 입력해 주세요.");

        redisUtil.setDataWithExpiration("AUTH_CODE:" + to, code, 300L);

        try {
            javaMailSender.send(message);
            log.info("메일 발송 성공: {}", to);
        } catch (Exception e) {
            log.error("메일 발송 실패: {}", e.getMessage());
            throw new RuntimeException("이메일 발송 중 오류가 발생했습니다.");
        }
    }

    // code는 사용자가 입력한 번호
    public boolean verifyCode(String email, String code) {
        String key = AUTH_PREFIX + email;
        String savedCode = redisUtil.getData(key);

        if (savedCode == null) {
            // 인증 시간이 만료되었거나 코드가 없는 경우
            return false;
        }

        if (savedCode.equals(code)) {
            // 인증 성공 시 Redis에서 삭제
            redisUtil.deleteData(key);
            return true;
        }

        return false;
    }
}