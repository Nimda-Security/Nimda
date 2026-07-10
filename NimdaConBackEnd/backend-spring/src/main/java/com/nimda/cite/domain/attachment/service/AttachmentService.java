package com.nimda.cite.domain.attachment.service;

import com.nimda.cite.domain.attachment.dto.AttachmentResponseDto;
import com.nimda.cite.domain.attachment.entity.Attachment;
import com.nimda.cite.domain.attachment.entity.AttachmentDeletionTask;
import com.nimda.cite.domain.attachment.repository.AttachmentRepository;
import com.nimda.cite.domain.attachment.repository.AttachmentDeletionTaskRepository;
import com.nimda.cite.domain.attachment.store.FileStore;
import com.nimda.cite.domain.attachment.store.S3FileStore;
import com.nimda.cite.domain.board.entity.Board;
import com.nimda.cite.domain.board.entity.Category;
import com.nimda.cite.domain.board.enums.BoardStatus;
import com.nimda.cite.domain.board.repository.BoardRepository;
import com.nimda.cite.domain.board.repository.CategoryRepository;
import com.nimda.cite.domain.board.constants.CategoryConstants;
import com.nimda.cite.common.image.ImageSanitizer;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AttachmentService {

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            // 이미지 (svg 제외 — 내부 스크립트 삽입으로 XSS 가능)
            "jpg", "jpeg", "png", "gif", "webp", "bmp",
            // 문서
            "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx",
            // 텍스트
            "txt", "md", "csv",
            // 압축
            "zip", "7z", "rar",
            // 미디어
            "mp4", "avi", "mov", "mp3", "wav"
    );
    private static final long MAX_FILE_SIZE = 10L * 1024 * 1024;

    public static boolean isAllowedExtension(String ext) {
        if (ext == null || ext.isBlank()) return false;
        return ALLOWED_EXTENSIONS.contains(ext.toLowerCase());
    }

    private final AttachmentRepository attachmentRepository;
    private final AttachmentDeletionTaskRepository deletionTaskRepository;
    private final FileStore fileStore;
    private final BoardRepository boardRepository;
    private final EntityManager entityManager;
    private final CategoryRepository categoryRepository;

    /**
     * [핵심 기능 1] 파일 업로드 및 DB 기록
     * - 유저 정보, 카테고리, 게시글 정보를 모두 받아 연결함
     */
    public Long uploadFile(MultipartFile file, Long boardId, Long categoryId, Long userId) {
        if (userId == null) {
            throw new RuntimeException("로그인이 필요합니다.");
        }
        if (boardId != null) {
            throw new RuntimeException("업로드 시 게시글을 지정할 수 없습니다.");
        }
        if (file.isEmpty()) {
            throw new RuntimeException("업로드할 파일이 없습니다.");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new RuntimeException("파일 크기는 10 MiB를 초과할 수 없습니다.");
        }

        // 1. 원본 파일명 및 확장자 추출
        String originName = file.getOriginalFilename();
        String ext = extractExt(originName);
        if (ext.isBlank()) {
            throw new RuntimeException("파일 확장자가 없습니다. 업로드를 허용하지 않습니다.");
        }

        // 2. 허용된 확장자 검증 (화이트리스트)
        if (!ALLOWED_EXTENSIONS.contains(ext.toLowerCase())) {
            throw new RuntimeException("허용되지 않는 파일 형식입니다: " + ext);
        }

        // 3. 이미지 파일이면 재인코딩하여 메타데이터/삽입 코드 파괴
        long fileSize = file.getSize();
        if (ImageSanitizer.isImageExtension(ext)) {
            try {
                byte[] sanitized = ImageSanitizer.reEncode(file, ext);
                ext = ImageSanitizer.getOutputExtension(ext);
                fileSize = sanitized.length;

                String storedName = UUID.randomUUID().toString() + "." + ext;
                String filepath = fileStore instanceof S3FileStore s3FileStore
                        ? s3FileStore.storeBytes(sanitized, storedName, userId)
                        : fileStore.storeBytes(sanitized, storedName);

                Attachment attachment = Attachment.create(
                        originName, storedName, filepath, ext, fileSize,
                        null, null, userId
                );
                return attachmentRepository.save(attachment).getId();
            } catch (IOException e) {
                throw new RuntimeException("이미지 처리에 실패했습니다: " + e.getMessage());
            }
        }

        // 4. 비이미지 파일: 기존 로직
        String storedName = UUID.randomUUID().toString() + "." + ext;
        String filepath = fileStore instanceof S3FileStore s3FileStore
                ? s3FileStore.storeFile(file, storedName, userId)
                : fileStore.storeFile(file, storedName);

        Attachment attachment = Attachment.create(
                originName, storedName, filepath, ext, fileSize,
                null, null, userId
        );

        return attachmentRepository.save(attachment).getId();
    }

    /**
     * 엔티티 조회 (다운로드 등에서 메타정보 필요 시 사용)
     */
    @Transactional(readOnly = true)
    public Attachment getAttachment(Long attachmentId, Long userId, boolean canReadCartel) {
        Attachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new RuntimeException("파일이 존재하지 않습니다."));
        authorizeRead(attachment, userId, canReadCartel);
        return attachment;
    }

    /**
     * [핵심 기능 2] 파일 상세 조회 (카테고리별 뷰어 분기)
     * - 갤러리 카테고리(예: 2번)는 웹에서 바로 보이게(inline) 설정
     */
    @Transactional(readOnly = true)
    public AttachmentResponseDto getFile(Long attachmentId, Long userId, boolean canReadCartel) {
        Attachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new RuntimeException("파일이 존재하지 않습니다."));
        authorizeRead(attachment, userId, canReadCartel);

        // 카테고리 ID를 활용한 정책 분기 (상수로 관리해 ID 변경 시 한 곳만 수정)
        String disposition = "attachment"; // 기본값: 다운로드
        if (CategoryConstants.GALLERY_ID.equals(attachment.getCategoryId())) {
            disposition = "inline"; // 갤러리 등은 바로보기
        }
        // PDF는 내장 JavaScript 실행 방지를 위해 항상 다운로드 강제
        if ("pdf".equalsIgnoreCase(attachment.getExtension())) {
            disposition = "attachment";
        }

        return AttachmentResponseDto.from(attachment, disposition);
    }

    /**
     * [핵심 기능 3] 내 파일 모아보기 (userId 활용)
     * - 특정 유저가 올린 모든 파일을 리스트로 반환
     */
    @Transactional(readOnly = true)
    public List<AttachmentResponseDto> getMyFileList(Long userId) {
        return attachmentRepository.findByUserId(userId).stream()
                .map(attachment -> AttachmentResponseDto.from(attachment, "attachment"))
                .collect(Collectors.toList());
    }

    /**
     * [핵심 기능 4] 유저별 선택 삭제 (보안 및 삭제 작업 등록)
     */
    public void deleteUserFiles(Long userId, List<Long> fileIds) {
        Set<Long> requestedIds = new HashSet<>(fileIds);
        List<Attachment> files = attachmentRepository.findAllById(requestedIds);
        if (files.size() != requestedIds.size()) {
            throw new RuntimeException("존재하지 않는 파일이 포함되어 있습니다.");
        }

        // Validate the entire request before enqueueing any deletion task.
        for (Attachment file : files) {
            if (file.getUserId() == null || !file.getUserId().equals(userId)) {
                throw new RuntimeException("삭제 권한이 없는 파일이 포함되어 있습니다: " + file.getOriginFilename());
            }
        }
        for (Attachment file : files) {
            enqueueDeletion(file);
            attachmentRepository.delete(file);
        }
    }

    /**
     * 확장자 추출 헬퍼 메서드
     * - 파일명이 없거나 점이 없으면 빈 문자열 반환 (NPE 방지)
     */
    private String extractExt(String originalFilename) {
        if (originalFilename == null || originalFilename.isBlank()) {
            return "";
        }
        int pos = originalFilename.lastIndexOf(".");
        if (pos < 0 || pos == originalFilename.length() - 1) {
            return "";
        }
        return originalFilename.substring(pos + 1);
    }

    /**
     * S3 Presigned 업로드 후, key/메타정보만으로 첨부파일을 등록한다.
     * - 파일 본문은 이미 S3에 존재한다고 가정한다.
     */
    public Long registerFromS3(String key,
                               String originFilename,
                               Long fileSize,
                               Long boardId,
                               Long categoryId,
                               Long userId) {
        if (userId == null) {
            throw new RuntimeException("로그인이 필요합니다.");
        }
        if (key == null || key.isBlank()) {
            throw new RuntimeException("S3 key가 필요합니다.");
        }
        if (boardId != null) {
            throw new RuntimeException("등록 시 게시글을 지정할 수 없습니다.");
        }
        if (fileSize == null || fileSize < 0 || fileSize > MAX_FILE_SIZE) {
            throw new RuntimeException("파일 크기는 10 MiB를 초과할 수 없습니다.");
        }
        if (!(fileStore instanceof S3FileStore s3FileStore)) {
            throw new RuntimeException("S3 파일 등록을 사용할 수 없습니다.");
        }
        long actualSize = s3FileStore.validateRegisteredObject(key, userId);
        if (actualSize > MAX_FILE_SIZE || actualSize != fileSize) {
            throw new RuntimeException("S3 파일 크기 정보가 일치하지 않거나 허용 범위를 초과합니다.");
        }
        if (attachmentRepository.existsByFilepath(key)) {
            throw new RuntimeException("이미 등록된 S3 파일입니다.");
        }
        String storedFilename = extractStoredFilenameFromKey(key);
        String ext = extractExt(storedFilename);
        String claimedExt = extractExt(originFilename);
        if (ext.isBlank()) {
            throw new RuntimeException("파일 확장자가 없습니다. 업로드를 허용하지 않습니다.");
        }
        if (!claimedExt.isBlank() && !ext.equalsIgnoreCase(claimedExt)) {
            throw new RuntimeException("원본 파일명과 S3 key의 확장자가 일치하지 않습니다.");
        }
        if (!ALLOWED_EXTENSIONS.contains(ext.toLowerCase())) {
            throw new RuntimeException("허용되지 않는 파일 형식입니다: " + ext);
        }
        if (ImageSanitizer.isImageExtension(ext)) {
            try {
                byte[] sanitized = ImageSanitizer.reEncode(s3FileStore.readObject(key, userId), ext);
                if (sanitized.length > MAX_FILE_SIZE) {
                    throw new RuntimeException("파일 크기는 10 MiB를 초과할 수 없습니다.");
                }

                String outputExt = ImageSanitizer.getOutputExtension(ext);
                String finalKey = s3FileStore.activationKey(
                        key, "attachments", outputExt, userId);
                if (attachmentRepository.existsByFilepath(finalKey)) {
                    throw new RuntimeException("이미 등록된 S3 파일입니다.");
                }
                s3FileStore.replaceObject(key, finalKey, sanitized, userId);
                key = finalKey;
                storedFilename = extractStoredFilenameFromKey(key);
                actualSize = sanitized.length;
                ext = outputExt;
            } catch (IOException e) {
                throw new RuntimeException("이미지 처리에 실패했습니다: " + e.getMessage(), e);
            }
        } else {
            byte[] storedBytes = s3FileStore.readObject(key, userId);
            if (storedBytes.length != actualSize) {
                throw new RuntimeException("S3 파일 크기 정보가 일치하지 않습니다.");
            }
            String finalKey = s3FileStore.activationKey(
                    key, "attachments", ext, userId);
            if (attachmentRepository.existsByFilepath(finalKey)) {
                throw new RuntimeException("이미 등록된 S3 파일입니다.");
            }
            s3FileStore.replaceObject(key, finalKey, storedBytes, userId);
            key = finalKey;
            storedFilename = extractStoredFilenameFromKey(key);
        }

        String safeOrigin = (originFilename == null || originFilename.isBlank()) ? storedFilename : originFilename;

        Attachment attachment = Attachment.create(
                safeOrigin,
                storedFilename,
                key,
                ext,
                actualSize,
                null,
                null,
                userId
        );

        return attachmentRepository.save(attachment).getId();
    }
    public String finalizeProfileImage(String key, Long userId) {
        if (userId == null) {
            throw new IllegalArgumentException("로그인이 필요합니다.");
        }
        if (!(fileStore instanceof S3FileStore s3FileStore)) {
            throw new IllegalStateException("프로필 이미지 업로드 서비스를 사용할 수 없습니다.");
        }

        long actualSize = s3FileStore.validateProfileImageObject(key, userId);
        if (actualSize <= 0 || actualSize > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("프로필 이미지는 10 MiB 이하여야 합니다.");
        }

        String extension = extractExt(extractStoredFilenameFromKey(key)).toLowerCase();
        if (!ImageSanitizer.isImageExtension(extension)) {
            throw new IllegalArgumentException("허용되지 않는 프로필 이미지 형식입니다.");
        }

        try {
            byte[] sanitized = ImageSanitizer.reEncode(
                    s3FileStore.readObject(key, userId), extension);
            if (sanitized.length > MAX_FILE_SIZE) {
                throw new IllegalArgumentException("프로필 이미지는 10 MiB 이하여야 합니다.");
            }
            String outputExtension = ImageSanitizer.getOutputExtension(extension);
            String finalKey = s3FileStore.activationKey(
                    key, "profile", outputExtension, userId);
            s3FileStore.replaceObject(key, finalKey, sanitized, userId);
            return finalKey;
        } catch (IOException exception) {
            throw new IllegalArgumentException("프로필 이미지 처리에 실패했습니다.", exception);
        }
    }
    public String finalizeProfileDecorationImage(String key, Long userId) {
        if (userId == null) {
            throw new IllegalArgumentException("로그인이 필요합니다.");
        }
        if (!(fileStore instanceof S3FileStore s3FileStore)) {
            throw new IllegalStateException("프로필 장식 이미지 업로드 서비스를 사용할 수 없습니다.");
        }

        long actualSize = s3FileStore.validateProfileDecorationObject(key, userId);
        if (actualSize <= 0 || actualSize > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("프로필 장식 이미지는 10 MiB 이하여야 합니다.");
        }

        String extension = extractExt(extractStoredFilenameFromKey(key)).toLowerCase();
        if (!ImageSanitizer.isImageExtension(extension)) {
            throw new IllegalArgumentException("허용되지 않는 프로필 장식 이미지 형식입니다.");
        }

        try {
            byte[] sanitized = ImageSanitizer.reEncode(
                    s3FileStore.readObject(key, userId), extension);
            if (sanitized.length > MAX_FILE_SIZE) {
                throw new IllegalArgumentException("프로필 장식 이미지는 10 MiB 이하여야 합니다.");
            }
            String outputExtension = ImageSanitizer.getOutputExtension(extension);
            String finalKey = s3FileStore.activationKey(
                    key, "decorations", outputExtension, userId);
            s3FileStore.replaceObject(key, finalKey, sanitized, userId);
            return finalKey;
        } catch (IOException exception) {
            throw new IllegalArgumentException("프로필 장식 이미지 처리에 실패했습니다.", exception);
        }
    }

    public void enqueueOwnedProfileImageDeletion(String storageKey, Long userId) {
        enqueueCanonicalActiveDeletion(storageKey, userId, "profile");
    }

    public void enqueueProfileDecorationDeletion(String storageKey) {
        enqueueCanonicalActiveDeletion(storageKey, null, "decorations");
    }

    private void enqueueCanonicalActiveDeletion(
            String storageKey,
            Long expectedOwnerId,
            String namespace) {
        if (!isCanonicalActiveKey(storageKey, expectedOwnerId, namespace)
                || attachmentRepository.existsByFilepath(storageKey)) {
            return;
        }
        deletionTaskRepository.save(AttachmentDeletionTask.create(storageKey));
    }

    private boolean isCanonicalActiveKey(
            String storageKey,
            Long expectedOwnerId,
            String namespace) {
        if (storageKey == null || storageKey.isBlank()) {
            return false;
        }

        String[] parts = storageKey.split("/", -1);
        if (parts.length != 5
                || !"users".equals(parts[0])
                || !"active".equals(parts[2])
                || !namespace.equals(parts[3])
                || !isSafeLeaf(parts[4])) {
            return false;
        }

        try {
            long ownerId = Long.parseLong(parts[1]);
            return ownerId > 0
                    && (expectedOwnerId == null || expectedOwnerId.equals(ownerId));
        } catch (NumberFormatException exception) {
            return false;
        }
    }

    private boolean isSafeLeaf(String value) {
        return value != null
                && !value.isBlank()
                && !value.contains("..")
                && value.indexOf('/') < 0
                && value.indexOf('\\') < 0
                && value.indexOf('\r') < 0
                && value.indexOf('\n') < 0
                && value.indexOf('\0') < 0;
    }

    /**
     * 글 저장 직후: presigned로 등록된 첨부( boardId 미설정 )를 해당 게시글에 연결.
     */
    public void linkAttachmentsToBoard(List<Long> attachmentIds, Long boardId, Long userId) {
        if (attachmentIds == null || attachmentIds.isEmpty() || boardId == null) {
            return;
        }
        Board board = ownedBoard(boardId, userId);
        Long actualCategoryId = board.getCategory() == null ? null : board.getCategory().getId();
        for (Long aid : attachmentIds) {
            if (aid == null) {
                continue;
            }
            Attachment a = attachmentRepository.findById(aid)
                    .orElseThrow(() -> new RuntimeException("첨부를 찾을 수 없습니다: " + aid));
            if (a.getUserId() == null || !a.getUserId().equals(userId)) {
                throw new RuntimeException("첨부 소유자만 글에 연결할 수 있습니다: " + aid);
            }
            if (a.getBoardId() != null && !a.getBoardId().equals(boardId)) {
                throw new RuntimeException("이미 다른 게시글에 연결된 첨부입니다: " + aid);
            }
            linkToBoard(a.getId(), boardId, actualCategoryId);
        }
    }

    /**
     * 글 수정: 최종 첨부 ID 목록과 동기화. 목록에서 빠진 첨부는 S3+DB 삭제.
     *
     * @param attachmentIds null 이면 첨부 변경 없음
     */
    public void syncAttachmentsForBoard(
            Long boardId,
            List<Long> attachmentIds,
            Long userId,
            boolean canManageAnyBoard) {
        if (attachmentIds == null) {
            return;
        }
        Board board = writableBoard(boardId, userId, canManageAnyBoard);
        Long actualCategoryId = board.getCategory() == null ? null : board.getCategory().getId();
        List<Attachment> current = attachmentRepository.findByBoardIdOrderByIdAsc(boardId);
        Set<Long> wanted = attachmentIds.stream()
                .filter(java.util.Objects::nonNull)
                .collect(Collectors.toSet());

        for (Attachment attachment : current) {
            if (!wanted.contains(attachment.getId())
                    && !canManageAnyBoard
                    && (attachment.getUserId() == null || !attachment.getUserId().equals(userId))) {
                throw new RuntimeException(
                        "다른 사용자가 올린 첨부는 제거할 수 없습니다: " + attachment.getId());
            }
        }

        Map<Long, Attachment> wantedAttachments = new HashMap<>();
        for (Long attachmentId : wanted) {
            Attachment attachment = attachmentRepository.findById(attachmentId)
                    .orElseThrow(() -> new RuntimeException("첨부를 찾을 수 없습니다: " + attachmentId));
            boolean alreadyLinkedToTarget = boardId.equals(attachment.getBoardId());
            if (!alreadyLinkedToTarget
                    && (attachment.getUserId() == null || !attachment.getUserId().equals(userId))) {
                throw new RuntimeException(
                        "첨부 소유자만 게시글에 포함할 수 있습니다: " + attachmentId);
            }
            if (attachment.getBoardId() != null && !alreadyLinkedToTarget) {
                throw new RuntimeException("이미 다른 게시글에 연결된 첨부입니다: " + attachmentId);
            }
            wantedAttachments.put(attachmentId, attachment);
        }

        for (Attachment attachment : current) {
            if (!wanted.contains(attachment.getId())) {
                enqueueDeletion(attachment);
                attachmentRepository.delete(attachment);
            }
        }
        for (Attachment attachment : wantedAttachments.values()) {
            if (attachment.getBoardId() == null
                    || !java.util.Objects.equals(actualCategoryId, attachment.getCategoryId())) {
                linkToBoard(attachment.getId(), boardId, actualCategoryId);
            }
        }
    }

    /**
     * 게시글 상세 응답용 — 해당 글에 연결된 첨부 목록
     */
    @Transactional(readOnly = true)
    public List<AttachmentResponseDto> listAttachmentsForBoard(Long boardId) {
        if (boardId == null) {
            return Collections.emptyList();
        }
        return attachmentRepository.findByBoardIdOrderByIdAsc(boardId).stream()
                .map(att -> {
                    String disp = CategoryConstants.GALLERY_ID.equals(att.getCategoryId()) ? "inline" : "attachment";
                    return AttachmentResponseDto.from(att, disp);
                })
                .collect(Collectors.toList());
    }

    public Long resolveThumbnailAttachmentId(List<Long> attachmentIds, Long requestedThumbnailAttachmentId) {
        if (attachmentIds == null || attachmentIds.isEmpty()) {
            return null;
        }

        List<Attachment> imageAttachments = attachmentIds.stream()
                .filter(id -> id != null)
                .map(id -> attachmentRepository.findById(id)
                        .orElseThrow(() -> new RuntimeException("첨부를 찾을 수 없습니다: " + id)))
                .filter(this::isImage)
                .sorted((left, right) -> left.getId().compareTo(right.getId()))
                .toList();

        if (imageAttachments.isEmpty()) {
            return null;
        }

        if (requestedThumbnailAttachmentId == null) {
            return imageAttachments.get(0).getId();
        }

        return imageAttachments.stream()
                .filter(attachment -> attachment.getId().equals(requestedThumbnailAttachmentId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("썸네일은 첨부된 이미지 중에서 선택해야 합니다."))
                .getId();
    }

    private boolean isImage(Attachment attachment) {
        String extension = attachment.getExtension();
        if (extension == null || extension.isBlank()) {
            String filename = attachment.getOriginFilename();
            extension = filename != null && filename.contains(".")
                    ? filename.substring(filename.lastIndexOf('.') + 1)
                    : "";
        }

        return List.of("jpg", "jpeg", "png", "gif", "webp", "bmp", "svg")
                .contains(extension.toLowerCase());
    }

    /**
     * 게시글 삭제 시 — 연결된 모든 첨부 삭제 작업 등록 및 DB 삭제
     */
    public void deleteAttachmentsForBoard(Long boardId) {
        if (boardId == null) {
            return;
        }
        List<Attachment> list = attachmentRepository.findByBoardId(boardId);
        for (Attachment a : list) {
            enqueueDeletion(a);
            attachmentRepository.delete(a);
        }
    }

    private void authorizeRead(Attachment attachment, Long userId, boolean canReadCartel) {
        if (attachment.getBoardId() == null) {
            if (userId == null || attachment.getUserId() == null
                    || !attachment.getUserId().equals(userId)) {
                throw new RuntimeException("파일에 접근할 권한이 없습니다.");
            }
            return;
        }

        Board board = boardRepository.findById(attachment.getBoardId())
                .orElseThrow(() -> new RuntimeException("연결된 게시글을 찾을 수 없습니다."));
        if (board.getStatus() != BoardStatus.ACTIVE || board.getCategory() == null) {
            throw new RuntimeException("파일에 접근할 권한이 없습니다.");
        }
        if (isCartelCategory(board.getCategory()) && !canReadCartel) {
            throw new RuntimeException("파일에 접근할 권한이 없습니다.");
        }
    }

    private boolean isCartelCategory(Category category) {
        Set<Long> visited = new HashSet<>();
        Category current = category;
        while (current != null && (current.getId() == null || visited.add(current.getId()))) {
            if ("cartel".equalsIgnoreCase(current.getSlug())) {
                return true;
            }
            current = current.getParentId() == null
                    ? null
                    : categoryRepository.findById(current.getParentId()).orElse(null);
        }
        return false;
    }

    private Board ownedBoard(Long boardId, Long userId) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다."));
        if (userId == null || board.getAuthor() == null
                || !userId.equals(board.getAuthor().getId())) {
            throw new RuntimeException("게시글 소유자만 첨부를 연결할 수 있습니다.");
        }
        return board;
    }
    private Board writableBoard(Long boardId, Long userId, boolean canManageAnyBoard) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다."));
        if (!canManageAnyBoard
                && (userId == null || board.getAuthor() == null
                || !userId.equals(board.getAuthor().getId()))) {
            throw new RuntimeException("게시글 소유자만 첨부를 수정할 수 있습니다.");
        }
        return board;
    }

    private void linkToBoard(Long attachmentId, Long boardId, Long categoryId) {
        entityManager.createQuery(
                        "UPDATE Attachment a SET a.boardId = :boardId, a.categoryId = :categoryId WHERE a.id = :id")
                .setParameter("boardId", boardId)
                .setParameter("categoryId", categoryId)
                .setParameter("id", attachmentId)
                .executeUpdate();
    }
    private void enqueueDeletion(Attachment file) {
        String key;
        if (fileStore instanceof S3FileStore) {
            key = file.getFilepath();
            if (!isCanonicalActiveKey(key, file.getUserId(), "attachments")) {
                log.warn("Skipping untrusted legacy S3 deletion for attachment {}", file.getId());
                return;
            }
        } else {
            key = file.getStoredFilename();
            if (!isSafeLeaf(key)) {
                log.warn("Skipping unsafe local deletion for attachment {}", file.getId());
                return;
            }
        }
        deletionTaskRepository.save(AttachmentDeletionTask.create(key));
    }

    private String extractStoredFilenameFromKey(String key) {
        int idx = key.lastIndexOf("/");
        if (idx < 0 || idx == key.length() - 1) {
            return key;
        }
        return key.substring(idx + 1);
    }
}
