package com.nimda.cite.common.s3;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;

import java.time.Duration;
@Service
@RequiredArgsConstructor
public class S3Service {

    private final S3Presigner s3Presigner;
    private final S3Properties s3Properties;


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
