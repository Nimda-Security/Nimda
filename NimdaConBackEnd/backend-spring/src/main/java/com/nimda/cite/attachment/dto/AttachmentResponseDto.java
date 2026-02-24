package com.nimda.cite.attachment.dto;

import com.nimda.cite.attachment.entity.Attachment;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * 첨부파일 API 응답용 DTO
 * - 엔티티에서 노출할 필드만 선별하여 클라이언트에 전달
 */
@Getter
@Builder
public class AttachmentResponseDto {

    private Long id;
    private String originFilename;
    private String storedFilename;
    private String filepath;
    private String extension;
    private Long fileSize;
    private Long boardId;
    private Long categoryId;
    private Long userId;
    private String disposition; // "inline" (바로보기) 또는 "attachment" (다운로드)
    /** 클라이언트용 다운로드 URL (id 기반, API 경로 변경해도 DB 수정 불필요) */
    private String downloadUrl;
    private LocalDateTime createdAt;

    public static AttachmentResponseDto from(Attachment entity) {
        return from(entity, "attachment");
    }

    /** 요청에 따라 disposition 지정. downloadUrl은 id 기반으로 조합. */
    public static AttachmentResponseDto from(Attachment entity, String disposition) {
        return AttachmentResponseDto.builder()
                .id(entity.getId())
                .originFilename(entity.getOriginFilename())
                .storedFilename(entity.getStoredFilename())
                .filepath(entity.getFilepath())
                .extension(entity.getExtension())
                .fileSize(entity.getFileSize())
                .boardId(entity.getBoardId())
                .categoryId(entity.getCategoryId())
                .userId(entity.getUserId())
                .disposition(disposition != null ? disposition : "attachment")
                .downloadUrl("/api/cite/attachments/" + entity.getId() + "/download")
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
