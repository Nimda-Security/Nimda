package com.nimda.cite.common.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaRedirectController {

    /**
     * SPA 라우팅을 위한 포워딩 컨트롤러.
     * 점(.)이 포함되지 않은 모든 경로(API 제외)를 index.html로 포워딩합니다.
     */
    @GetMapping(value = "{path:[^\\.]*}")
    public String redirect() {
        return "forward:/index.html";
    }
}
