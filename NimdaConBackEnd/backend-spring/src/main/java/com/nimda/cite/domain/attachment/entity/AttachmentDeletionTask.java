package com.nimda.cite.domain.attachment.entity;

import com.nimda.cite.common.entity.BaseTimeEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "attachment_deletion_tasks",
        uniqueConstraints = @UniqueConstraint(name = "uk_attachment_deletion_tasks_storage_key", columnNames = "storage_key")
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class AttachmentDeletionTask extends BaseTimeEntity {

    public static final int MAX_ERROR_LENGTH = 1000;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Active deletion keys are immutable, generation-qualified UUID paths. A single key maps to
     * one outbox row so quarantine state cannot be bypassed by a later active enqueue.
     */
    @Column(name = "storage_key", nullable = false, length = 512)
    private String storageKey;

    @Column(name = "attempt_count", nullable = false)
    private int attemptCount;

    @Column(name = "last_error", length = MAX_ERROR_LENGTH)
    private String lastError;

    @Column(nullable = false)
    private boolean quarantined;

    @Column(name = "next_attempt_at", nullable = false)
    private LocalDateTime nextAttemptAt;
    private AttachmentDeletionTask(String storageKey) {
        this.storageKey = storageKey;
        this.attemptCount = 0;
        this.quarantined = false;
        this.nextAttemptAt = LocalDateTime.now();
    }

    public static AttachmentDeletionTask create(String storageKey) {
        if (storageKey == null || storageKey.isBlank()) {
            throw new IllegalArgumentException("Storage key is required for attachment deletion");
        }
        if (storageKey.length() > 512) {
            throw new IllegalArgumentException("Storage key is too long for attachment deletion");
        }
        return new AttachmentDeletionTask(storageKey);
    }

    public static AttachmentDeletionTask quarantine(String storageKey, String reason) {
        AttachmentDeletionTask task = create(storageKey);
        task.markQuarantined(reason);
        return task;
    }


    public void markQuarantined(String reason) {
        this.quarantined = true;
        this.lastError = truncate(reason);
    }

    public void recordFailure(String error, LocalDateTime nextAttemptAt) {
        this.attemptCount++;
        this.lastError = truncate(error);
        this.nextAttemptAt = nextAttemptAt;
    }

    private String truncate(String value) {
        if (value == null) {
            return null;
        }
        return value.length() <= MAX_ERROR_LENGTH ? value : value.substring(0, MAX_ERROR_LENGTH);
    }
}
