package com.nimda.cite.domain.attachment.store;

import com.nimda.cite.common.s3.S3Properties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.net.URI;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class S3FileStoreTest {

    @Mock
    private S3Client s3Client;
    @Mock
    private S3Presigner s3Presigner;

    private S3FileStore fileStore;

    @BeforeEach
    void setUp() {
        S3Properties properties = new S3Properties();
        properties.setBucket("test-bucket");
        fileStore = new S3FileStore(s3Client, s3Presigner, properties);
    }

    @Test
    void presignBindsUserPurposeAndExactContentLength() throws Exception {
        PresignedPutObjectRequest signed = mock(PresignedPutObjectRequest.class);
        when(signed.url()).thenReturn(URI.create("https://storage.example/upload").toURL());
        when(s3Presigner.presignPutObject(any(PutObjectPresignRequest.class))).thenReturn(signed);

        var result = fileStore.getPresignedUpload("board", "audit.txt", 7L, 123L);

        ArgumentCaptor<PutObjectPresignRequest> captor =
                ArgumentCaptor.forClass(PutObjectPresignRequest.class);
        verify(s3Presigner).presignPutObject(captor.capture());
        PutObjectRequest request = captor.getValue().putObjectRequest();
        assertEquals(123L, request.contentLength());
        assertTrue(request.key().startsWith("pending/users/7/board/"));
        assertEquals(request.key(), result.getKey());
    }

    @Test
    void presignRejectsOversizedAndUnknownPurposeRequests() {
        assertThrows(
                IllegalArgumentException.class,
                () -> fileStore.getPresignedUpload("board", "audit.txt", 7L, 10L * 1024 * 1024 + 1));
        assertThrows(
                IllegalArgumentException.class,
                () -> fileStore.getPresignedUpload("unknown", "audit.txt", 7L, 1L));
    }

    @Test
    void finalizationRejectsAProfileKeyAsAnAttachment() {
        assertThrows(
                IllegalArgumentException.class,
                () -> fileStore.validateRegisteredObject(
                        "pending/users/7/profile/fixture.png", 7L));
    }

    @Test
    void profileFinalizationRejectsAnotherUsersKeyAndBoardPurpose() {
        assertThrows(
                IllegalArgumentException.class,
                () -> fileStore.validateProfileImageObject(
                        "pending/users/8/profile/fixture.png", 7L));
        assertThrows(
                IllegalArgumentException.class,
                () -> fileStore.validateProfileImageObject(
                        "pending/users/7/board/fixture.png", 7L));
    }

    @Test
    void profileDecorationFlowRejectsWrongOwnerPurposeAndAnimatedImages() {
        assertThrows(
                IllegalArgumentException.class,
                () -> fileStore.validateProfileDecorationObject(
                        "pending/users/8/profile-decoration/fixture.png", 7L));
        assertThrows(
                IllegalArgumentException.class,
                () -> fileStore.validateProfileDecorationObject(
                        "pending/users/7/profile/fixture.png", 7L));
        assertThrows(
                IllegalArgumentException.class,
                () -> fileStore.getPresignedUpload(
                        "profile-decoration", "fixture.gif", 7L, 128L));
    }

    @Test
    void activationCreatesANewGenerationForEveryFinalization() {
        String pendingKey =
                "pending/users/7/board/00000000-0000-0000-0000-000000000001_fixture.gif";

        String firstActiveKey =
                fileStore.activationKey(pendingKey, "attachments", "jpg", 7L);
        String secondActiveKey =
                fileStore.activationKey(pendingKey, "attachments", "jpg", 7L);

        assertTrue(firstActiveKey.matches(
                "users/7/active/attachments/[0-9a-f-]{36}_upload\\.jpg"));
        assertTrue(secondActiveKey.matches(
                "users/7/active/attachments/[0-9a-f-]{36}_upload\\.jpg"));
        assertTrue(!firstActiveKey.equals(secondActiveKey));
    }

    @Test
    void presignRejectsAFileNameThatCannotFitTheStorageContract() {
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> fileStore.getPresignedUpload(
                        "board", "x".repeat(197) + ".txt", 7L, 128L));

        assertEquals("파일 이름은 200자를 초과할 수 없습니다.", exception.getMessage());
    }

    @Test
    void presignRejectsNonPositiveOwners() {
        assertThrows(
                IllegalArgumentException.class,
                () -> fileStore.getPresignedUpload(
                        "board", "audit.txt", 0L, 128L));
    }

    @Test
    void directUploadWritesOnlyToAPreallocatedCanonicalOwnedKey() {
        String key = fileStore.allocateActiveKey("attachments", "txt", 7L);

        fileStore.storeBytesAtKey(new byte[]{1, 2, 3}, key, 7L);

        ArgumentCaptor<PutObjectRequest> captor =
                ArgumentCaptor.forClass(PutObjectRequest.class);
        verify(s3Client).putObject(captor.capture(), any(RequestBody.class));
        assertEquals(key, captor.getValue().key());
        assertTrue(key.matches(
                "users/7/active/attachments/[0-9a-f-]{36}_upload\\.txt"));

        assertThrows(
                IllegalArgumentException.class,
                () -> fileStore.storeBytesAtKey(
                        new byte[]{1}, "users/7/active/attachments/legacy.txt", 7L));
        assertThrows(
                IllegalArgumentException.class,
                () -> fileStore.storeBytesAtKey(new byte[]{1}, key, 8L));
    }
}
