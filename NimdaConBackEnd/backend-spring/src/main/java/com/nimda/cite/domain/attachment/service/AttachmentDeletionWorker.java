package com.nimda.cite.domain.attachment.service;

import com.nimda.cite.domain.attachment.entity.AttachmentDeletionTask;
import com.nimda.cite.domain.attachment.repository.AttachmentDeletionTaskRepository;
import com.nimda.cite.domain.attachment.store.FileStore;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class AttachmentDeletionWorker {

    private static final int BATCH_SIZE = 50;
    private static final int MAX_ATTEMPTS = 10;
    private static final int MAX_LOG_ERROR_LENGTH = 500;
    private static final long MAX_RETRY_DELAY_MINUTES = 60;

    private final AttachmentDeletionTaskRepository deletionTaskRepository;
    private final FileStore fileStore;
    private final TransactionTemplate transactionTemplate;

    @Scheduled(fixedDelayString = "${attachments.deletion-worker.delay-ms:30000}",
            initialDelayString = "${attachments.deletion-worker.initial-delay-ms:30000}")
    public void processPendingDeletions() {
        List<Long> taskIds = deletionTaskRepository
                .findByAttemptCountLessThanAndNextAttemptAtLessThanEqualOrderByNextAttemptAtAscIdAsc(
                        MAX_ATTEMPTS,
                        LocalDateTime.now(),
                        PageRequest.of(0, BATCH_SIZE))
                .stream()
                .map(AttachmentDeletionTask::getId)
                .toList();

        for (Long taskId : taskIds) {
            processTask(taskId);
        }
    }

    private void processTask(Long taskId) {
        try {
            transactionTemplate.executeWithoutResult(status -> deletionTaskRepository.findById(taskId)
                    .ifPresent(task -> {
                        if (task.getAttemptCount() >= MAX_ATTEMPTS
                                || task.getNextAttemptAt().isAfter(LocalDateTime.now())) {
                            return;
                        }
                        fileStore.deleteFile(task.getStorageKey());
                        deletionTaskRepository.delete(task);
                    }));
        } catch (RuntimeException exception) {
            recordFailure(taskId, exception);
        }
    }

    private void recordFailure(Long taskId, RuntimeException exception) {
        String error = safeError(exception, AttachmentDeletionTask.MAX_ERROR_LENGTH);
        try {
            transactionTemplate.executeWithoutResult(status -> deletionTaskRepository.findById(taskId)
                    .ifPresent(task -> {
                        if (task.getAttemptCount() >= MAX_ATTEMPTS) {
                            return;
                        }
                        int nextAttemptNumber = task.getAttemptCount() + 1;
                        long delayMinutes = Math.min(
                                MAX_RETRY_DELAY_MINUTES,
                                1L << Math.min(task.getAttemptCount(), 6));
                        task.recordFailure(error, LocalDateTime.now().plusMinutes(delayMinutes));
                        if (nextAttemptNumber >= MAX_ATTEMPTS) {
                            log.warn("Attachment deletion task {} exhausted {} attempts: {}",
                                    taskId, MAX_ATTEMPTS, safeError(exception, MAX_LOG_ERROR_LENGTH));
                        } else {
                            log.warn("Attachment deletion task {} failed on attempt {}: {}",
                                    taskId, nextAttemptNumber, safeError(exception, MAX_LOG_ERROR_LENGTH));
                        }
                    }));
        } catch (RuntimeException persistenceException) {
            log.error("Could not retain failure state for attachment deletion task {}: {}",
                    taskId, safeError(persistenceException, MAX_LOG_ERROR_LENGTH));
        }
    }

    private String safeError(RuntimeException exception, int maximumLength) {
        String message = exception.getMessage();
        String detail = exception.getClass().getSimpleName()
                + (message == null || message.isBlank() ? "" : ": " + message)
                .replace('\r', ' ')
                .replace('\n', ' ');
        return detail.length() <= maximumLength ? detail : detail.substring(0, maximumLength);
    }
}
