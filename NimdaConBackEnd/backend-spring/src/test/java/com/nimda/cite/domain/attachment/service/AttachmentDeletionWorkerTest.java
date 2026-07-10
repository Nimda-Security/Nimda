package com.nimda.cite.domain.attachment.service;

import com.nimda.cite.domain.attachment.entity.AttachmentDeletionTask;
import com.nimda.cite.domain.attachment.repository.AttachmentDeletionTaskRepository;
import com.nimda.cite.domain.attachment.store.FileStore;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
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
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AttachmentDeletionWorkerTest {

    @Mock
    private AttachmentDeletionTaskRepository deletionTaskRepository;
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
                fileStore,
                transactionTemplate);
        doAnswer(invocation -> {
            @SuppressWarnings("unchecked")
            Consumer<TransactionStatus> action = invocation.getArgument(0);
            action.accept(transactionStatus);
            return null;
        }).when(transactionTemplate).executeWithoutResult(any());
    }

    @Test
    void successfulDeletionRemovesTheOutboxTask() {
        AttachmentDeletionTask task = task(11L, "users/7/active/attachments/audit.txt");
        when(deletionTaskRepository
                .findByAttemptCountLessThanAndNextAttemptAtLessThanEqualOrderByNextAttemptAtAscIdAsc(
                        anyInt(), any(LocalDateTime.class), any(Pageable.class)))
                .thenReturn(List.of(task));
        when(deletionTaskRepository.findById(11L)).thenReturn(Optional.of(task));

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
                .findByAttemptCountLessThanAndNextAttemptAtLessThanEqualOrderByNextAttemptAtAscIdAsc(
                        anyInt(), any(LocalDateTime.class), any(Pageable.class)))
                .thenReturn(List.of(task));
        when(deletionTaskRepository.findById(12L)).thenReturn(Optional.of(task));
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

    private AttachmentDeletionTask task(Long id, String key) {
        AttachmentDeletionTask task = AttachmentDeletionTask.create(key);
        ReflectionTestUtils.setField(task, "id", id);
        return task;
    }
}
