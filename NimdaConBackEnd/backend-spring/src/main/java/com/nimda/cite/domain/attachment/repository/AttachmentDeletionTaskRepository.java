package com.nimda.cite.domain.attachment.repository;

import com.nimda.cite.domain.attachment.entity.AttachmentDeletionTask;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Propagation;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface AttachmentDeletionTaskRepository extends JpaRepository<AttachmentDeletionTask, Long> {

    List<AttachmentDeletionTask> findByQuarantinedFalseAndAttemptCountLessThanAndNextAttemptAtLessThanEqualOrderByNextAttemptAtAscIdAsc(
            int maximumAttempts,
            LocalDateTime now,
            Pageable pageable
    );
    @Modifying
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @Query(value = """
            INSERT INTO attachment_deletion_tasks (
                storage_key, attempt_count, last_error, quarantined, next_attempt_at, created_at, updated_at
            ) VALUES (
                :storageKey, 0, :lastError, :quarantined, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
            ) AS incoming
            ON DUPLICATE KEY UPDATE
                quarantined = quarantined OR incoming.quarantined,
                last_error = CASE
                    WHEN incoming.quarantined THEN incoming.last_error
                    ELSE last_error
                END,
                updated_at = CURRENT_TIMESTAMP
            """, nativeQuery = true)
    void upsertByStorageKey(
            @Param("storageKey") String storageKey,
            @Param("quarantined") boolean quarantined,
            @Param("lastError") String lastError
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT task FROM AttachmentDeletionTask task WHERE task.id = :id")
    Optional<AttachmentDeletionTask> findByIdForUpdate(@Param("id") Long id);

}
