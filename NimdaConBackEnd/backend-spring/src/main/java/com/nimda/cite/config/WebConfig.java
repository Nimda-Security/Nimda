package com.nimda.cup.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    // 프론트엔드는 Vercel에서 서빙하므로
    // static 파일 서빙 및 SPA 라우팅 설정이 필요 없습니다.
    // 백엔드는 순수 API 서버로만 동작합니다.
}
