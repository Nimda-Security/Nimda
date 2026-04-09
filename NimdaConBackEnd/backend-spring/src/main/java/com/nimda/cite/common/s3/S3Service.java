package com.nimda.cite.common.s3;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.time.Duration;
import java.util.Set;
import java.util.UUID;
@Service
@RequiredArgsConstructor
@ConditionalOnBean(S3Presigner.class)
public class S3Service {

    private final S3Presigner s3Presigner;
    private final S3Properties s3Properties;

    /**
     * 업로드용 Presigned URL + S3 키 동시 생성.
     * - 클라이언트는 url로 업로드하고, key는 나중에 등록 API에 전달한다.
     *
     * @param type "profile", "board", "file" 중 선택
     * @param fileName 원본 파일명
     */
    public PresignedUpload createPresignedUpload(String type, String fileName) {
        // 0. 확장자 화이트리스트 검증 (1차 방어선)
        if (!com.nimda.cite.attachment.service.AttachmentService.isAllowedExtension(extractExt(fileName))) {
            throw new IllegalArgumentException("허용되지 않는 파일 형식입니다: " + extractExt(fileName));
        }

        // 1. 경로 결정 (null이면 temp/)
        String path = switch (type) {
            case "profile" -> s3Properties.getProfileImagePath();
            case "board" -> s3Properties.getBoardImagePath();
            case "file" -> s3Properties.getBoardFilePath();
            default -> "temp/";
        };
        if (path == null || path.isBlank()) {
            path = "temp/";
        }
        if (!path.endsWith("/")) {
            path = path + "/";
        }

        // 2. S3 키(경로 + UUID 파일명) 생성
        String fileKey = path + UUID.randomUUID() + "_" + fileName;

        // 3. S3 업로드 요청 객체 생성
        PutObjectRequest objectRequest = PutObjectRequest.builder()
                .bucket(s3Properties.getBucket())
                .key(fileKey)
                .build();

        // 4. Presigned URL 요청 (유효시간 10분)
        PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                .signatureDuration(Duration.ofMinutes(10))
                .putObjectRequest(objectRequest)
                .build();

        // 5. 최종 URL + 키 반환
        String url = s3Presigner.presignPutObject(presignRequest).url().toString();
        return new PresignedUpload(fileKey, url);
    }

    /**
     * 하위 호환용: 기존처럼 URL만 필요할 때 사용.
     */
    public String createPresignedUrl(String type, String fileName) {
        return createPresignedUpload(type, fileName).getUrl();
    }

    private static String extractExt(String filename) {
        if (filename == null || !filename.contains(".")) return "";
        String ext = filename.substring(filename.lastIndexOf('.') + 1);
        return ext.isBlank() ? "" : ext.toLowerCase();
    }

    /**
     * 다운로드/보기용 Presigned GET URL 생성.
     * S3에 저장된 파일을 클라이언트가 직접 받을 때 사용.
     *
     * @param key S3 객체 키 (DB에 저장된 storedFilename/filepath)
     * @param expiryMinutes 유효 시간(분)
     */
    public String createPresignedGetUrl(String key, int expiryMinutes) {
        return createPresignedGetUrl(key, expiryMinutes, null);
    }

    /**
     * 다운로드/보기용 Presigned GET URL 생성 (Content-Disposition 오버라이드 가능).
     *
     * @param key S3 객체 키
     * @param expiryMinutes 유효 시간(분)
     * @param responseContentDisposition S3 응답에 포함할 Content-Disposition 값 (null이면 미지정)
     */
    public String createPresignedGetUrl(String key, int expiryMinutes, String responseContentDisposition) {
        if (key == null || key.isBlank()) {
            return null;
        }
        GetObjectRequest.Builder getBuilder = GetObjectRequest.builder()
                .bucket(s3Properties.getBucket())
                .key(key);
        if (responseContentDisposition != null && !responseContentDisposition.isBlank()) {
            getBuilder.responseContentDisposition(responseContentDisposition);
        }
        GetObjectRequest getRequest = getBuilder.build();
        GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                .signatureDuration(Duration.ofMinutes(expiryMinutes))
                .getObjectRequest(getRequest)
                .build();
        return s3Presigner.presignGetObject(presignRequest).url().toString();
    }

    /**
     * 업로드용 Presigned URL + S3 키를 함께 담는 DTO.
     */
    public static class PresignedUpload {
        private final String key;
        private final String url;

        public PresignedUpload(String key, String url) {
            this.key = key;
            this.url = url;
        }

        public String getKey() {
            return key;
        }

        public String getUrl() {
            return url;
        }
    }
}
