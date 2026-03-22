package com.nimda.cite.attachment.store;

import com.nimda.cite.common.s3.S3Service;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.context.annotation.Primary;
import org.springframework.core.io.Resource;
import software.amazon.awssdk.services.s3.S3Client;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;

import java.util.Optional;

@Component
@Primary
@ConditionalOnBean(S3Client.class) // 자격 증명 없으면 S3 빈 미생성 → LocalFileStore만 사용
@RequiredArgsConstructor
public class S3FileStore implements FileStore {

    private static final Logger log = LoggerFactory.getLogger(S3FileStore.class);
    private final S3Service s3Service;
    private final S3Client s3Client; // 삭제 등 직접 제어용
    private final com.nimda.cite.common.s3.S3Properties s3Properties;

    /**
     * Presigned URL 방식에서는 이 메서드 대신 getPresignedUpload()를 주로 사용
     * 하지만 인터페이스 규격상 구현이 필요하다면, 서버를 거쳐 S3로 올리는 용도로 사용
     */
    @Override
    public String storeFile(MultipartFile file, String storedName) {
        // Presigned URL 방식이라면 이 단계는 클라이언트가 수행하므로 
        // 여기서는 저장된 '경로(Key)'만 반환하는 논리로 작성합니다.
        String basePath = s3Properties.getBoardFilePath();
        if (basePath == null || basePath.isBlank()) {
            basePath = "boards/";
        }
        if (!basePath.endsWith("/")) {
            basePath = basePath + "/";
        }
        return basePath + storedName;
    }

    /**
     * S3에서 실제 파일을 삭제합니다.
     */
    @Override
    public void deleteFile(String storedFilename) {
        try {
            DeleteObjectRequest deleteRequest = DeleteObjectRequest.builder()
                    .bucket(s3Properties.getBucket())
                    .key(storedFilename) // 예: boards/uuid_test.png
                    .build();
            s3Client.deleteObject(deleteRequest);
            log.debug("S3 파일 삭제 완료: {}", storedFilename);
        } catch (Exception e) {
            log.error("S3 파일 삭제 실패: {}", storedFilename, e);
        }
    }

    /**
     * S3는 외부 URL로 직접 접근하므로 Resource(파일 스트림)를 서버가 열 필요가 없습니다.
     */
    @Override
    public Optional<Resource> getResource(String storedFilename) {
        return Optional.empty();
    }

    /**
     * [S3 전용] 클라이언트가 직접 업로드할 수 있는 Presigned URL + 키를 생성합니다.
     */
    public S3Service.PresignedUpload getPresignedUpload(String type, String fileName) {
        return s3Service.createPresignedUpload(type, fileName);
    }
}