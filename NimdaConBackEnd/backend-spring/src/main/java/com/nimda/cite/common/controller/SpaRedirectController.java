package com.nimda.cite.common.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaRedirectController {

    /**
     * SPA 라우팅을 위한 포워딩 컨트롤러.
     * 모든 비-API 경로 중 점(.)이 포함되지 않은 요청을 index.html로 포워딩합니다.
     * 중첩 경로 (예: /board/free/1) 지원을 위해 여러 매핑을 사용합니다.
     */
    @GetMapping(value = {
        "/", 
        "/{path:[^\\.]*}", 
        "/{path:[^\\.]*}/**" // 중첩 경로 대응
    })
    public String redirect() {
        return "forward:/index.html";
    }
}
