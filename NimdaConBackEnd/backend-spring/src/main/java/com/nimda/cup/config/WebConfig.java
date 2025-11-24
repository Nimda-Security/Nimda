package com.nimda.cup.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**") // API 경로에만 CORS 적용
                .allowedOrigins(
                        "http://localhost:3000", // 로컬 개발 (React/Next.js 기본 포트)
                        "http://localhost:5173", // 로컬 개발 (Vite 기본 포트)
                        "http://localhost:5174", // 로컬 개발 (Vite 대체 포트)
                        "https://*.vercel.app", // Vercel 배포 (모든 서브도메인)
                        "https://your-domain.com" // 실제 프로덕션 도메인으로 변경하세요
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true) // 인증 정보 (쿠키 등) 허용
                .maxAge(3600); // preflight 캐시 시간 (1시간)
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 정적 파일들 (CSS, JS, 이미지 등)을 먼저 처리
        registry.addResourceHandler("/assets/**")
                .addResourceLocations("classpath:/static/assets/");

        registry.addResourceHandler("/*.css", "/*.js", "/*.png", "/*.jpg", "/*.jpeg", "/*.gif", "/*.svg", "/*.ico")
                .addResourceLocations("classpath:/static/");

        // 나머지 모든 요청에 대해 SPA 라우팅 처리
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/")
                .resourceChain(true)
                .addResolver(new PathResourceResolver() {
                    @Override
                    protected Resource getResource(String resourcePath, Resource location) throws IOException {
                        Resource requestedResource = location.createRelative(resourcePath);

                        // API 요청이면 null 반환 (Spring Boot가 처리)
                        if (resourcePath.startsWith("api/")) {
                            return null;
                        }

                        // 파일이 존재하면 반환, 없으면 index.html 반환 (SPA 라우팅)
                        return requestedResource.exists() && requestedResource.isReadable()
                                ? requestedResource
                                : location.createRelative("index.html");
                    }
                });
    }

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        // 루트 경로와 모든 경로를 index.html로 리다이렉트 (SPA 라우팅)
        registry.addViewController("/").setViewName("forward:/index.html");
        registry.addViewController("/{path:\\w+}").setViewName("forward:/index.html");
        registry.addViewController("/{path:\\w+}/**{file:?!(\\.js|\\.css)$}").setViewName("forward:/index.html");
    }
}
