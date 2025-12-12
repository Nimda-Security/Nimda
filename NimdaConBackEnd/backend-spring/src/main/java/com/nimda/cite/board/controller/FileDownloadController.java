package com.nimda.cite.board.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

/**
 * ========================================
 * FileDownloadController.java
 * ========================================
 * 
 * 게시판 첨부파일 다운로드 컨트롤러
 * 
 * [기능]
 * - GET /api/download/{fileName} : 파일 다운로드
 * 
 * [보안]
 * - Path Traversal 공격 방지 (../ 등)
 * - 파일 존재 여부 확인
 * - 업로드 디렉토리 외부 접근 차단
 * 
 * [파일 경로]
 * - 업로드 디렉토리: ~/board-uploads (user.home + "/board-uploads")
 * - 파일명 형식: {uuid}_{originalFilename}
 * ========================================
 */

@RestController
@RequestMapping("/api/download")
@CrossOrigin(origins = "*")
public class FileDownloadController {

    private static final Logger logger = LoggerFactory.getLogger(FileDownloadController.class);
    
    // 업로드 디렉토리 경로 (BoardService와 동일)
    private static final String UPLOAD_DIR = System.getProperty("user.home") + "/board-uploads";

    /**
     * 파일 다운로드 API
     * 
     * @param fileName 다운로드할 파일명 (UUID_원본파일명 형식)
     * @return 파일 리소스 또는 에러 응답
     */
    @GetMapping("/{fileName:.+}")
    public ResponseEntity<?> downloadFile(@PathVariable("fileName") String fileName) {
        try {
            logger.info("파일 다운로드 요청: {}", fileName);
            logger.debug("업로드 디렉토리: {}", UPLOAD_DIR);
            
            // ========== [보안 검증 #1] ==========
            // Path Traversal 공격 방지: 상대 경로(../)나 절대 경로(/) 포함 여부 확인
            // 단, 파일명에는 언더스코어(_)가 포함될 수 있으므로 제외
            if (fileName.contains("..") || fileName.startsWith("/") || fileName.startsWith("\\")) {
                logger.warn("Path Traversal 시도 감지: {}", fileName);
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "잘못된 파일명입니다.");
                
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }

            // ========== [파일 경로 구성] ==========
            // 업로드 디렉토리와 파일명을 결합하여 전체 경로 생성
            Path filePath = Paths.get(UPLOAD_DIR, fileName).normalize();
            File file = filePath.toFile();

            // ========== [보안 검증 #2] ==========
            // 실제 파일 경로가 업로드 디렉토리 내에 있는지 확인 (경로 탈출 방지)
            Path uploadDirPath = Paths.get(UPLOAD_DIR).normalize();
            if (!filePath.startsWith(uploadDirPath)) {
                logger.warn("업로드 디렉토리 외부 접근 시도: {}", filePath);
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "잘못된 파일 경로입니다.");
                
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
            }

            // ========== [파일 존재 확인] ==========
            if (!file.exists() || !file.isFile()) {
                logger.warn("파일을 찾을 수 없음: {}", filePath);
                logger.warn("파일 존재 여부: exists={}, isFile={}", file.exists(), file.isFile());
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "파일을 찾을 수 없습니다.");
                errorResponse.put("filePath", filePath.toString());
                
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
            }

            // ========== [파일 읽기 권한 확인] ==========
            if (!file.canRead()) {
                logger.warn("파일 읽기 권한 없음: {}", filePath);
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "파일에 접근할 권한이 없습니다.");
                
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
            }

            // ========== [파일 리소스 생성] ==========
            Resource resource = new FileSystemResource(file);

            // ========== [Content-Type 결정] ==========
            // 파일 확장자에 따라 적절한 Content-Type 설정
            String contentType = determineContentType(fileName);

            // ========== [원본 파일명 추출] ==========
            // UUID_원본파일명 형식에서 원본 파일명 추출
            String originalFilename = extractOriginalFilename(fileName);

            // ========== [HTTP 헤더 설정] ==========
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(contentType));
            headers.setContentLength(file.length());
            
            // Content-Disposition 헤더: 브라우저에서 다운로드 시 파일명 설정
            String encodedFilename = URLEncoder.encode(originalFilename, StandardCharsets.UTF_8)
                    .replaceAll("\\+", "%20"); // 공백 처리
            headers.setContentDispositionFormData("attachment", originalFilename);
            headers.add("Content-Disposition", "attachment; filename*=UTF-8''" + encodedFilename);

            logger.info("파일 다운로드 성공: {} ({})", fileName, file.length());

            // ========== [파일 반환] ==========
            return ResponseEntity.ok()
                    .headers(headers)
                    .body(resource);

        } catch (Exception e) {
            logger.error("파일 다운로드 중 오류 발생: {}", fileName, e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "파일 다운로드 중 오류가 발생했습니다: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * 파일 확장자에 따라 Content-Type 결정
     * 
     * @param fileName 파일명
     * @return Content-Type
     */
    private String determineContentType(String fileName) {
        String lowerFileName = fileName.toLowerCase();
        
        if (lowerFileName.endsWith(".pdf")) {
            return "application/pdf";
        } else if (lowerFileName.endsWith(".jpg") || lowerFileName.endsWith(".jpeg")) {
            return "image/jpeg";
        } else if (lowerFileName.endsWith(".png")) {
            return "image/png";
        } else if (lowerFileName.endsWith(".gif")) {
            return "image/gif";
        } else if (lowerFileName.endsWith(".txt")) {
            return "text/plain; charset=UTF-8";
        } else if (lowerFileName.endsWith(".zip")) {
            return "application/zip";
        } else if (lowerFileName.endsWith(".doc") || lowerFileName.endsWith(".docx")) {
            return "application/msword";
        } else if (lowerFileName.endsWith(".xls") || lowerFileName.endsWith(".xlsx")) {
            return "application/vnd.ms-excel";
        } else if (lowerFileName.endsWith(".ppt") || lowerFileName.endsWith(".pptx")) {
            return "application/vnd.ms-powerpoint";
        } else {
            // 기본값: 바이너리 파일
            return "application/octet-stream";
        }
    }

    /**
     * UUID_원본파일명 형식에서 원본 파일명 추출
     * 
     * @param fileName 저장된 파일명 (UUID_원본파일명)
     * @return 원본 파일명
     */
    private String extractOriginalFilename(String fileName) {
        // UUID 형식: 8-4-4-4-12 자리 (총 36자) + 언더스코어 + 원본파일명
        // 예: 123e4567-e89b-12d3-a456-426614174000_원본파일명.pdf
        
        int underscoreIndex = fileName.indexOf("_");
        if (underscoreIndex > 0 && underscoreIndex < fileName.length() - 1) {
            // 언더스코어가 있고 그 뒤에 파일명이 있으면 원본 파일명 추출
            return fileName.substring(underscoreIndex + 1);
        }
        
        // 언더스코어가 없거나 형식이 맞지 않으면 전체 파일명 반환
        return fileName;
    }
}

