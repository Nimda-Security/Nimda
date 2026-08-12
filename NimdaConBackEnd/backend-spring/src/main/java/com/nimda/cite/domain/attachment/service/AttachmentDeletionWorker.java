package com.nimda.cite.domain.attachment.service;

import com.nimda.cite.domain.attachment.entity.AttachmentDeletionTask;
import com.nimda.cite.domain.attachment.repository.AttachmentDeletionTaskRepository;
import com.nimda.cite.domain.attachment.repository.AttachmentRepository;
import com.nimda.cite.domain.attachment.store.FileStore;
import com.nimda.cite.domain.profiledecoration.repository.ProfileDecorationRepository;
import com.nimda.cite.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
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
    private static final int MAX_ORPHAN_CLEANUP_FAILURE_TYPE_LENGTH = 100;
    private static final long MAX_RETRY_DELAY_MINUTES = 60;
    private static final long MIN_ORPHAN_RETENTION_HOURS = 24;
    private static final long MAX_ORPHAN_RETENTION_HOURS = 8_760;
    private static final long MIN_ORPHAN_CLEANUP_DELAY_MS = 60_000;
    private static final long MAX_ORPHAN_CLEANUP_DELAY_MS = 86_400_000;
    private static final long MIN_ORPHAN_CLEANUP_INITIAL_DELAY_MS = 10_000;
    private static final String REFERENCED_STORAGE_KEY_QUARANTINE_REASON =
            "QUARANTINED: an active record still references this storage key";
    private static final String INVALID_STORAGE_KEY_QUARANTINE_REASON =
            "QUARANTINED: task storage key failed current canonical validation";

    private final AttachmentDeletionTaskRepository deletionTaskRepository;
    private final AttachmentRepository attachmentRepository;
    private final UserRepository userRepository;
    private final ProfileDecorationRepository profileDecorationRepository;
    private final AttachmentService attachmentService;
    private final FileStore fileStore;
    private final TransactionTemplate transactionTemplate;

    @Value("${attachments.orphan-cleanup.retention-hours:24}")
    private long orphanRetentionHours;

    @Value("${attachments.orphan-cleanup.batch-size:50}")
    private int orphanCleanupBatchSize;

    @Value("${attachments.orphan-cleanup.delay-ms:3600000}")
    private long orphanCleanupDelayMs;

    @Value("${attachments.orphan-cleanup.initial-delay-ms:60000}")
    private long orphanCleanupInitialDelayMs;
    private Long orphanCleanupCursorId;

    @Scheduled(
            fixedDelayString = "#{T(java.lang.Math).min(T(java.lang.Math).max(${attachments.deletion-worker.delay-ms:30000}, 60000), 86400000)}",
            initialDelayString = "#{T(java.lang.Math).min(T(java.lang.Math).max(${attachments.deletion-worker.initial-delay-ms:30000}, 10000), 86400000)}")
    public void processPendingDeletions() {
        List<Long> taskIds = deletionTaskRepository
                .findByQuarantinedFalseAndAttemptCountLessThanAndNextAttemptAtLessThanEqualOrderByNextAttemptAtAscIdAsc(
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
    @Scheduled(
            fixedDelayString = "#{T(java.lang.Math).min(T(java.lang.Math).max(${attachments.orphan-cleanup.delay-ms:3600000}, 60000), 86400000)}",
            initialDelayString = "#{T(java.lang.Math).min(T(java.lang.Math).max(${attachments.orphan-cleanup.initial-delay-ms:60000}, 10000), 86400000)}")
    public void processOrphanedAttachments() {
        LocalDateTime cutoff = LocalDateTime.now().minusHours(
                clamp(orphanRetentionHours, MIN_ORPHAN_RETENTION_HOURS, MAX_ORPHAN_RETENTION_HOURS));
        int batchSize = clamp(orphanCleanupBatchSize, 1, BATCH_SIZE);
        List<Long> attachmentIds = attachmentRepository.findOrphanIdsCreatedBeforeAfterId(
                cutoff, orphanCleanupCursorId, PageRequest.of(0, batchSize));

        if (attachmentIds.isEmpty()) {
            resetOrphanCleanupCursor();
            return;
        }

        orphanCleanupCursorId = attachmentIds.get(attachmentIds.size() - 1);
        boolean resetCursorAfterBatch = attachmentIds.size() < batchSize;

        for (Long attachmentId : attachmentIds) {
            try {
                transactionTemplate.executeWithoutResult(
                        status -> attachmentService.deleteOrphanedAttachment(attachmentId, cutoff));
            } catch (RuntimeException exception) {
                log.warn("Attachment orphan cleanup failed for attachment {}: {}",
                        attachmentId, safeFailureType(exception));
            }
        }

        if (resetCursorAfterBatch) {
            resetOrphanCleanupCursor();
        }
    }

    public long getOrphanCleanupDelayMs() {
        return clamp(
                orphanCleanupDelayMs, MIN_ORPHAN_CLEANUP_DELAY_MS, MAX_ORPHAN_CLEANUP_DELAY_MS);
    }

    public long getOrphanCleanupInitialDelayMs() {
        return clamp(
                orphanCleanupInitialDelayMs,
                MIN_ORPHAN_CLEANUP_INITIAL_DELAY_MS,
                MAX_ORPHAN_CLEANUP_DELAY_MS);
    }

    private long clamp(long value, long minimum, long maximum) {
        return Math.min(Math.max(value, minimum), maximum);
    }

    private int clamp(int value, int minimum, int maximum) {
        return Math.min(Math.max(value, minimum), maximum);
    }
    private void resetOrphanCleanupCursor() {
        orphanCleanupCursorId = null;
    }

    private String safeFailureType(RuntimeException exception) {
        String type = exception.getClass().getSimpleName();
        return type.length() <= MAX_ORPHAN_CLEANUP_FAILURE_TYPE_LENGTH
                ? type
                : type.substring(0, MAX_ORPHAN_CLEANUP_FAILURE_TYPE_LENGTH);
    }

    private void processTask(Long taskId) {
        try {
            transactionTemplate.executeWithoutResult(status -> deletionTaskRepository.findByIdForUpdate(taskId)
                    .ifPresent(task -> {
                        if (task.isQuarantined()
                                || task.getAttemptCount() >= MAX_ATTEMPTS
                                || task.getNextAttemptAt().isAfter(LocalDateTime.now())) {
                            return;
                        }
                        if (!attachmentService.isSafeAutomaticDeletionKey(task.getStorageKey())) {
                            task.markQuarantined(INVALID_STORAGE_KEY_QUARANTINE_REASON);
                            log.warn("Quarantined attachment deletion task {} because its storage key is not canonical",
                                    taskId);
                            return;
                        }
                        if (attachmentRepository.existsByFilepathOrStoredFilename(
                                task.getStorageKey(), task.getStorageKey())
                                || userRepository.existsByProfileImage(task.getStorageKey())
                                || profileDecorationRepository.existsByFilePath(task.getStorageKey())) {
                            task.markQuarantined(REFERENCED_STORAGE_KEY_QUARANTINE_REASON);
                            log.warn("Quarantined attachment deletion task {} because its storage key is referenced",
                                    taskId);
                            return;
                        }
                        try {
                            fileStore.deleteFile(task.getStorageKey());
                            deletionTaskRepository.delete(task);
                        } catch (RuntimeException exception) {
                            recordFailure(taskId, task, exception);
                        }
                    }));
        } catch (RuntimeException persistenceException) {
            log.error("Could not process attachment deletion task {}: {}",
                    taskId, safeError(persistenceException, MAX_LOG_ERROR_LENGTH));
        }
    }

    private void recordFailure(
            Long taskId,
            AttachmentDeletionTask task,
            RuntimeException exception) {
        if (task.isQuarantined() || task.getAttemptCount() >= MAX_ATTEMPTS) {
            return;
        }
        String error = safeError(exception, AttachmentDeletionTask.MAX_ERROR_LENGTH);
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
