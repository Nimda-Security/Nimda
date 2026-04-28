package com.nimda.cite.domain.attachment.repository;

import com.nimda.cite.domain.attachment.entity.Attachment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AttachmentRepository extends JpaRepository<Attachment, Long> {

    List<Attachment> findByBoardId(Long boardId);

    List<Attachment> findByBoardIdOrderByIdAsc(Long boardId);

    List<Attachment> findByUserId(Long userId);

    List<Attachment> findByBoardIdAndCategoryId(Long boardId, Long categoryId);
}
