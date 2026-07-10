package com.nimda.cite.domain.attachment.service;

import com.nimda.cite.domain.attachment.entity.Attachment;
import com.nimda.cite.domain.attachment.repository.AttachmentDeletionTaskRepository;
import com.nimda.cite.domain.attachment.repository.AttachmentRepository;
import com.nimda.cite.domain.attachment.store.S3FileStore;
import com.nimda.cite.domain.board.repository.BoardRepository;
import com.nimda.cite.domain.board.repository.CategoryRepository;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anySet;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verifyNoInteractions;

@ExtendWith(MockitoExtension.class)
class AttachmentServiceTest {

    private static final String GENERATION_PREFIX =
            "00000000-0000-0000-0000-000000000001_";

    @Mock
    private AttachmentRepository attachmentRepository;
    @Mock
    private AttachmentDeletionTaskRepository deletionTaskRepository;
    @Mock
    private S3FileStore fileStore;
    @Mock
    private BoardRepository boardRepository;
    @Mock
    private EntityManager entityManager;
    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private AttachmentService attachmentService;

    @Test
    void deletionCommitsMetadataAndDurableCleanupWithoutCallingStorageInline() {
        String storageKey = "users/7/active/attachments/" + GENERATION_PREFIX + "file.txt";
        Attachment attachment = attachment(10L, 7L, storageKey);
        when(attachmentRepository.findAllById(anySet())).thenReturn(List.of(attachment));

        attachmentService.deleteUserFiles(7L, List.of(10L));

        verify(deletionTaskRepository).upsertByStorageKey(storageKey, false, null);
        verify(attachmentRepository).delete(attachment);
        verify(fileStore, never()).deleteFile(any());
    }

    @Test
    void legacyS3KeyDeletionIsQuarantinedWithoutCallingStorage() {
        String legacyKey = "boards/files/legacy.txt";
        Attachment attachment = attachment(10L, 7L, legacyKey);
        when(attachmentRepository.findAllById(anySet())).thenReturn(List.of(attachment));

        attachmentService.deleteUserFiles(7L, List.of(10L));

        verify(deletionTaskRepository).upsertByStorageKey(
                eq(legacyKey), eq(true), contains("manual ownership verification"));
        verify(attachmentRepository).delete(attachment);
        verify(fileStore, never()).deleteFile(any());
    }

    @Test
    void overlengthStorageKeyStopsMetadataDeletionWithoutLosingIntent() {
        String overlengthKey = "x".repeat(513);
        Attachment attachment = attachment(12L, 7L, overlengthKey);
        when(attachmentRepository.findAllById(anySet())).thenReturn(List.of(attachment));

        assertThrows(
                IllegalStateException.class,
                () -> attachmentService.deleteUserFiles(7L, List.of(12L)));

        verify(deletionTaskRepository, never())
                .upsertByStorageKey(any(), anyBoolean(), any());
        verify(attachmentRepository, never()).delete(attachment);
    }

    @Test
    void mixedOwnershipDeleteValidatesEverythingBeforeEnqueueing() {
        Attachment owned = attachment(10L, 7L, "users/7/attachments/board/owned.txt");
        Attachment foreign = attachment(11L, 8L, "users/8/attachments/board/foreign.txt");
        when(attachmentRepository.findAllById(anySet())).thenReturn(List.of(owned, foreign));

        assertThrows(
                RuntimeException.class,
                () -> attachmentService.deleteUserFiles(7L, List.of(10L, 11L)));

        verify(deletionTaskRepository, never()).upsertByStorageKey(any(), anyBoolean(), any());
        verify(attachmentRepository, never()).delete(any());
        verify(fileStore, never()).deleteFile(any());
    }

    @Test
    void profileCleanupQueuesTheOwnersCanonicalActiveKey() {
        String validKey = "users/7/active/profile/" + GENERATION_PREFIX + "audit.jpg";

        attachmentService.enqueueOwnedProfileImageDeletion(validKey, 7L);

        verify(deletionTaskRepository).upsertByStorageKey(validKey, false, null);
    }

    @Test
    void foreignProfileCleanupIsQuarantined() {
        String foreignKey = "users/8/active/profile/" + GENERATION_PREFIX + "foreign.jpg";

        attachmentService.enqueueOwnedProfileImageDeletion(foreignKey, 7L);

        assertSingleQuarantinedTask(foreignKey);
    }

