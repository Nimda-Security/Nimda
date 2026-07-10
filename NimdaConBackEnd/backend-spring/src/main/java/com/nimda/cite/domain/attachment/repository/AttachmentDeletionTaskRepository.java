package com.nimda.cite.domain.attachment.repository;

import com.nimda.cite.domain.attachment.entity.AttachmentDeletionTask;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface AttachmentDeletionTaskRepository extends JpaRepository<AttachmentDeletionTask, Long> {

    List<AttachmentDeletionTask> findByAttemptCountLessThanAndNextAttemptAtLessThanEqualOrderByNextAttemptAtAscIdAsc(
            int maximumAttempts,
            LocalDateTime now,
            Pageable pageable
    );
}
