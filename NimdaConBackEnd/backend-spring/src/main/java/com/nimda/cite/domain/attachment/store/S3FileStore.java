package com.nimda.cite.domain.attachment.store;

import com.nimda.cite.common.s3.AwsS3ConfiguredCondition;
import com.nimda.cite.common.s3.S3Service;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Conditional;
import org.springframework.context.annotation.Primary;
import org.springframework.core.io.Resource;
import software.amazon.awssdk.core.sync.ResponseTransformer;
import software.amazon.awssdk.services.s3.S3Client;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.services.s3.model.*;
import software.amazon.awssdk.core.sync.RequestBody;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;

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
     * [백엔드 전용] 로컬에 위치한 파일을 S3로 직접 업로드합니다. (예: 압축 해제된 문제 파일)
     *
     * @param problemCode 문제 식별 코드
     * @param relativePath 문제 폴더 내부의 상대 경로 (예: "in/1.in")
     * @param filePath 실제 파일의 로컬 경로
     */
    @Override
    public void uploadProblemFile(String problemCode, String relativePath, Path filePath) {
        String basePath = s3Properties.getProblemPath();
        if (basePath == null || basePath.isBlank()) {
            basePath = "problems/";
        }
        if (!basePath.endsWith("/")) {
            basePath += "/";
        }

        // S3 Key 생성: problems/{problemCode}/{relativePath}
        String s3Key = basePath + problemCode + "/" + relativePath.replace("\\", "/");

        // Content-Type 결정
        String contentType = determineContentType(filePath);

        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(s3Properties.getBucket())
                .key(s3Key)
                .contentType(contentType)
                .build();

        try {
            // S3Client를 이용하여 직접 파일 업로드
            s3Client.putObject(putObjectRequest, RequestBody.fromFile(filePath));
            log.debug("S3 파일 업로드 완료: {}", s3Key);
        } catch (Exception e) {
            log.error("S3 파일 업로드 실패: {}", s3Key, e);
            throw new RuntimeException("S3 업로드에 실패했습니다: " + s3Key, e);
        }
    }

    public byte[] getProblemHtml(String s3Locate) {
        // 1. S3 기본 경로 설정 ("problems/")
        String basePath = s3Properties.getProblemPath();
        if (basePath == null || basePath.isBlank()) {
            basePath = "problems/";
        }
        if (!basePath.endsWith("/")) {
            basePath += "/";
        }

        // 2. S3 객체 키 생성 (예: problems/15/problem.html)
        String s3Key = basePath + s3Locate + "/problem.html";

        try {
            // 3. S3 객체 가져오기 요청 생성
            GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                    .bucket(s3Properties.getBucket())
                    .key(s3Key)
                    .build();

            return s3Client.getObject(getObjectRequest, ResponseTransformer.toBytes()).asByteArray();

        } catch (Exception e) {
            log.error("S3에서 problem.html 불러오기 실패: {}", s3Key, e);
            throw new RuntimeException("S3에서 문제 내용을 불러오는 데 실패했습니다: " + s3Key, e);
        }
    }

    private String determineContentType(Path filePath) {
        String fileName = filePath.getFileName().toString().toLowerCase();

        if (fileName.endsWith(".html")) {
            return "text/html; charset=utf-8";
        } else if (fileName.endsWith(".json")) {
            return "application/json; charset=utf-8";
        } else if (fileName.endsWith(".in") || fileName.endsWith(".out") || fileName.endsWith(".txt")) {
            return "text/plain; charset=utf-8";
        }

        try {
            String probedType = Files.probeContentType(filePath);
            return probedType != null ? probedType : "application/octet-stream";
        } catch (Exception e) {
            return "application/octet-stream";
        }
    }

    public void deleteProblemDirectory(String s3Locate) {
        // 1. 삭제할 S3 기본 경로 설정 ("problems/")
        String basePath = s3Properties.getProblemPath() != null ? s3Properties.getProblemPath() : "problems/";
        if (!basePath.endsWith("/")) {
            basePath += "/";
        }

        // 2. 삭제할 대상의 Prefix 설정 (예: "problems/15/")
        String prefix = basePath + s3Locate + "/";

        try {
            // 3. 해당 Prefix로 시작하는 파일 목록 가져오기 요청 생성
            ListObjectsV2Request listRequest = ListObjectsV2Request.builder()
                    .bucket(s3Properties.getBucket())
                    .prefix(prefix)
                    .build();

            ListObjectsV2Response listResponse;

            // 파일이 많을 경우 페이징 처리하여 모두 삭제
            do {
                listResponse = s3Client.listObjectsV2(listRequest);

                // 4. 지울 대상이 있는지 확인
                if (listResponse.contents().isEmpty()) {
                    break;
                }

                // 5. 삭제할 파일들의 Key 목록 만들기
                List<ObjectIdentifier> objectsToDelete = listResponse.contents().stream()
                        .map(s3Object -> ObjectIdentifier.builder().key(s3Object.key()).build())
                        .collect(Collectors.toList());

                // 6. 일괄 삭제(DeleteObjects) 요청 실행
                DeleteObjectsRequest deleteRequest = DeleteObjectsRequest.builder()
                        .bucket(s3Properties.getBucket())
                        .delete(Delete.builder().objects(objectsToDelete).build())
                        .build();

                s3Client.deleteObjects(deleteRequest);

                // 다음 페이지가 있으면 토큰 갱신
                listRequest = listRequest.toBuilder()
                        .continuationToken(listResponse.nextContinuationToken())
                        .build();

            } while (listResponse.isTruncated());

            log.debug("S3 문제 폴더 삭제 완료: {}", prefix);

        } catch (Exception e) {
            log.error("S3에서 문제 폴더 삭제 실패: {}", prefix, e);
            throw new RuntimeException("S3 문제 파일 삭제에 실패했습니다.", e);
        }
    }
}