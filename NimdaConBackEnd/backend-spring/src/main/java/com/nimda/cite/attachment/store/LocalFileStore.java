package com.nimda.cite.attachment.store;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Optional;

/**
 * 로컬 디스크에 첨부파일을 저장하는 FileStore 구현.
 * - DB에는 저장 키(storedName)만 저장. 다운로드 URL은 API 경로가 바뀌어도 안전하도록 컨트롤러(id 기반)에서 조합.
 */
@Component
public class LocalFileStore implements FileStore {

    private static final Logger log = LoggerFactory.getLogger(LocalFileStore.class);

    @Value("${nimda.file.upload-dir:${user.home}/nimda-attachments}")
    private String uploadDir;

    private Path basePath;

    @PostConstruct
    public void init() {
        basePath = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(basePath);
            log.info("LocalFileStore 초기화: uploadDir={}", basePath);
        } catch (IOException e) {
            throw new UncheckedIOException("첨부파일 업로드 디렉토리를 생성할 수 없습니다: " + basePath, e);
        }
    }

    @Override
    public String storeFile(MultipartFile file, String storedName) {
        Path target = basePath.resolve(storedName).normalize();
        if (!target.startsWith(basePath)) {
            throw new SecurityException("저장 경로가 업로드 디렉토리 밖입니다: " + storedName);
        }
        try {
            Files.createDirectories(target.getParent());
            file.transferTo(target.toFile());
            log.debug("파일 저장됨: {}", target);
        } catch (IOException e) {
            throw new UncheckedIOException("파일 저장 실패: " + storedName, e);
        }
        // DB에는 저장 키만 저장. 다운로드는 GET /api/cite/attachments/{id}/download 로 제공.
        return storedName;
    }

    @Override
    public void deleteFile(String storedFilename) {
        if (storedFilename == null || storedFilename.isBlank()) {
            return;
        }
        Path target = basePath.resolve(storedFilename).normalize();
        if (!target.startsWith(basePath)) {
            log.warn("삭제 경로가 업로드 디렉토리 밖입니다: {}", storedFilename);
            return;
        }
        try {
            boolean deleted = Files.deleteIfExists(target);
            if (deleted) {
                log.debug("파일 삭제됨: {}", target);
            }
        } catch (IOException e) {
            log.warn("파일 삭제 실패: {}", target, e);
        }
    }

    @Override
    public Optional<Resource> getResource(String storedFilename) {
        if (storedFilename == null || storedFilename.isBlank()) {
            return Optional.empty();
        }
        Path target = basePath.resolve(storedFilename).normalize();
        if (!target.startsWith(basePath) || !Files.isRegularFile(target)) {
            return Optional.empty();
        }
        return Optional.of(new FileSystemResource(target.toFile()));
    }
}