    @Test
    void directS3UploadUsesCanonicalGenerationAndCompensatesRollback() {
        String storageKey =
                "users/7/active/attachments/00000000-0000-0000-0000-000000000004_upload.txt";
        MockMultipartFile file = new MockMultipartFile(
                "file", "audit.txt", "text/plain", new byte[]{1, 2, 3});
        when(fileStore.allocateActiveKey("attachments", "txt", 7L)).thenReturn(storageKey);
        when(attachmentRepository.save(any(Attachment.class)))
                .thenAnswer(invocation -> {
                    Attachment saved = invocation.getArgument(0);
                    ReflectionTestUtils.setField(saved, "id", 33L);
                    return saved;
                });

        TransactionSynchronizationManager.initSynchronization();
        try {
            assertEquals(33L, attachmentService.uploadFile(file, null, 10L, 7L));

            verify(fileStore).storeFileAtKey(eq(file), eq(storageKey), eq(7L));

            List<TransactionSynchronization> synchronizations =
                    TransactionSynchronizationManager.getSynchronizations();
            assertEquals(1, synchronizations.size());
            synchronizations.get(0).afterCompletion(
                    TransactionSynchronization.STATUS_ROLLED_BACK);

            verify(fileStore).deleteFile(storageKey);
        } finally {
            TransactionSynchronizationManager.clearSynchronization();
        }
    }

    @Test
    void presignedPartialActivationRegistersCompensationBeforeStorageMove() {
        String pendingKey =
                "pending/users/7/board/00000000-0000-0000-0000-000000000001_audit.txt";
        String finalKey =
                "users/7/active/attachments/00000000-0000-0000-0000-000000000002_upload.txt";
        when(fileStore.validateRegisteredObject(pendingKey, 7L)).thenReturn(3L);
        when(fileStore.readObject(pendingKey, 7L)).thenReturn(new byte[]{1, 2, 3});
        when(fileStore.activationKey(pendingKey, "attachments", "txt", 7L))
                .thenReturn(finalKey);
        doThrow(new IllegalStateException("pending delete failed"))
                .when(fileStore)
                .replaceObject(eq(pendingKey), eq(finalKey), any(byte[].class), eq(7L));

        TransactionSynchronizationManager.initSynchronization();
        try {
            assertThrows(
                    IllegalStateException.class,
                    () -> attachmentService.registerFromS3(
                            pendingKey, "audit.txt", 3L, null, 10L, 7L));

            List<TransactionSynchronization> synchronizations =
                    TransactionSynchronizationManager.getSynchronizations();
            assertEquals(1, synchronizations.size());
            synchronizations.get(0).afterCompletion(
                    TransactionSynchronization.STATUS_ROLLED_BACK);

            verify(fileStore).deleteFile(finalKey);
        } finally {
            TransactionSynchronizationManager.clearSynchronization();
        }
    }

    @Test
    void failedRollbackDeletionCreatesADurableOutboxTask() {
        String storageKey =
                "users/7/active/attachments/00000000-0000-0000-0000-000000000003_upload.txt";
        MockMultipartFile file = new MockMultipartFile(
                "file", "audit.txt", "text/plain", new byte[]{1});
        when(fileStore.allocateActiveKey("attachments", "txt", 7L)).thenReturn(storageKey);
        when(attachmentRepository.save(any(Attachment.class)))
                .thenAnswer(invocation -> {
                    Attachment saved = invocation.getArgument(0);
                    ReflectionTestUtils.setField(saved, "id", 34L);
                    return saved;
                });
        doThrow(new IllegalStateException("storage unavailable"))
                .when(fileStore)
                .deleteFile(storageKey);

        TransactionSynchronizationManager.initSynchronization();
        try {
            assertEquals(34L, attachmentService.uploadFile(file, null, 10L, 7L));
            TransactionSynchronizationManager.getSynchronizations().get(0)
                    .afterCompletion(TransactionSynchronization.STATUS_ROLLED_BACK);

            verify(deletionTaskRepository).upsertByStorageKey(
                    eq(storageKey),
                    eq(false),
                    contains("Rollback compensation failed"));
        } finally {
            TransactionSynchronizationManager.clearSynchronization();
        }
    }

    @Test
    void directS3AmbiguousFailureHasCompensationRegisteredBeforePut() {
        String storageKey =
                "users/7/active/attachments/00000000-0000-0000-0000-000000000005_upload.txt";
        MockMultipartFile file = new MockMultipartFile(
                "file", "audit.txt", "text/plain", new byte[]{1});
        when(fileStore.allocateActiveKey("attachments", "txt", 7L)).thenReturn(storageKey);
        doThrow(new IllegalStateException("ambiguous S3 response"))
                .when(fileStore)
                .storeFileAtKey(eq(file), eq(storageKey), eq(7L));

        TransactionSynchronizationManager.initSynchronization();
        try {
            assertThrows(
                    IllegalStateException.class,
                    () -> attachmentService.uploadFile(file, null, 10L, 7L));
            List<TransactionSynchronization> synchronizations =
                    TransactionSynchronizationManager.getSynchronizations();
            assertEquals(1, synchronizations.size());

            synchronizations.get(0).afterCompletion(
                    TransactionSynchronization.STATUS_ROLLED_BACK);

            verify(fileStore).deleteFile(storageKey);
            verify(attachmentRepository, never()).save(any());
        } finally {
            TransactionSynchronizationManager.clearSynchronization();
        }
    }

