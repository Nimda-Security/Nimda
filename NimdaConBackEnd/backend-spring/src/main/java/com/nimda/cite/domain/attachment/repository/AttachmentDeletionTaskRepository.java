package com.nimda.cite.domain.attachment.repository;

import com.nimda.cite.domain.attachment.entity.AttachmentDeletionTask;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface AttachmentDeletionTaskRepository extends JpaRepository<AttachmentDeletionTask, Long> {

    List<AttachmentDeletionTask> findByQuarantinedFalseAndAttemptCountLessThanAndNextAttemptAtLessThanEqualOrderByNextAttemptAtAscIdAsc(
            int maximumAttempts,
            LocalDateTime now,
            Pageable pageable
    );

    Optional<AttachmentDeletionTask> findFirstByStorageKey(String storageKey);
}
