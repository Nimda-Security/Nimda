package com.nimda.cite.domain.attachment.store;

import com.nimda.cite.common.s3.AwsS3ConfiguredCondition;
import com.nimda.cite.common.s3.S3Service;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Conditional;
import org.springframework.context.annotation.Primary;
import org.springframework.core.io.Resource;
import software.amazon.awssdk.services.s3.S3Client;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.services.s3.model.*;
import software.amazon.awssdk.core.sync.RequestBody;


import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
@Primary
@Conditional(AwsS3ConfiguredCondition.class)
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

    @Override
    public String storeBytes(byte[] data, String storedName) {
        // S3 Presigned 방식에서는 서버가 직접 올리지 않으므로 키만 반환
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
    public S3Service.PresignedUpload getPresignedUpload(String type, String fileName, String contentType) {
        return s3Service.createPresignedUpload(type, fileName, contentType);
    }

    public S3Service.PresignedUpload getPresignedUpload(String type, String fileName) {
        return s3Service.createPresignedUpload(type, fileName);
    }

    /**
     * [CTF] 문제 압축파일을 challenges/{code}/{code}.zip 으로 올리고 S3 키를 돌려준다.
     * 압축을 풀지 않는 이유는 CTF 서버가 이 zip 하나를 받아서 쓰기 때문이다.
     */
    public String uploadChallengeArchive(String challengeCode, MultipartFile file) {
        String s3Key = challengeArchiveKey(challengeCode);

        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(s3Properties.getBucket())
                .key(s3Key)
                .contentType("application/zip")
                .build();

        try {
            s3Client.putObject(putObjectRequest,
                    RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
            log.debug("CTF 문제 압축파일 업로드 완료: {}", s3Key);
            return s3Key;
        } catch (Exception e) {
            log.error("CTF 문제 압축파일 업로드 실패: {}", s3Key, e);
            throw new RuntimeException("S3 업로드에 실패했습니다: " + s3Key, e);
        }
    }

    /** challenges/{code}/ 아래를 통째로 지운다. */
    public void deleteChallengeDirectory(String challengeCode) {
        String prefix = challengeBasePath() + challengeCode + "/";

        try {
            ListObjectsV2Request listRequest = ListObjectsV2Request.builder()
                    .bucket(s3Properties.getBucket())
                    .prefix(prefix)
                    .build();

            ListObjectsV2Response listResponse;
            do {
                listResponse = s3Client.listObjectsV2(listRequest);
                if (listResponse.contents().isEmpty()) {
                    break;
                }

                List<ObjectIdentifier> objectsToDelete = listResponse.contents().stream()
                        .map(s3Object -> ObjectIdentifier.builder().key(s3Object.key()).build())
                        .collect(Collectors.toList());

                s3Client.deleteObjects(DeleteObjectsRequest.builder()
                        .bucket(s3Properties.getBucket())
                        .delete(Delete.builder().objects(objectsToDelete).build())
                        .build());

                listRequest = listRequest.toBuilder()
                        .continuationToken(listResponse.nextContinuationToken())
                        .build();

            } while (listResponse.isTruncated());

            log.debug("CTF 문제 폴더 삭제 완료: {}", prefix);
        } catch (Exception e) {
            log.error("CTF 문제 폴더 삭제 실패: {}", prefix, e);
            throw new RuntimeException("S3 문제 파일 삭제에 실패했습니다.", e);
        }
    }

    /**
     * 문제 코드로 압축파일의 S3 키를 만든다.
     * 파일명을 클라이언트가 보낸 원본 대신 문제 코드로 고정해서, 파일명에 섞여 들어온
     * 경로 문자로 다른 위치에 쓰이는 것을 원천적으로 막는다.
     */
    public String challengeArchiveKey(String challengeCode) {
        return challengeBasePath() + challengeCode + "/" + challengeCode + ".zip";
    }

    private String challengeBasePath() {
        String basePath = s3Properties.getChallengePath();
        if (basePath == null || basePath.isBlank()) {
            basePath = "challenges/";
        }
        if (!basePath.endsWith("/")) {
            basePath += "/";
        }
        return basePath;
    }
}