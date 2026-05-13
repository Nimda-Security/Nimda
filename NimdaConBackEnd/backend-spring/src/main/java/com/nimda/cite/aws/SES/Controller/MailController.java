package com.nimda.cite.aws.SES.Controller;

import com.nimda.cite.aws.SES.Service.MailService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/cite/mail")
public class MailController {

    private final MailService mailService;

    @GetMapping
    public String testMail(@RequestParam String email) {
        mailService.sendSimpleEmail(email, "Nimda 프로젝트 테스트 메일", "SES 연동이 성공했습니다!");
        return "발송 요청 완료! " + email + " 보관함을 확인하세요.";
    }
}