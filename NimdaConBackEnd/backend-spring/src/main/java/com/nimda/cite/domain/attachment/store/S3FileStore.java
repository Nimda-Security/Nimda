package com.nimda.cite.domain.attachment.store;

import com.nimda.cite.common.s3.AwsS3ConfiguredCondition;
import com.nimda.cite.common.s3.S3Service;
import com.nimda.cite.domain.attachment.service.AttachmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Conditional;
import org.springframework.context.annotation.Primary;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.core.sync.ResponseTransformer;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.HeadObjectRequest;
import software.amazon.awssdk.services.s3.model.Delete;
import software.amazon.awssdk.services.s3.model.DeleteObjectsRequest;
import software.amazon.awssdk.services.s3.model.ListObjectsV2Request;
import software.amazon.awssdk.services.s3.model.ListObjectsV2Response;
import software.amazon.awssdk.services.s3.model.ObjectIdentifier;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.Set;
import java.util.UUID;

@Component
@Primary
@Conditional(AwsS3ConfiguredCondition.class)
@RequiredArgsConstructor
public class S3FileStore implements FileStore {
    private static final long MAX_PRESIGNED_UPLOAD_SIZE = 10L * 1024 * 1024;
    private static final int MAX_ORIGINAL_FILENAME_LENGTH = 200;
    private static final int MAX_STORAGE_KEY_LENGTH = 512;
    private static final Set<String> ALLOWED_UPLOAD_PURPOSES =
            Set.of("board", "file", "profile", "profile-decoration");
    private static final Set<String> ATTACHMENT_UPLOAD_PURPOSES = Set.of("board", "file");
    private static final Set<String> ACTIVE_NAMESPACES =
            Set.of("attachments", "profile", "decorations");

    private final S3Client s3Client;
    private final S3Presigner s3Presigner;
    private final com.nimda.cite.common.s3.S3Properties s3Properties;

