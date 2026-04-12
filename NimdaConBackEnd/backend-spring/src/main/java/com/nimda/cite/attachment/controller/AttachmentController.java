package com.nimda.cite.attachment.controller;

import com.nimda.cite.attachment.dto.AttachmentDeleteRequestDto;
import com.nimda.cite.attachment.dto.AttachmentRegisterRequestDto;
import com.nimda.cite.attachment.dto.AttachmentResponseDto;
import com.nimda.cite.attachment.entity.Attachment;
import com.nimda.cite.attachment.service.AttachmentService;
import com.nimda.cite.attachment.store.FileStore;
import com.nimda.cite.attachment.store.S3FileStore;
import com.nimda.cite.board.constants.CategoryConstants;
import com.nimda.cite.common.response.ApiResponse;
import com.nimda.cite.common.s3.S3Service;
import com.nimda.cup.user.security.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * 첨부파일 API
 * - POST /api/cite/attachments/upload : 업로드
 * - GET  /api/cite/attachments/{id} : 메타정보 조회
 * - GET  /api/cite/attachments/{id}/download : 파일 스트림 (원본명·disposition 반영)
 * - GET  /api/cite/attachments/my : 내 파일 목록
 * - DELETE /api/cite/attachments : 선택 삭제
 */
@RestController
@RequestMapping("/api/cite/attachments")
public class AttachmentController {

    private final AttachmentService attachmentService;
    private final FileStore fileStore;
    @Autowired(required = false)
    private S3Service s3Service;

    public AttachmentController(AttachmentService attachmentService,
                                FileStore fileStore) {
        this.attachmentService = attachmentService;
        this.fileStore = fileStore;
    }