    @Test
    void oversizedOriginalFilenameFailsBeforeStorageIsTouched() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "x".repeat(197) + ".txt",
                "text/plain",
                new byte[]{1});

        assertThrows(
                IllegalArgumentException.class,
                () -> attachmentService.uploadFile(file, null, 10L, 7L));

        verifyNoInteractions(fileStore);
    }

    @Test
    void decorationCleanupQueuesACanonicalDecorationKey() {
        String validKey = "users/9/active/decorations/" + GENERATION_PREFIX + "audit.png";

        attachmentService.enqueueProfileDecorationDeletion(validKey);

        verify(deletionTaskRepository).upsertByStorageKey(validKey, false, null);
    }

    @Test
    void legacyDecorationCleanupIsQuarantined() {
        String legacyKey = "decorations/legacy.png";

        attachmentService.enqueueProfileDecorationDeletion(legacyKey);

        assertSingleQuarantinedTask(legacyKey);
    }
    @Test
    void oldUnlinkedAttachmentIsLockedQueuedAndDeletedWithoutInlineStorageDeletion() {
        LocalDateTime cutoff = LocalDateTime.now().minusHours(24);
        String storageKey = "users/7/active/attachments/" + GENERATION_PREFIX + "orphan.txt";
        Attachment attachment = attachment(20L, 7L, storageKey);
        setTimestamps(attachment, cutoff.minusSeconds(1));
        when(attachmentRepository.findByIdForUpdate(20L)).thenReturn(Optional.of(attachment));

        assertTrue(attachmentService.deleteOrphanedAttachment(20L, cutoff));

        verify(attachmentRepository).findByIdForUpdate(20L);
        verify(deletionTaskRepository).upsertByStorageKey(storageKey, false, null);
        verify(attachmentRepository).delete(attachment);
        verify(fileStore, never()).deleteFile(any());
    }

    @Test
    void linkedAttachmentIsPreservedAfterLockedOrphanRecheck() {
        LocalDateTime cutoff = LocalDateTime.now().minusHours(24);
        Attachment attachment = attachment(21L, 7L, "users/7/active/attachments/linked.txt");
        attachment.linkToBoard(99L);
        setTimestamps(attachment, cutoff.minusSeconds(1));
        when(attachmentRepository.findByIdForUpdate(21L)).thenReturn(Optional.of(attachment));

        assertFalse(attachmentService.deleteOrphanedAttachment(21L, cutoff));

        verify(attachmentRepository).findByIdForUpdate(21L);
        verify(deletionTaskRepository, never()).upsertByStorageKey(any(), anyBoolean(), any());
        verify(attachmentRepository, never()).delete(any());
        verify(fileStore, never()).deleteFile(any());
    }

    @Test
    void freshUnlinkedAttachmentIsPreservedAfterLockedOrphanRecheck() {
        LocalDateTime cutoff = LocalDateTime.now().minusHours(24);
        Attachment attachment = attachment(22L, 7L, "users/7/active/attachments/fresh.txt");
        setTimestamps(attachment, cutoff.plusSeconds(1));
        when(attachmentRepository.findByIdForUpdate(22L)).thenReturn(Optional.of(attachment));

        assertFalse(attachmentService.deleteOrphanedAttachment(22L, cutoff));

        verify(attachmentRepository).findByIdForUpdate(22L);
        verify(deletionTaskRepository, never()).upsertByStorageKey(any(), anyBoolean(), any());
        verify(attachmentRepository, never()).delete(any());
        verify(fileStore, never()).deleteFile(any());
    }


    private void assertSingleQuarantinedTask(String expectedKey) {
        verify(deletionTaskRepository).upsertByStorageKey(
                eq(expectedKey), eq(true), contains("manual ownership verification"));
    }

    private Attachment attachment(Long id, Long userId, String key) {
        Attachment attachment = Attachment.create(
                "audit.txt",
                "audit.txt",
                key,
                "txt",
                5L,
                null,
                null,
                userId);
        ReflectionTestUtils.setField(attachment, "id", id);
        return attachment;
    }

    private void setTimestamps(Attachment attachment, LocalDateTime timestamp) {
        ReflectionTestUtils.setField(attachment, "createdAt", timestamp);
        ReflectionTestUtils.setField(attachment, "updatedAt", timestamp);
    }
}
