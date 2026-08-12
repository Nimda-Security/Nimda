package com.nimda.cite.common.exception;

import com.nimda.cite.common.exception.error.VersionMismatchException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(VersionMismatchException.class)
    public ResponseEntity<Map<String, Object>> handleVersionMismatch(VersionMismatchException ex) {

        log.warn("Client version mismatch: {}", ex.getMessage());

        // [유저 응답 부품 만들기]
        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("error", "VERSION_MISMATCH");
        responseBody.put("message", ex.getMessage());

        // 상태 코드 출력
        return ResponseEntity
                .status(HttpStatus.UPGRADE_REQUIRED)
                .body(responseBody);
    }
}
