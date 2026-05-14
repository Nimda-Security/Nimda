package com.nimda.cite.aws.SES.Controller;

import com.nimda.cite.aws.SES.Service.MailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/cite/mail")
public class MailController {

    private final MailService mailService;

    @GetMapping
    public String registrationMail(@RequestParam String email) {
        mailService.sendEmail(email, "Nimda 회원가입 확인 메일");
        return "발송 요청 완료! " + email + " 보관함을 확인하세요.";
    }

    @PostMapping("/email-verification/verify")
    public ResponseEntity<?> verifyEmail(@RequestParam String email, @RequestParam String code) {
        boolean isVerified = mailService.verifyCode(email, code);

        if (isVerified) {
            return ResponseEntity.ok("이메일 인증에 성공했습니다.");
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("인증번호가 일치하지 않거나 만료되었습니다.");
        }
    }
}