    @Override
    public String storeFile(MultipartFile file, String storedName) {
        String key = boardFileKey(storedName);
        PutObjectRequest request = putRequest(key);
        try {
            s3Client.putObject(request, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
            return key;
        } catch (IOException | RuntimeException e) {
            throw new RuntimeException("S3 파일 업로드에 실패했습니다.", e);
        }
    }

    public void storeFileAtKey(MultipartFile file, String key, Long userId) {
        validateDirectAttachmentKey(key, userId);
        try {
            s3Client.putObject(putRequest(key),
                    RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
        } catch (IOException | RuntimeException e) {
            throw new RuntimeException("S3 파일 업로드에 실패했습니다.", e);
        }
    }

    @Override
    public String storeBytes(byte[] data, String storedName) {
        String key = boardFileKey(storedName);
        try {
            s3Client.putObject(putRequest(key), RequestBody.fromBytes(data));
            return key;
        } catch (RuntimeException e) {
            throw new RuntimeException("S3 파일 업로드에 실패했습니다.", e);
        }
    }

    public void storeBytesAtKey(byte[] data, String key, Long userId) {
        validateDirectAttachmentKey(key, userId);
        try {
            s3Client.putObject(putRequest(key), RequestBody.fromBytes(data));
        } catch (RuntimeException e) {
            throw new RuntimeException("S3 파일 업로드에 실패했습니다.", e);
        }
    }

    /**
     * S3에서 실제 파일을 삭제합니다. 실패는 DB 삭제를 막도록 호출자에게 전파합니다.
     */
    @Override
    public void deleteFile(String storedFilename) {
        DeleteObjectRequest deleteRequest = DeleteObjectRequest.builder()
                .bucket(s3Properties.getBucket())
                .key(storedFilename)
                .build();
        s3Client.deleteObject(deleteRequest);
    }

    /**
     * S3는 외부 URL로 직접 접근하므로 Resource(파일 스트림)를 서버가 열 필요가 없습니다.
     */
    @Override
    public Optional<Resource> getResource(String storedFilename) {
        return Optional.empty();
    }

    /**
     * 인증된 사용자 전용 업로드 URL. 키는 서버가 소유자별 canonical prefix 아래 생성한다.
     */
    public S3Service.PresignedUpload getPresignedUpload(
            String type,
            String fileName,
            Long userId,
            long fileSize) {
        if (userId == null || userId <= 0) {
            throw new IllegalArgumentException("로그인이 필요합니다.");
        }
        if (!ALLOWED_UPLOAD_PURPOSES.contains(type)) {
            throw new IllegalArgumentException("허용되지 않는 업로드 목적입니다: " + type);
        }
        if (fileSize <= 0 || fileSize > MAX_PRESIGNED_UPLOAD_SIZE) {
            throw new IllegalArgumentException("파일 크기는 10 MiB 이하여야 합니다.");
        }

        String ext = extension(fileName);
        boolean allowed;
        if ("profile-decoration".equals(type)) {
            allowed = Set.of("png", "jpg", "jpeg").contains(ext);
        } else if ("profile".equals(type)) {
            allowed = Set.of("png", "jpg", "jpeg", "gif", "bmp").contains(ext);
        } else {
            allowed = AttachmentService.isAllowedExtension(ext);
        }
        if (!allowed) {
            throw new IllegalArgumentException("허용되지 않는 파일 형식입니다: " + ext);
        }

        String safeName = fileName == null ? "upload" : fileName
                .replace('\\', '_').replace('/', '_').replaceAll("[\\r\\n\\u0000]", "_");
        if (safeName.length() > MAX_ORIGINAL_FILENAME_LENGTH) {
            throw new IllegalArgumentException("파일 이름은 200자를 초과할 수 없습니다.");
        }
        String key = pendingPrefix(userId) + type + "/" + UUID.randomUUID() + "_" + safeName;
        PutObjectRequest objectRequest = unsignedPutRequest(key, fileSize);
        PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                .signatureDuration(Duration.ofMinutes(10))
                .putObjectRequest(objectRequest)
                .build();
        return new S3Service.PresignedUpload(
                key, s3Presigner.presignPutObject(presignRequest).url().toString());
    }

    public long validateRegisteredObject(String key, Long userId) {
        validatePurpose(key, userId, ATTACHMENT_UPLOAD_PURPOSES);
        return objectSize(key);
    }

    public long validateProfileImageObject(String key, Long userId) {
        validatePurpose(key, userId, Set.of("profile"));
        return objectSize(key);
    }
    public long validateProfileDecorationObject(String key, Long userId) {
        validatePurpose(key, userId, Set.of("profile-decoration"));
        return objectSize(key);
    }

    private long objectSize(String key) {
        return s3Client.headObject(HeadObjectRequest.builder()
                        .bucket(s3Properties.getBucket())
                        .key(key)
                        .build())
                .contentLength();
    }

    public byte[] readObject(String key, Long userId) {
        validateOwnedKey(key, userId);
        return s3Client.getObjectAsBytes(GetObjectRequest.builder()
                        .bucket(s3Properties.getBucket())
                        .key(key)
                        .build())
                .asByteArray();
    }


    public String activationKey(
            String pendingKey,
            String namespace,
            String extension,
            Long userId) {
        validateOwnedKey(pendingKey, userId);
        return allocateActiveKey(namespace, extension, userId);
    }

    public String allocateActiveKey(String namespace, String extension, Long userId) {
        if (userId == null || userId <= 0) {
            throw new IllegalArgumentException("로그인이 필요합니다.");
        }
        if (!ACTIVE_NAMESPACES.contains(namespace)) {
            throw new IllegalArgumentException("허용되지 않는 활성 파일 영역입니다.");
        }
        String normalizedExtension = extension.toLowerCase();
        if (!AttachmentService.isAllowedExtension(normalizedExtension)) {
            throw new IllegalArgumentException("허용되지 않는 활성 파일 확장자입니다.");
        }
        String generatedFilename =
                UUID.randomUUID() + "_upload." + normalizedExtension;
        String activeKey = activeKey(userId, namespace, generatedFilename);
        if (activeKey.length() > MAX_STORAGE_KEY_LENGTH) {
            throw new IllegalArgumentException("활성 파일 저장소 키가 너무 깁니다.");
        }
        validateOwnedKey(activeKey, userId);
        return activeKey;
    }

    public void replaceObject(String oldKey, String newKey, byte[] data, Long userId) {
        validateOwnedKey(oldKey, userId);
        validateOwnedKey(newKey, userId);
        s3Client.putObject(putRequest(newKey), RequestBody.fromBytes(data));
        if (!oldKey.equals(newKey)) {
            validateOwnedKey(oldKey, userId);
            s3Client.deleteObject(DeleteObjectRequest.builder()
                    .bucket(s3Properties.getBucket())
                    .key(oldKey)
                    .build());
        }
    }

    @Override
    public void uploadProblemFile(String problemCode, String relativePath, Path filePath) {
        String basePath = s3Properties.getProblemPath();
        if (basePath == null || basePath.isBlank()) basePath = "problems/";
        if (!basePath.endsWith("/")) basePath += "/";
        String key = basePath + problemCode + "/" + relativePath.replace("\\", "/");
        String contentType = determineContentType(filePath);
        PutObjectRequest request = PutObjectRequest.builder()
                .bucket(s3Properties.getBucket()).key(key).contentType(contentType).build();
        try {
            s3Client.putObject(request, RequestBody.fromFile(filePath));
        } catch (RuntimeException e) {
            throw new RuntimeException("S3 문제 파일 업로드에 실패했습니다: " + key, e);
        }
    }

    public byte[] getProblemHtml(String problemLocation) {
        String basePath = s3Properties.getProblemPath();
        if (basePath == null || basePath.isBlank()) basePath = "problems/";
        if (!basePath.endsWith("/")) basePath += "/";
        String key = basePath + problemLocation + "/problem.html";
        try {
            return s3Client.getObject(GetObjectRequest.builder()
                    .bucket(s3Properties.getBucket()).key(key).build(),
                    ResponseTransformer.toBytes()).asByteArray();
        } catch (RuntimeException e) {
            throw new RuntimeException("S3 문제 내용을 불러오는 데 실패했습니다: " + key, e);
        }
    }

    private String determineContentType(Path filePath) {
        String fileName = filePath.getFileName().toString().toLowerCase();
        if (fileName.endsWith(".html")) return "text/html; charset=utf-8";
        if (fileName.endsWith(".json")) return "application/json; charset=utf-8";
        if (fileName.endsWith(".in") || fileName.endsWith(".out") || fileName.endsWith(".txt")) return "text/plain; charset=utf-8";
        try {
            String probed = Files.probeContentType(filePath);
            return probed == null ? "application/octet-stream" : probed;
        } catch (Exception ignored) {
            return "application/octet-stream";
        }
    }

    public void deleteProblemDirectory(String problemLocation) {
        String basePath = s3Properties.getProblemPath();
        if (basePath == null || basePath.isBlank()) basePath = "problems/";
        if (!basePath.endsWith("/")) basePath += "/";
        String prefix = basePath + problemLocation + "/";
        try {
            ListObjectsV2Request request = ListObjectsV2Request.builder()
                    .bucket(s3Properties.getBucket()).prefix(prefix).build();
            ListObjectsV2Response page;
            do {
                page = s3Client.listObjectsV2(request);
                if (!page.contents().isEmpty()) {
                    List<ObjectIdentifier> keys = page.contents().stream()
                            .map(item -> ObjectIdentifier.builder().key(item.key()).build())
                            .collect(Collectors.toList());
                    s3Client.deleteObjects(DeleteObjectsRequest.builder()
                            .bucket(s3Properties.getBucket())
                            .delete(Delete.builder().objects(keys).build())
                            .build());
                }
                request = request.toBuilder().continuationToken(page.nextContinuationToken()).build();
            } while (page.isTruncated());
        } catch (RuntimeException e) {
            throw new RuntimeException("S3 문제 파일 삭제에 실패했습니다: " + prefix, e);
        }
    }

    private PutObjectRequest putRequest(String key) {
        return PutObjectRequest.builder()
                .bucket(s3Properties.getBucket())
                .key(key)
                .contentType(contentType(key))
                .build();
    }

    private PutObjectRequest unsignedPutRequest(String key, long contentLength) {
        return PutObjectRequest.builder()
                .bucket(s3Properties.getBucket())
                .key(key)
                .contentLength(contentLength)
                .build();
    }

    private String contentType(String key) {
        return switch (extension(key)) {
            case "jpg", "jpeg" -> "image/jpeg";
            case "png" -> "image/png";
            case "gif" -> "image/gif";
            case "webp" -> "image/webp";
            case "bmp" -> "image/bmp";
            case "svg" -> "image/svg+xml";
            case "pdf" -> "application/pdf";
            case "txt", "md" -> "text/plain";
            case "csv" -> "text/csv";
            case "zip" -> "application/zip";
            case "7z" -> "application/x-7z-compressed";
            case "rar" -> "application/vnd.rar";
            case "mp4" -> "video/mp4";
            case "avi" -> "video/x-msvideo";
            case "mov" -> "video/quicktime";
            case "mp3" -> "audio/mpeg";
            case "wav" -> "audio/wav";
            default -> "application/octet-stream";
        };
    }

    private void validateOwnedKey(String key, Long userId) {
        if (key == null || userId == null || userId <= 0) {
            throw new IllegalArgumentException("소유하지 않은 S3 key입니다.");
        }

        String remainder;
        boolean pending;
        if (key.startsWith(pendingPrefix(userId))) {
            remainder = key.substring(pendingPrefix(userId).length());
            pending = true;
        } else if (key.startsWith(userRoot(userId))) {
            remainder = key.substring(userRoot(userId).length());
            pending = false;
        } else {
            throw new IllegalArgumentException("소유하지 않은 S3 key입니다.");
        }

        if (remainder.isBlank() || remainder.contains("..")
                || remainder.indexOf('\r') >= 0 || remainder.indexOf('\n') >= 0
                || remainder.indexOf('\0') >= 0) {
            throw new IllegalArgumentException("소유하지 않은 S3 key입니다.");
        }

        String[] parts = remainder.split("/", -1);
        boolean validPending = pending
                && parts.length == 2
                && ALLOWED_UPLOAD_PURPOSES.contains(parts[0])
                && !parts[1].isBlank();
        boolean validActive = !pending
                && parts.length == 3
                && "active".equals(parts[0])
                && ACTIVE_NAMESPACES.contains(parts[1])
                && !parts[2].isBlank();
        boolean validLegacy = !pending
                && parts.length == 2
                && "attachments".equals(parts[0])
                && !parts[1].isBlank();
        if (!validPending && !validActive && !validLegacy) {
            throw new IllegalArgumentException("소유하지 않은 S3 key입니다.");
        }
    }
    private void validateDirectAttachmentKey(String key, Long userId) {
        validateOwnedKey(key, userId);
        String prefix = activeKey(userId, "attachments", "");
        if (!key.startsWith(prefix) || key.length() > MAX_STORAGE_KEY_LENGTH) {
            throw new IllegalArgumentException("허용되지 않는 직접 업로드 S3 key입니다.");
        }
        String filename = key.substring(prefix.length());
        int marker = filename.indexOf("_upload.");
        if (marker != 36 || marker + 8 >= filename.length()) {
            throw new IllegalArgumentException("허용되지 않는 직접 업로드 S3 key입니다.");
        }
        try {
            UUID.fromString(filename.substring(0, marker));
        } catch (IllegalArgumentException exception) {
            throw new IllegalArgumentException("허용되지 않는 직접 업로드 S3 key입니다.", exception);
        }
        String extension = filename.substring(marker + 8);
        if (!extension.equals(extension.toLowerCase())
                || !AttachmentService.isAllowedExtension(extension)) {
            throw new IllegalArgumentException("허용되지 않는 직접 업로드 S3 key입니다.");
        }
    }

    private void validatePurpose(String key, Long userId, Set<String> allowedPurposes) {
        validateOwnedKey(key, userId);
        if (!key.startsWith(pendingPrefix(userId))) {
            throw new IllegalArgumentException("업로드 목적이 일치하지 않는 S3 key입니다.");
        }
        String remainder = key.substring(pendingPrefix(userId).length());
        int slash = remainder.indexOf('/');
        if (slash <= 0 || !allowedPurposes.contains(remainder.substring(0, slash))) {
            throw new IllegalArgumentException("업로드 목적이 일치하지 않는 S3 key입니다.");
        }
    }

    private String boardFileKey(String storedName) {
        String basePath = s3Properties.getBoardFilePath();
        if (basePath == null || basePath.isBlank()) {
            basePath = "boards/";
        }
        return (basePath.endsWith("/") ? basePath : basePath + "/") + storedName;
    }

    private String userRoot(Long userId) {
        return "users/" + userId + "/";
    }

    private String pendingPrefix(Long userId) {
        return "pending/users/" + userId + "/";
    }

    private String activeKey(Long userId, String namespace, String filename) {
        return userRoot(userId) + "active/" + namespace + "/" + filename;
    }

    private String extension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
    }
}