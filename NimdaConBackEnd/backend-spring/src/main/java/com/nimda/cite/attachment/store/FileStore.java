package com.nimda.cite.attachment.store;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.util.Optional;

/**
 * 첨부파일 물리 저장 추상화 (로컬 디스크 / S3 등)
 */
public interface FileStore {

    /**
     * 파일을 저장하고, DB에 저장할 값(저장 키 또는 URL)을 반환한다.
     * 로컬: storedName만 반환. 다운로드 URL은 id 기반 API로 제공.
     * S3 등: 전체 URL 반환 가능.
     *
     * @param file 업로드된 파일
     * @param storedName 서버 저장용 파일명 (예: uuid.ext)
     * @return entity.filepath 에 저장할 값 (저장 키 또는 URL)
     */
    String storeFile(MultipartFile file, String storedName);

    /**
     * 저장된 파일을 삭제한다.
     * @param storedFilename 서버 저장명 (storedFilename)
     */
    void deleteFile(String storedFilename);

    /**
     * 저장된 파일을 Resource로 연다. (로컬 저장 시 다운로드 응답용)
     * S3 등 외부 URL이면 empty 반환 → 클라이언트는 entity.filepath 로 직접 접근.
     */
    Optional<Resource> getResource(String storedFilename);
}
