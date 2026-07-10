package com.nimda.cite.domain.attachment.service;

import com.nimda.cite.domain.attachment.entity.Attachment;
import com.nimda.cite.domain.attachment.entity.AttachmentDeletionTask;
import com.nimda.cite.domain.attachment.repository.AttachmentDeletionTaskRepository;
import com.nimda.cite.domain.attachment.repository.AttachmentRepository;
import com.nimda.cite.domain.attachment.store.S3FileStore;
import com.nimda.cite.domain.board.repository.BoardRepository;
import com.nimda.cite.domain.board.repository.CategoryRepository;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anySet;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AttachmentServiceTest {

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
        Attachment attachment = attachment(
                10L, 7L, "users/7/active/attachments/file.txt");
        when(attachmentRepository.findAllById(anySet())).thenReturn(List.of(attachment));

        attachmentService.deleteUserFiles(7L, List.of(10L));

        ArgumentCaptor<AttachmentDeletionTask> taskCaptor =
                ArgumentCaptor.forClass(AttachmentDeletionTask.class);
        verify(deletionTaskRepository).save(taskCaptor.capture());
        assertEquals(
                "users/7/active/attachments/file.txt",
                taskCaptor.getValue().getStorageKey());
        verify(attachmentRepository).delete(attachment);
        verify(fileStore, never()).deleteFile(any());
    }

    @Test
    void legacyS3KeyDeletionNeverQueuesAnUntrustedPhysicalDelete() {
        Attachment attachment = attachment(10L, 7L, "boards/files/legacy.txt");
        when(attachmentRepository.findAllById(anySet())).thenReturn(List.of(attachment));

        attachmentService.deleteUserFiles(7L, List.of(10L));

        verify(deletionTaskRepository, never()).save(any());
        verify(attachmentRepository).delete(attachment);
        verify(fileStore, never()).deleteFile(any());
    }

    @Test
    void mixedOwnershipDeleteValidatesEverythingBeforeEnqueueing() {
        Attachment owned = attachment(10L, 7L, "users/7/attachments/board/owned.txt");
        Attachment foreign = attachment(11L, 8L, "users/8/attachments/board/foreign.txt");
        when(attachmentRepository.findAllById(anySet())).thenReturn(List.of(owned, foreign));

        assertThrows(
                RuntimeException.class,
                () -> attachmentService.deleteUserFiles(7L, List.of(10L, 11L)));

        verify(deletionTaskRepository, never()).save(any());
        verify(attachmentRepository, never()).delete(any());
        verify(fileStore, never()).deleteFile(any());
    }

    @Test
    void profileCleanupOnlyQueuesTheOwnersCanonicalActiveKey() {
        String validKey = "users/7/active/profile/audit.jpg";

        attachmentService.enqueueOwnedProfileImageDeletion("boards/foreign.jpg", 7L);
        attachmentService.enqueueOwnedProfileImageDeletion(
                "users/8/active/profile/foreign.jpg", 7L);
        attachmentService.enqueueOwnedProfileImageDeletion(
                "users/7/active/decorations/wrong-namespace.jpg", 7L);
        attachmentService.enqueueOwnedProfileImageDeletion(validKey, 7L);

        ArgumentCaptor<AttachmentDeletionTask> taskCaptor =
                ArgumentCaptor.forClass(AttachmentDeletionTask.class);
        verify(deletionTaskRepository).save(taskCaptor.capture());
        assertEquals(validKey, taskCaptor.getValue().getStorageKey());
    }

    @Test
    void decorationCleanupRejectsLegacyAndWrongNamespaceKeys() {
        String validKey = "users/9/active/decorations/audit.png";

        attachmentService.enqueueProfileDecorationDeletion("decorations/legacy.png");
        attachmentService.enqueueProfileDecorationDeletion(
                "users/9/active/profile/wrong-namespace.png");
        attachmentService.enqueueProfileDecorationDeletion(validKey);

        ArgumentCaptor<AttachmentDeletionTask> taskCaptor =
                ArgumentCaptor.forClass(AttachmentDeletionTask.class);
        verify(deletionTaskRepository).save(taskCaptor.capture());
        assertEquals(validKey, taskCaptor.getValue().getStorageKey());
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
}
