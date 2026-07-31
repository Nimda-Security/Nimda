package com.nimda.cite.common.util;

// 하루 메일 발송 횟수 제한 초과 시 발생 (MailService.checkAndIncreaseMailLimit)
public class MailLimitExceededException extends RuntimeException {
    public MailLimitExceededException(String message) {
        super(message);
    }
}