    /**
     * 파일 업로드
     * - multipart file + boardId, categoryId (userId는 JWT에서)
     */
    @PostMapping("/upload")
    public ResponseEntity<?> upload(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam("file") MultipartFile file,
            @RequestParam("boardId") Long boardId,
            @RequestParam("categoryId") Long categoryId) {
        Long userId = userDetails != null ? userDetails.getUser().getId() : null;
        if (userId == null) {
            return ApiResponse.fail("로그인이 필요합니다.").toResponse(HttpStatus.UNAUTHORIZED);
        }
        try {
            Long attachmentId = attachmentService.uploadFile(file, boardId, categoryId, userId);
            return ApiResponse.ok("파일이 업로드되었습니다.", Map.of("attachmentId", attachmentId))
                    .toResponse(HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return ApiResponse.fail(e.getMessage()).toResponse(HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * 첨부파일 메타정보 조회 (filepath, disposition 등)
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getFile(@PathVariable Long id) {
        try {
            AttachmentResponseDto dto = attachmentService.getFile(id);
            return ApiResponse.ok(Map.of("attachment", dto)).toResponse();
        } catch (RuntimeException e) {
            return ApiResponse.fail(e.getMessage()).toResponse(HttpStatus.NOT_FOUND);
        }
    }

    /**
     * 파일 다운로드/미리보기 스트림 (원본 파일명·Content-Disposition 반영)
     */
    @GetMapping("/{id}/download")
    public ResponseEntity<?> download(
            @PathVariable Long id,
            @RequestParam(value = "disposition", required = false) String dispositionParam) {
        try {
            Attachment attachment = attachmentService.getAttachment(id);
            String disposition = dispositionParam != null && "inline".equalsIgnoreCase(dispositionParam)
                    ? "inline" : (attachment.getCategoryId() != null && CategoryConstants.GALLERY_ID.equals(attachment.getCategoryId()) ? "inline" : "attachment");

            // PDF는 브라우저 내 스크립트 실행 방지를 위해 항상 다운로드 강제
            if ("pdf".equalsIgnoreCase(attachment.getExtension())) {
                disposition = "attachment";
            }

            Optional<Resource> resourceOpt = fileStore.getResource(attachment.getStoredFilename());
            if (resourceOpt.isEmpty()) {
                // 로컬 리소스를 열 수 없고, S3Service가 존재하며 filepath(S3 key)가 있다면 Presigned GET URL로 리다이렉트
                if (s3Service != null && attachment.getFilepath() != null) {
                    String s3Disposition = "pdf".equalsIgnoreCase(attachment.getExtension())
                            ? "attachment" : null;
                    String presignedUrl = s3Service.createPresignedGetUrl(attachment.getFilepath(), 10, s3Disposition);
                    if (presignedUrl != null) {
                        HttpHeaders headers = new HttpHeaders();
                        headers.setLocation(URI.create(presignedUrl));
                        return new ResponseEntity<>(headers, HttpStatus.FOUND);
                    }
                }
                return ApiResponse.fail("파일을 찾을 수 없습니다.").toResponse(HttpStatus.NOT_FOUND);
            }
            Resource resource = resourceOpt.get();
            String contentType = getContentType(attachment.getExtension());
            String filename = attachment.getOriginFilename();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(contentType));
            headers.setContentLength(attachment.getFileSize() != null ? attachment.getFileSize() : 0);
            String encoded = URLEncoder.encode(filename != null ? filename : "download", StandardCharsets.UTF_8).replaceAll("\\+", "%20");
            headers.add(HttpHeaders.CONTENT_DISPOSITION, disposition + "; filename*=UTF-8''" + encoded);
            return ResponseEntity.ok().headers(headers).body(resource);
        } catch (RuntimeException e) {
            return ApiResponse.fail(e.getMessage()).toResponse(HttpStatus.NOT_FOUND);
        }
    }

    /**
     * S3 기반 다운로드 URL만 반환하는 API.
     * - S3 사용 시: Presigned GET URL 반환
     * - 로컬 사용 시: 기존 다운로드 엔드포인트 URL 반환
     */
    @GetMapping("/{id}/download-url")
    public ResponseEntity<?> getDownloadUrl(@PathVariable Long id) {
        Attachment attachment = attachmentService.getAttachment(id);

        // S3 사용 가능 && filepath(S3 key)가 있는 경우: Presigned GET URL 생성
        // PDF는 브라우저 내 스크립트 실행 방지를 위해 Content-Disposition: attachment 강제
        if (s3Service != null && attachment.getFilepath() != null) {
            String disposition = "pdf".equalsIgnoreCase(attachment.getExtension())
                    ? "attachment" : null;
            String url = s3Service.createPresignedGetUrl(attachment.getFilepath(), 10, disposition);
            if (url != null) {
                return ApiResponse.ok(Map.of("downloadUrl", url)).toResponse();
            }
        }

        // 그 외(로컬 등)는 기존 다운로드 엔드포인트를 URL로 내려준다.
        String apiUrl = "/api/cite/attachments/" + id + "/download";
        return ApiResponse.ok(Map.of("downloadUrl", apiUrl)).toResponse();
    }

    /**
     * 내 파일 목록 (JWT 필수)
     */
    @GetMapping("/my")
    public ResponseEntity<?> myFiles(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long userId = userDetails != null ? userDetails.getUser().getId() : null;
        if (userId == null) {
            return ApiResponse.fail("로그인이 필요합니다.").toResponse(HttpStatus.UNAUTHORIZED);
        }
        List<AttachmentResponseDto> list = attachmentService.getMyFileList(userId);
        return ApiResponse.ok(Map.of("attachments", list)).toResponse();
    }

    /**
     * 선택 삭제 (JWT 필수, 본인 파일만)
     */
    @DeleteMapping
    public ResponseEntity<?> delete(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody AttachmentDeleteRequestDto request) {
        Long userId = userDetails != null ? userDetails.getUser().getId() : null;
        if (userId == null) {
            return ApiResponse.fail("로그인이 필요합니다.").toResponse(HttpStatus.UNAUTHORIZED);
        }
        List<Long> fileIds = request != null ? request.getFileIds() : null;
        if (fileIds == null || fileIds.isEmpty()) {
            return ApiResponse.fail("fileIds가 필요합니다.").toResponse(HttpStatus.BAD_REQUEST);
        }
        try {
            attachmentService.deleteUserFiles(userId, fileIds);
            return ApiResponse.ok("선택한 파일이 삭제되었습니다.").toResponse();
        } catch (RuntimeException e) {
            return ApiResponse.fail(e.getMessage()).toResponse(HttpStatus.FORBIDDEN);
        }
    }

    /**
     * [S3] 업로드용 Presigned URL 발급 API.
     * - type: profile / board / file
     * - fileName: 원본 파일명
     */
    @PostMapping("/presigned")
    public ResponseEntity<?> createPresignedUpload(
            @RequestParam("type") String type,
            @RequestParam("fileName") String fileName) {

        if (!(fileStore instanceof S3FileStore s3FileStore)) {
            return ApiResponse.fail("파일 업로드 서비스를 사용할 수 없습니다.").toResponse(HttpStatus.SERVICE_UNAVAILABLE);
        }
        S3Service.PresignedUpload presigned = s3FileStore.getPresignedUpload(type, fileName);
        return ApiResponse.ok(Map.of(
                "uploadUrl", presigned.getUrl(),
                "key", presigned.getKey()
        )).toResponse();
    }

    /**
     * [S3] Presigned 업로드 후 결과 등록 API.
     * - 클라이언트는 S3에 업로드 완료 후 key/메타정보만 전달한다.
     */
    @PostMapping("/register")
    public ResponseEntity<?> registerFromS3(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody AttachmentRegisterRequestDto request) {
        Long userId = userDetails != null ? userDetails.getUser().getId() : null;
        if (userId == null) {
            return ApiResponse.fail("로그인이 필요합니다.").toResponse(HttpStatus.UNAUTHORIZED);
        }
        if (request == null || request.getKey() == null || request.getKey().isBlank()) {
            return ApiResponse.fail("S3 key가 필요합니다.").toResponse(HttpStatus.BAD_REQUEST);
        }

        Long attachmentId = attachmentService.registerFromS3(
                request.getKey(),
                request.getOriginFilename(),
                request.getFileSize(),
                request.getBoardId(),
                request.getCategoryId(),
                userId
        );

        return ApiResponse.ok(
                "파일이 등록되었습니다.",
                Map.of("attachmentId", attachmentId)
        ).toResponse(HttpStatus.CREATED);
    }

    private String getContentType(String ext) {
        if (ext == null) return "application/octet-stream";
        return switch (ext.toLowerCase()) {
            case "pdf" -> "application/pdf";
            case "jpg", "jpeg" -> "image/jpeg";
            case "png" -> "image/png";
            case "gif" -> "image/gif";
            case "txt" -> "text/plain; charset=UTF-8";
            case "zip" -> "application/zip";
            default -> "application/octet-stream";
        };
    }
}
