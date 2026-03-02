package com.nimda.cite.common.s3;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.time.Duration;
import java.util.UUID;

@Service
@RequiredArgsConstructor
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
        // 1. 경로 결정
        String path = switch (type) {
            case "profile" -> s3Properties.getProfileImagePath();
            case "board" -> s3Properties.getBoardImagePath();
            case "file" -> s3Properties.getBoardFilePath();
            default -> "temp/";
        };

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