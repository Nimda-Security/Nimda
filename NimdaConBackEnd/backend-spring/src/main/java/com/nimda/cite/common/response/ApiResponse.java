package com.nimda.cite.common.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

/**
 * cite API 공통 응답 포맷.
 * success + message 고정, data는 선택. 컨트롤러에서 ResponseEntity로 감싸서 반환.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private final boolean success;
    private final String message;
    private final T data;

    private ApiResponse(boolean success, String message, T data) {
        this.success = success;
        this.message = message;
        this.data = data;
    }

    /** boolean Getter는 getSuccess()로 해야 JSON 키가 "success"로 직렬화됨 (isSuccess 시 일부 설정에서 isSuccess로 나갈 수 있음) */
    public boolean getSuccess() {
        return success;
    }

    public String getMessage() {
        return message;
    }

    public T getData() {
        return data;
    }

    /** 성공만 (데이터 없음). 여러 필드를 보낼 때는 ok(Map.of("attachmentId", id, "fileName", name)) 사용 */
    public static <T> ApiResponse<T> ok() {
        return new ApiResponse<>(true, null, null);
    }

    /** 성공 + 데이터 (message 생략 가능). 복수 필드는 Map으로 전달 */
    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(true, null, data);
    }

    /** 성공 + 메시지 + 데이터 */
    public static <T> ApiResponse<T> ok(String message, T data) {
        return new ApiResponse<>(true, message, data);
    }

    /** 성공 + 메시지만 */
    public static <T> ApiResponse<T> ok(String message) {
        return new ApiResponse<>(true, message, null);
    }

    /** 실패 (message 필수) */
    public static <T> ApiResponse<T> fail(String message) {
        return new ApiResponse<>(false, message, null);
    }

    /** ResponseEntity로 감싸서 반환 (status 지정) */
    public ResponseEntity<ApiResponse<T>> toResponse(HttpStatus status) {
        return ResponseEntity.status(status).body(this);
    }

    /** 200 OK */
    public ResponseEntity<ApiResponse<T>> toResponse() {
        return ResponseEntity.ok(this);
    }
}
