package com.nimda.cite.domain.attachment.repository;

import com.nimda.cite.domain.attachment.entity.Attachment;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface AttachmentRepository extends JpaRepository<Attachment, Long> {

    List<Attachment> findByBoardId(Long boardId);

    List<Attachment> findByBoardIdOrderByIdAsc(Long boardId);

    List<Attachment> findByUserId(Long userId);
    boolean existsByFilepath(String filepath);
    boolean existsByFilepathOrStoredFilename(String filepath, String storedFilename);

    List<Attachment> findByBoardIdAndCategoryId(Long boardId, Long categoryId);

    @Query("""
            SELECT a.id
            FROM Attachment a
            WHERE a.boardId IS NULL
              AND a.createdAt < :cutoff
              AND (:afterId IS NULL OR a.id > :afterId)
            ORDER BY a.id ASC
            """)
    List<Long> findOrphanIdsCreatedBeforeAfterId(
            @Param("cutoff") LocalDateTime cutoff,
            @Param("afterId") Long afterId,
            Pageable pageable);
    @Query("""
            SELECT a.id
            FROM Attachment a
            WHERE a.boardId IS NULL
              AND a.createdAt < :cutoff
            ORDER BY a.createdAt ASC, a.id ASC
            """)
    List<Long> findOrphanIdsCreatedBefore(
            @Param("cutoff") LocalDateTime cutoff,
            Pageable pageable);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT a FROM Attachment a WHERE a.id = :id")
    Optional<Attachment> findByIdForUpdate(@Param("id") Long id);
}
