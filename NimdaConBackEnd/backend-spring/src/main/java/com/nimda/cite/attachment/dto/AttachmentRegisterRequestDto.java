package com.nimda.cite.attachment.dto;

import lombok.Getter;

/**
 * S3 Presigned 업로드 후 결과를 등록할 때 사용하는 요청 DTO.
 * - 파일 본문은 이미 S3에 있고, key/메타정보만 서버에 전달한다.
 */
@Getter
public class AttachmentRegisterRequestDto {

    /**
     * S3 객체 키 (예: boards/files/uuid_filename.png)
     */
    private String key;

    /**
     * 원본 파일명 (사용자에게 보여줄 이름)
     */
    private String originFilename;

    /**
     * 파일 크기 (바이트)
     */
    private Long fileSize;

    /**
     * 게시글 ID, 카테고리 ID
     */
    private Long boardId;
    private Long categoryId;
}

