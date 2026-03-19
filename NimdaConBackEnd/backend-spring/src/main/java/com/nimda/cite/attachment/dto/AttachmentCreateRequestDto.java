package com.nimda.cite.attachment.dto;

import lombok.Builder;
import lombok.Getter;

/**
 * 첨부파일 생성(업로드) 요청용 DTO
 * - 클라이언트/서비스에서 저장에 필요한 필드만 포함
 * - 파일 자체는 MultipartFile로 별도 전달하는 경우가 많음
 */
@Getter
@Builder
public class AttachmentCreateRequestDto {

    private String originFilename;
    private String storedFilename;
    private String filepath;
    private String extension;
    private Long fileSize;
    private Long boardId;
    private Long categoryId;
    private Long userId;
}
