package com.nimda.cite.domain.attachment.service;

import com.nimda.cite.domain.attachment.entity.AttachmentDeletionTask;
import com.nimda.cite.domain.attachment.repository.AttachmentDeletionTaskRepository;
import com.nimda.cite.domain.attachment.repository.AttachmentRepository;
import com.nimda.cite.domain.attachment.store.FileStore;
import com.nimda.cite.domain.profiledecoration.repository.ProfileDecorationRepository;
import com.nimda.cite.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Pageable;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.function.Consumer;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AttachmentDeletionWorkerTest {

    @Mock
    private AttachmentDeletionTaskRepository deletionTaskRepository;
    @Mock
    private AttachmentRepository attachmentRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private ProfileDecorationRepository profileDecorationRepository;
    @Mock
    private AttachmentService attachmentService;
    @Mock
    private FileStore fileStore;
    @Mock
    private TransactionTemplate transactionTemplate;
    @Mock
    private TransactionStatus transactionStatus;

    private AttachmentDeletionWorker worker;

    @BeforeEach
    void setUp() {
        worker = new AttachmentDeletionWorker(
                deletionTaskRepository,
                attachmentRepository,
                userRepository,
                profileDecorationRepository,
                attachmentService,
                fileStore,
                transactionTemplate);
        doAnswer(invocation -> {
            @SuppressWarnings("unchecked")
            Consumer<TransactionStatus> action = invocation.getArgument(0);
            action.accept(transactionStatus);
            return null;
        }).when(transactionTemplate).executeWithoutResult(any());
        lenient().when(attachmentService.isSafeAutomaticDeletionKey(anyString())).thenReturn(true);
    }

    @Test
    void successfulDeletionRemovesTheOutboxTask() {
        AttachmentDeletionTask task = task(11L, "users/7/active/attachments/audit.txt");
        when(deletionTaskRepository
                .findByQuarantinedFalseAndAttemptCountLessThanAndNextAttemptAtLessThanEqualOrderByNextAttemptAtAscIdAsc(
                        anyInt(), any(LocalDateTime.class), any(Pageable.class)))
                .thenReturn(List.of(task));
        when(deletionTaskRepository.findByIdForUpdate(11L)).thenReturn(Optional.of(task));

        worker.processPendingDeletions();

        verify(fileStore).deleteFile(task.getStorageKey());
        verify(deletionTaskRepository).delete(task);
        assertEquals(0, task.getAttemptCount());
    }

    @Test
    void storageFailureRetainsTaskWithBoundedRetryState() {
        AttachmentDeletionTask task = task(12L, "users/7/active/attachments/audit.txt");
        LocalDateTime beforeRun = LocalDateTime.now();
        when(deletionTaskRepository
                .findByQuarantinedFalseAndAttemptCountLessThanAndNextAttemptAtLessThanEqualOrderByNextAttemptAtAscIdAsc(
                        anyInt(), any(LocalDateTime.class), any(Pageable.class)))
                .thenReturn(List.of(task));
        when(deletionTaskRepository.findByIdForUpdate(12L)).thenReturn(Optional.of(task));
        doThrow(new IllegalStateException("storage unavailable\r\nretry later"))
                .when(fileStore).deleteFile(task.getStorageKey());

        worker.processPendingDeletions();

        verify(deletionTaskRepository, never()).delete(task);
        assertEquals(1, task.getAttemptCount());
        assertTrue(task.getNextAttemptAt().isAfter(beforeRun));
        assertTrue(task.getLastError().contains("IllegalStateException: storage unavailable"));
        assertFalse(task.getLastError().contains("\r"));
        assertFalse(task.getLastError().contains("\n"));
    }

    @Test
    void quarantinedTaskNeverCallsStorageEvenIfReturnedByTheRepository() {
        AttachmentDeletionTask task = AttachmentDeletionTask.quarantine(
                "boards/files/legacy.txt",
                "manual ownership verification required");
        ReflectionTestUtils.setField(task, "id", 13L);
        when(deletionTaskRepository
                .findByQuarantinedFalseAndAttemptCountLessThanAndNextAttemptAtLessThanEqualOrderByNextAttemptAtAscIdAsc(
                        anyInt(), any(LocalDateTime.class), any(Pageable.class)))
                .thenReturn(List.of(task));
        when(deletionTaskRepository.findByIdForUpdate(13L)).thenReturn(Optional.of(task));

        worker.processPendingDeletions();

        verify(fileStore, never()).deleteFile(any());
        verify(deletionTaskRepository, never()).delete(task);
        assertTrue(task.isQuarantined());
    }

    @Test
    void referencedStorageKeyIsQuarantinedInsteadOfDeleted() {
        AttachmentDeletionTask task = task(14L, "users/7/active/attachments/audit.txt");
        when(deletionTaskRepository
                .findByQuarantinedFalseAndAttemptCountLessThanAndNextAttemptAtLessThanEqualOrderByNextAttemptAtAscIdAsc(
                        anyInt(), any(LocalDateTime.class), any(Pageable.class)))
                .thenReturn(List.of(task));
        when(deletionTaskRepository.findByIdForUpdate(14L)).thenReturn(Optional.of(task));
        when(userRepository.existsByProfileImage(task.getStorageKey())).thenReturn(true);

        worker.processPendingDeletions();

        assertTrue(task.isQuarantined());
        verify(fileStore, never()).deleteFile(any());
        verify(deletionTaskRepository, never()).delete(task);
    }

    @Test
    void nonCanonicalTaskIsQuarantinedBeforeStorageDeletion() {
        AttachmentDeletionTask task =
                task(15L, "boards/files/legacy-live.txt");
        when(deletionTaskRepository
                .findByQuarantinedFalseAndAttemptCountLessThanAndNextAttemptAtLessThanEqualOrderByNextAttemptAtAscIdAsc(
                        anyInt(), any(LocalDateTime.class), any(Pageable.class)))
                .thenReturn(List.of(task));
        when(deletionTaskRepository.findByIdForUpdate(15L))
                .thenReturn(Optional.of(task));
        when(attachmentService.isSafeAutomaticDeletionKey(task.getStorageKey()))
                .thenReturn(false);

        worker.processPendingDeletions();

        assertTrue(task.isQuarantined());
        verify(fileStore, never()).deleteFile(any());
        verify(deletionTaskRepository, never()).delete(task);
    }
    @Test
    void orphanCleanupUsesClampedCutoffAndBoundedBatch() {
        ReflectionTestUtils.setField(worker, "orphanRetentionHours", -1L);
        ReflectionTestUtils.setField(worker, "orphanCleanupBatchSize", 100);
        LocalDateTime beforeRun = LocalDateTime.now();

        when(attachmentRepository.findOrphanIdsCreatedBeforeAfterId(
                any(LocalDateTime.class), any(), any(Pageable.class)))
                .thenReturn(List.of(21L, 22L));

        worker.processOrphanedAttachments();

        ArgumentCaptor<LocalDateTime> cutoffCaptor = ArgumentCaptor.forClass(LocalDateTime.class);
        ArgumentCaptor<Pageable> pageableCaptor = ArgumentCaptor.forClass(Pageable.class);
        verify(attachmentRepository).findOrphanIdsCreatedBeforeAfterId(
                cutoffCaptor.capture(), any(), pageableCaptor.capture());
        assertEquals(0, pageableCaptor.getValue().getPageNumber());
        assertEquals(50, pageableCaptor.getValue().getPageSize());
        assertTrue(cutoffCaptor.getValue().isAfter(beforeRun.minusHours(24).minusSeconds(1)));
        assertTrue(cutoffCaptor.getValue().isBefore(LocalDateTime.now().minusHours(24).plusSeconds(1)));
        verify(attachmentService).deleteOrphanedAttachment(21L, cutoffCaptor.getValue());
        verify(attachmentService).deleteOrphanedAttachment(22L, cutoffCaptor.getValue());
        verify(transactionTemplate, times(2)).executeWithoutResult(any());
    }

    @Test
    void orphanCleanupContinuesAfterCandidateCleanupFails() {
        when(attachmentRepository.findOrphanIdsCreatedBeforeAfterId(
                any(LocalDateTime.class), any(), any(Pageable.class)))
                .thenReturn(List.of(31L, 32L));
        doThrow(new IllegalStateException("locked row failed"))
                .when(attachmentService).deleteOrphanedAttachment(eq(31L), any(LocalDateTime.class));

        worker.processOrphanedAttachments();

        verify(attachmentService).deleteOrphanedAttachment(eq(31L), any(LocalDateTime.class));
        verify(attachmentService).deleteOrphanedAttachment(eq(32L), any(LocalDateTime.class));
    }

    private AttachmentDeletionTask task(Long id, String key) {
        AttachmentDeletionTask task = AttachmentDeletionTask.create(key);
        ReflectionTestUtils.setField(task, "id", id);
        return task;
    }
}
