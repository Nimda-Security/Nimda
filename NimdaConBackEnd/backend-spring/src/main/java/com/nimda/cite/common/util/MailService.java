package com.nimda.cite.common.util;

import redis.util.RedisUtil;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;


@Slf4j
@Service
@RequiredArgsConstructor
public class MailService {

    private final JavaMailSender javaMailSender;
    private final RedisUtil redisUtil;
    private final SpringTemplateEngine templateEngine;
    // 블랙 리스트 KEY 값
    private static final String LIMIT_KEY_PREFIX = "MAIL_LIMIT:";
    // 인증 코드 KEY 값
    private final String AUTH_PREFIX = "AUTH_CODE:";
    // 메일 인증 횟수 제한
    private static final int MAX_DAILY_LIMIT = 3;

    public void sendEmail(MimeMessage message) {
        try {
            javaMailSender.send(message);
            log.info("메일 전송이 완료되었습니다.");
        }catch(MailException e) {
            log.info("메일 전송 시 오류가 발생했습니다." + e);
        }
    }

    public void sendAuthCode(String email) {
        MimeMessage message = javaMailSender.createMimeMessage();
        checkAndIncreaseMailLimit(email);
        String code = RandomModule.GenerateRandomStr(10,true);
        // 발신자 주소는 반드시 SES에서 인증(Verified)받은 이메일이어야 합니다.
        try {
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom("nimda0410@gmail.com");
            helper.setTo(email);
            helper.setSubject("[Nimda] 비밀번호 재설정 인증번호 안내");

            // 인증 코드 변수로 넣기
            Context context = new Context();
            context.setVariable("authCode", code);

            // 3. templates/auth-mail.html 파일을 읽어와 HTML 문자열로 변환
            String htmlContent = templateEngine.process("password-change-mail", context);

            // 4. 메일 본문 설정 (두 번째 인자를 true로 해야 HTML로 렌더링됨)
            helper.setText(htmlContent, true);

            // 인증 코드 Redis에 저장
            redisUtil.setDataWithExpiration("AUTH_CODE:" + email, code, 300L);

            sendEmail(message);
        } catch (MessagingException e) {
            throw new RuntimeException("HTML 메일 생성 및 발송 실패", e);
        }
    }


    // 인증번호 유효성 판단
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

    private void checkAndIncreaseMailLimit(String email) {
        String limitKey = LIMIT_KEY_PREFIX + email;

        // 현재값 LIMIT_KEY_PREFIX + email을 키로 가지고 오기
        long currentCount = redisUtil.incrementAndSetTtl(limitKey);

        // 3회 제한 초과 시 비즈니스 로직을 바로 중단시킴 (블랙리스트 작동)
        if (currentCount > MAX_DAILY_LIMIT) {
            log.warn("메일 발송 제한 초과 차단(블랙리스트) -> 대상: {} (당일 요청 횟수: {}회)", email, currentCount);
            throw new IllegalArgumentException("하루에 요청할 수 있는 메일 발송 횟수(3회)를 초과했습니다.");
        }
    }
}