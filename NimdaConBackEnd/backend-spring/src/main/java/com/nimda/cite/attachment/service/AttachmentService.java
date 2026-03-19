package com.nimda.cite.attachment.service;

import com.nimda.cite.attachment.dto.AttachmentResponseDto;
import com.nimda.cite.attachment.entity.Attachment;
import com.nimda.cite.attachment.repository.AttachmentRepository;
import com.nimda.cite.attachment.store.FileStore;
import com.nimda.cite.board.constants.CategoryConstants;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AttachmentService {

    private final AttachmentRepository attachmentRepository;
    private final FileStore fileStore;

    /**
     * [핵심 기능 1] 파일 업로드 및 DB 기록
     * - 유저 정보, 카테고리, 게시글 정보를 모두 받아 연결함
     */
    public Long uploadFile(MultipartFile file, Long boardId, Long categoryId, Long userId) {
        if (file.isEmpty()) {
            throw new RuntimeException("업로드할 파일이 없습니다.");
        }

        // 1. 원본 파일명 및 확장자 추출
        String originName = file.getOriginalFilename();
        String ext = extractExt(originName);
        if (ext.isBlank()) {
            ext = "bin"; // 확장자 없을 때 기본값
        }

        // 2. 서버 저장용 중복 없는 이름 생성 (UUID)
        String storedName = UUID.randomUUID().toString() + "." + ext;

        // 3. 물리 파일 저장
        String filepath = fileStore.storeFile(file, storedName);

        // 4. DB 엔티티 생성 및 저장
        Attachment attachment = Attachment.create(
                originName,
                storedName,
                filepath,
                ext,
                file.getSize(),
                boardId,
                categoryId,
                userId
        );

        return attachmentRepository.save(attachment).getId();
    }

    /**
     * 엔티티 조회 (다운로드 등에서 메타정보 필요 시 사용)
     */
    @Transactional(readOnly = true)
    public Attachment getAttachment(Long attachmentId) {
        return attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new RuntimeException("파일이 존재하지 않습니다."));
    }

    /**
     * [핵심 기능 2] 파일 상세 조회 (카테고리별 뷰어 분기)
     * - 갤러리 카테고리(예: 2번)는 웹에서 바로 보이게(inline) 설정
     */
    @Transactional(readOnly = true)
    public AttachmentResponseDto getFile(Long attachmentId) {
        Attachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new RuntimeException("파일이 존재하지 않습니다."));

        // 카테고리 ID를 활용한 정책 분기 (상수로 관리해 ID 변경 시 한 곳만 수정)
        String disposition = "attachment"; // 기본값: 다운로드
        if (CategoryConstants.GALLERY_ID.equals(attachment.getCategoryId())) {
            disposition = "inline"; // 갤러리 등은 바로보기
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
     * [핵심 기능 4] 유저별 선택 삭제 (보안 및 물리 파일 삭제)
     */
    public void deleteUserFiles(Long userId, List<Long> fileIds) {
        List<Attachment> files = attachmentRepository.findAllById(fileIds);

        for (Attachment file : files) {
            // 보안 검증: 요청 유저가 파일 소유자인지 확인
            if (!file.getUserId().equals(userId)) {
                throw new RuntimeException("삭제 권한이 없는 파일이 포함되어 있습니다: " + file.getOriginFilename());
            }

            // 1. 실제 서버(AWS)에서 물리 파일 삭제
            fileStore.deleteFile(file.getStoredFilename());

            // 2. DB 레코드 삭제
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
}