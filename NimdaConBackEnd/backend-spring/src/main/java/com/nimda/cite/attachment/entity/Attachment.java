package com.nimda.cite.attachment.entity;

import com.nimda.cup.common.entity.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 첨부파일 엔티티 (DB 매핑용)
 * - API 응답/요청은 DTO(AttachmentResponseDto, AttachmentCreateRequestDto) 사용
 */
@Entity
@Table(name = "attachments")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Attachment extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String originFilename; // 사용자가 올린 실제 파일명

    @Column(nullable = false)
    private String storedFilename; // 서버(S3)에 저장된 중복 없는 파일명

    @Column(nullable = false)
    private String filepath;       // AWS S3/Lightsail 전체 경로(URL)

    private String extension;     // 확장자 (jpg, pdf 등)
    private Long fileSize;        // 파일 크기

    private Long boardId;         // 게시글 연결
    private Long categoryId;      // 카테고리 연결
    private Long userId;          // 올린 사람 (소유권)

    @Builder(access = AccessLevel.PRIVATE)
    public Attachment(String originFilename, String storedFilename, String filepath,
                      String extension, Long fileSize, Long boardId, Long categoryId, Long userId) {
        this.originFilename = originFilename;
        this.storedFilename = storedFilename;
        this.filepath = filepath;
        this.extension = extension;
        this.fileSize = fileSize;
        this.boardId = boardId;
        this.categoryId = categoryId;
        this.userId = userId;
    }

    /** DTO 필드로 엔티티 생성 (저장 전 서비스에서 사용) */
    public static Attachment create(String originFilename, String storedFilename, String filepath,
                                    String extension, Long fileSize, Long boardId, Long categoryId, Long userId) {
        return Attachment.builder()
                .originFilename(originFilename)
                .storedFilename(storedFilename)
                .filepath(filepath)
                .extension(extension)
                .fileSize(fileSize)
                .boardId(boardId)
                .categoryId(categoryId)
                .userId(userId)
                .build();
    }
}
