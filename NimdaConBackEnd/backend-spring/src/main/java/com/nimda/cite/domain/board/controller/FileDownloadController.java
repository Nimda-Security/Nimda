package com.nimda.cite.domain.board.controller;

import com.nimda.cite.common.response.ApiResponse;
import com.nimda.cite.domain.board.entity.Board;
import com.nimda.cite.domain.board.entity.Category;
import com.nimda.cite.domain.board.enums.BoardStatus;
import com.nimda.cite.domain.board.repository.BoardRepository;
import com.nimda.cite.domain.board.repository.CategoryRepository;
import com.nimda.cite.user.security.CustomUserDetails;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.File;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Compatibility download route for legacy board rows that predate ID-based attachments.
 * Every request is resolved back to an ACTIVE board before the local file is opened.
 */
@RestController
@RequestMapping("/api/download")
public class FileDownloadController {

    private static final Logger log = LoggerFactory.getLogger(FileDownloadController.class);
    private static final Path UPLOAD_DIR = Paths.get(
            System.getProperty("user.home"), "board-uploads").toAbsolutePath().normalize();

    private final BoardRepository boardRepository;
    private final CategoryRepository categoryRepository;

    public FileDownloadController(
            BoardRepository boardRepository,
            CategoryRepository categoryRepository) {
        this.boardRepository = boardRepository;
        this.categoryRepository = categoryRepository;
    }

    @GetMapping("/{fileName:.+}")
    public ResponseEntity<?> downloadFile(
            @PathVariable("fileName") String fileName,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null || userDetails.getUser() == null) {
            return ApiResponse.fail("로그인이 필요합니다.").toResponse(HttpStatus.UNAUTHORIZED);
        }
        if (!isSafeLeafName(fileName)) {
            return ApiResponse.fail("잘못된 파일명입니다.").toResponse(HttpStatus.BAD_REQUEST);
        }

        Board board = boardRepository.findFirstByFilepathIn(List.of(
                        fileName,
                        "/api/download/" + fileName))
                .orElse(null);
        if (!canRead(board, userDetails)) {
            return ApiResponse.fail("파일을 찾을 수 없습니다.").toResponse(HttpStatus.NOT_FOUND);
        }

        try {
            Path filePath = UPLOAD_DIR.resolve(fileName).normalize();
            if (!filePath.startsWith(UPLOAD_DIR)) {
                return ApiResponse.fail("잘못된 파일 경로입니다.").toResponse(HttpStatus.BAD_REQUEST);
            }

            File file = filePath.toFile();
            if (!file.isFile() || !file.canRead()) {
                return ApiResponse.fail("파일을 찾을 수 없습니다.").toResponse(HttpStatus.NOT_FOUND);
            }

            Resource resource = new FileSystemResource(file);
            String encodedFilename = URLEncoder.encode(
                            extractOriginalFilename(fileName), StandardCharsets.UTF_8)
                    .replace("+", "%20");

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(determineContentType(fileName)));
            headers.setContentLength(file.length());
            headers.set(HttpHeaders.CONTENT_DISPOSITION,
                    "attachment; filename*=UTF-8''" + encodedFilename);
            headers.set("X-Content-Type-Options", "nosniff");
            headers.set("Content-Security-Policy", "sandbox");
            headers.setCacheControl("private, no-store");

            log.debug("Legacy file download completed for board {}", board.getId());
            return ResponseEntity.ok().headers(headers).body(resource);
        } catch (RuntimeException exception) {
            log.error("Legacy file download failed for board {}", board.getId(), exception);
            return ApiResponse.fail("파일 다운로드 중 오류가 발생했습니다.")
                    .toResponse(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private boolean canRead(Board board, CustomUserDetails userDetails) {
        if (board == null || board.getStatus() != BoardStatus.ACTIVE || board.getCategory() == null) {
            return false;
        }

        Category current = board.getCategory();
        Set<Long> visited = new HashSet<>();
        while (current != null && (current.getId() == null || visited.add(current.getId()))) {
            if ("cartel".equalsIgnoreCase(current.getSlug())) {
                return userDetails.getAuthorities().stream()
                        .anyMatch(authority -> "ROLE_CARTEL".equals(authority.getAuthority())
                                || "ROLE_ADMIN".equals(authority.getAuthority()));
            }
            current = current.getParentId() == null
                    ? null
                    : categoryRepository.findById(current.getParentId()).orElse(null);
        }
        return true;
    }

    private boolean isSafeLeafName(String fileName) {
        return fileName != null
                && !fileName.isBlank()
                && !fileName.contains("..")
                && !fileName.contains("/")
                && !fileName.contains("\\")
                && fileName.indexOf('\r') < 0
                && fileName.indexOf('\n') < 0
                && fileName.indexOf('\0') < 0;
    }

    private String determineContentType(String fileName) {
        String lowerFileName = fileName.toLowerCase();
        if (lowerFileName.endsWith(".pdf")) return "application/pdf";
        if (lowerFileName.endsWith(".jpg") || lowerFileName.endsWith(".jpeg")) return "image/jpeg";
        if (lowerFileName.endsWith(".png")) return "image/png";
        if (lowerFileName.endsWith(".gif")) return "image/gif";
        if (lowerFileName.endsWith(".txt")) return "text/plain; charset=UTF-8";
        if (lowerFileName.endsWith(".zip")) return "application/zip";
        if (lowerFileName.endsWith(".doc") || lowerFileName.endsWith(".docx")) {
            return "application/msword";
        }
        if (lowerFileName.endsWith(".xls") || lowerFileName.endsWith(".xlsx")) {
            return "application/vnd.ms-excel";
        }
        if (lowerFileName.endsWith(".ppt") || lowerFileName.endsWith(".pptx")) {
            return "application/vnd.ms-powerpoint";
        }
        return "application/octet-stream";
    }

    private String extractOriginalFilename(String fileName) {
        int underscoreIndex = fileName.indexOf('_');
        if (underscoreIndex > 0 && underscoreIndex < fileName.length() - 1) {
            return fileName.substring(underscoreIndex + 1);
        }
        return fileName;
    }
}
