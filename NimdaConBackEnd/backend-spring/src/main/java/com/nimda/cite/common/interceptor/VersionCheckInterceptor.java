package com.nimda.cite.common.interceptor;

import com.nimda.cite.common.exception.error.VersionMismatchException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class VersionCheckInterceptor implements HandlerInterceptor {
    @Value("${app.version}")
    private String currentAppVersion;

    private static final String VERSION_HEADER = "X-App-Version";

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {

        // [CORS 방어] 브라우저가 본 요청 전에 미리 던져보는 OPTIONS 요청은 체크 없이 통과시킵니다.
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        // 4. 클라이언트가 헤더에 실어 보낸 버전을 낚아챕니다.
        String clientVersion = request.getHeader(VERSION_HEADER);

        // 헤더가 없거나 서버의 현재 깃 해시와 일치하지 않는 경우
        if (clientVersion == null || !clientVersion.equals(currentAppVersion)) {

            // 6. 조금 전에 우리가 힘겹게 만든 바로 그 커스텀 예외를 여기서 사정없이 던집니다!
            throw new VersionMismatchException("앱 버전이 일치하지 않습니다. 최신 버전으로 업데이트 해주세요.");
        }

        return true;
    }
}
