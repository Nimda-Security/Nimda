package com.nimda.cite.attachment.controller;

import com.nimda.cite.attachment.dto.AttachmentResponseDto;
import com.nimda.cite.attachment.entity.Attachment;
import com.nimda.cite.attachment.service.AttachmentService;
import com.nimda.cite.attachment.store.FileStore;
import com.nimda.cite.board.constants.CategoryConstants;
import com.nimda.cite.common.response.ApiResponse;
import com.nimda.cup.common.util.JwtUtil;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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
    private final JwtUtil jwtUtil;

    public AttachmentController(AttachmentService attachmentService,
                                FileStore fileStore,
                                JwtUtil jwtUtil) {
        this.attachmentService = attachmentService;
        this.fileStore = fileStore;
        this.jwtUtil = jwtUtil;
    }

    /**
     * 파일 업로드
     * - multipart file + boardId, categoryId (userId는 JWT에서)
     */
    @PostMapping("/upload")
    public ResponseEntity<?> upload(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestParam("file") MultipartFile file,
            @RequestParam("boardId") Long boardId,
            @RequestParam("categoryId") Long categoryId) {
        Long userId = resolveUserId(authHeader);
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

            Optional<Resource> resourceOpt = fileStore.getResource(attachment.getStoredFilename());
            if (resourceOpt.isEmpty()) {
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
     * 내 파일 목록 (JWT 필수)
     */
    @GetMapping("/my")
    public ResponseEntity<?> myFiles(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        Long userId = resolveUserId(authHeader);
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
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody Map<String, List<Long>> payload) {
        Long userId = resolveUserId(authHeader);
        if (userId == null) {
            return ApiResponse.fail("로그인이 필요합니다.").toResponse(HttpStatus.UNAUTHORIZED);
        }
        List<Long> fileIds = payload != null ? payload.get("fileIds") : null;
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

    private Long resolveUserId(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return null;
        }
        String token = authHeader.substring(7);
        if (jwtUtil.isTokenExpired(token)) {
            return null;
        }
        return jwtUtil.extractUserId(token);
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
