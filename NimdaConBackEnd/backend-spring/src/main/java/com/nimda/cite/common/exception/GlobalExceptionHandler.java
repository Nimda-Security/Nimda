package com.nimda.cite.common.exception;

import com.nimda.cite.common.exception.error.VersionMismatchException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(VersionMismatchException.class)
    public ResponseEntity<Map<String, Object>> handleVersionMismatch(VersionMismatchException ex) {

        log.warn("클라이언트 버전 불일치: {}", ex.getMessage());

        // [유저 응답 부품 만들기]
        Map<String, Object> responseBody = new HashMap<>();
        responseBody.clear();
        responseBody.put("error", "VERSION_MISMATCH");
        responseBody.put("message", ex.getMessage());

        // 상태 코드 출력
        return ResponseEntity
                .status(HttpStatus.UPGRADE_REQUIRED)
                .body(responseBody);
    }
}
