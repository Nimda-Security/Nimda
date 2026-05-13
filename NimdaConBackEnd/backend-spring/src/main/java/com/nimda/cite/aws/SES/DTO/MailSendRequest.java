package com.nimda.cite.aws.SES.DTO;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class MailSendRequest {
    private String to;
}
