package com.nimda.cite.domain.attachment.store;

import com.nimda.cite.common.s3.S3Properties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
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
    void activationMovesPendingKeysIntoAStablePerUserNamespace() {
        String activeKey = fileStore.activationKey(
                "pending/users/7/board/fixture.gif", "attachments", "jpg", 7L);

        assertEquals("users/7/active/attachments/fixture.jpg", activeKey);
    }
}
