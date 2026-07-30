package judgeServer.domain.problem.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nimda.cite.domain.attachment.store.S3FileStore;
import judgeServer.domain.problem.dto.AddProblemsRequest;
import judgeServer.domain.problem.dto.ProblemZipMeta;
import judgeServer.domain.problem.dto.ViewProblemDetailsResponse;
import judgeServer.domain.problem.entity.Problem;
import judgeServer.domain.problem.repository.ProblemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.stream.Stream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class ProblemService {

    @Autowired
    private ProblemRepository problemRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private S3FileStore fileStore;

    @Transactional(readOnly = true)
    public Page<Problem> getProblems(Pageable pageable) {
        return problemRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public Problem viewProblemDetails(Long id) {
        return problemRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "존재하지 않는 문제입니다."));
    }

    // S3에서 html 문서를 읽어서 보여주는 메소드
    @Transactional(readOnly = true)
    public byte[] viewProblemHtml(Long id) {
        Problem problem = problemRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "존재하지 않는 문제입니다."));

        // 2. 엔티티에 저장된 url (s3Locate) 값 가져오기
        String s3Locate = problem.getUrl();
        if (s3Locate == null || s3Locate.isBlank()) {
            throw new RuntimeException("해당 문제의 S3 저장 경로가 존재하지 않습니다.");
        }

        return fileStore.getProblemHtml(problem.getUrl());
    }

    @Transactional
    public void addProblem(AddProblemsRequest request) {
        Path tempDir = null;
        try {
            // 1. 격리된 임시 작업 디렉토리 생성
            tempDir = Files.createTempDirectory("problem_");
            // 2. 메인 ZIP 파일 (문제.zip) 압축 해제
            try (InputStream mainZipIs = request.getZipFile().getInputStream()) {
                unzip(mainZipIs, tempDir);
            }

            // 3. problem.json 읽어와서 메타데이터 객체로 변환
            Path jsonPath = tempDir.resolve("problem.json");
            ProblemZipMeta metadata = objectMapper.readValue(jsonPath.toFile(), ProblemZipMeta.class);

            // 4. tests.zip 압축 해제
            Path testsZipPath = tempDir.resolve("tests.zip");
            if (!Files.exists(testsZipPath)) {
                throw new IOException("tests.zip 파일을 찾을 수 없습니다.");
            }

            Path testsDir = tempDir.resolve("tests_extracted");
            try (InputStream testZipIs = Files.newInputStream(testsZipPath)) {
                unzip(testZipIs, testsDir);
            }

            // 5. 문제 식별 코드 설정 및 S3 저장 위치(URL) 정의
            String problemCode = request.getCode().isEmpty() ? metadata.getGroup() : request.getCode();

            // 6. Problem 엔티티 생성
            Problem problem = Problem.builder()
                    .code(problemCode)
                    .title(request.getTitle().isEmpty() ? metadata.getName() : request.getTitle())
                    .description(request.getDescription().isEmpty() ? "설명이 없는 문제입니다." : request.getDescription())
                    .timeLimit(request.getTimeLimit()  != null ? request.getTimeLimit() : metadata.getTimeLimit())
                    .memoryLimit(request.getMemoryLimit() != null ? request.getMemoryLimit() : metadata.getMemoryLimit())
                    .points(request.getPoints())
                    .isPublic(request.getIsPublic() != null ? request.getIsPublic() : false)
                    .referenceUrl(metadata.getUrl())
                    .build();

            // 7. 이후 id를 꺼내기 위한 객체 저장
            problemRepository.save(problem);

            // 8. s3 객체 위치는 문제 id로 설정
            String s3Locate = problem.getId().toString();
            problem.setUrl(s3Locate);

            // 9. tests.zip에서 풀려난 테스트 케이스(1.in, 1.out) 및 html 파일을 S3에 업로드
            uploadDirectoryToS3(testsDir, s3Locate);

        } catch (IOException e) {
            throw new RuntimeException("문제 압축 해제, S3 업로드 및 엔티티 생성 실패", e);
        } finally {
            // 10. 성공/실패 여부에 관계없이 사용이 끝난 임시 파일들 삭제
            deleteDirectory(tempDir);
        }
    }

    @Transactional
    public void deleteProblem(Long id) {
        if(!problemRepository.existsById(id)) {
            throw new RuntimeException("삭제하려는 문제가 존재하지 않습니다.");
        }
        problemRepository.deleteById(id);

        fileStore.deleteProblemDirectory(id.toString());
    }

    @Transactional(readOnly = true)
    public Page<Problem> searchProblemByTitle(String title, Pageable pageable) {
        return problemRepository.findByTitleContainingIgnoreCase(title,pageable);
    }

    @Transactional(readOnly = true)
    public Page<Problem> searchProblemByCode(String code, Pageable pageable) {
        return problemRepository.findByCodeContainingIgnoreCase(code, pageable);
    }

    @Transactional
    public boolean toggleIsPublic(Long id) {
        Problem problem = problemRepository
                .findById(id).orElseThrow(
                        () -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        problem.setIsPublic(!problem.getIsPublic());
        return problem.getIsPublic();
    }

    // ── ZIP 압축 해제 상한 (zip bomb / 디스크 고갈 방지) ──
    private static final int MAX_ZIP_ENTRIES = 2_000;
    private static final long MAX_ZIP_ENTRY_BYTES = 64L * 1024 * 1024;   // 엔트리당 64MB
    private static final long MAX_ZIP_TOTAL_BYTES = 256L * 1024 * 1024;  // 전체 256MB

    /**
     * ZIP 압축 해제.
     *
     * 보안:
     * - Zip Slip: 정규화 후 targetDir 하위인지 검사한다.
     * - Zip Bomb: 엔트리 수 / 엔트리당 크기 / 전체 해제 크기 상한을 강제한다.
     *   ZipEntry.getSize() 는 헤더값이라 위조 가능하므로 실제 스트리밍 바이트를 센다.
     */
    private void unzip(InputStream is, Path targetDir) {
        try (ZipInputStream zis = new ZipInputStream(is)) {
            ZipEntry entry;
            int entryCount = 0;
            long totalBytes = 0;

            while ((entry = zis.getNextEntry()) != null) {
                if (++entryCount > MAX_ZIP_ENTRIES) {
                    throw new SecurityException(
                            "ZIP 엔트리 수 상한(" + MAX_ZIP_ENTRIES + ")을 초과했습니다.");
                }

                Path newPath = targetDir.resolve(entry.getName()).normalize();

                // 보안 체크: 경로가 targetDir 내부인지 확인 (Path Traversal 방지)
                if (!newPath.startsWith(targetDir)) {
                    throw new SecurityException("ZIP 파일 내부에 허용되지 않는 경로가 포함되어 있습니다.");
                }

                if (entry.isDirectory()) {
                    Files.createDirectories(newPath);
                } else {
                    Files.createDirectories(newPath.getParent());
                    totalBytes += copyEntryWithLimit(zis, newPath, totalBytes);
                }
            }
        } catch (IOException e) {
            throw new RuntimeException("압축 풀기 실패", e);
        }
    }

    /**
     * 엔트리 하나를 상한을 지키며 기록하고, 기록한 바이트 수를 반환한다.
     */
    private long copyEntryWithLimit(ZipInputStream zis, Path target, long totalBytesSoFar)
            throws IOException {
        byte[] buffer = new byte[8192];
        long entryBytes = 0;

        try (java.io.OutputStream out = Files.newOutputStream(target,
                StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING,
                StandardOpenOption.WRITE)) {
            int read;
            while ((read = zis.read(buffer)) != -1) {
                entryBytes += read;

                if (entryBytes > MAX_ZIP_ENTRY_BYTES) {
                    throw new SecurityException(
                            "ZIP 엔트리 크기 상한(" + (MAX_ZIP_ENTRY_BYTES / 1024 / 1024) + "MB)을 초과했습니다: "
                                    + target.getFileName());
                }
                if (totalBytesSoFar + entryBytes > MAX_ZIP_TOTAL_BYTES) {
                    throw new SecurityException(
                            "ZIP 전체 해제 크기 상한(" + (MAX_ZIP_TOTAL_BYTES / 1024 / 1024) + "MB)을 초과했습니다.");
                }

                out.write(buffer, 0, read);
            }
        }

        return entryBytes;
    }

    private void deleteDirectory(Path path) {
        if (path == null) return;
        try {
            if (Files.exists(path)) {
                Files.walkFileTree(path, new SimpleFileVisitor<Path>() {
                    @Override
                    public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) throws IOException {
                        Files.delete(file);
                        return FileVisitResult.CONTINUE;
                    }

                    @Override
                    public FileVisitResult postVisitDirectory(Path dir, IOException exc) throws IOException {
                        Files.delete(dir);
                        return FileVisitResult.CONTINUE;
                    }
                });
            }
        } catch (IOException e) {
            log.warn("임시 디렉토리 삭제 실패: {}", path);
        }
    }

    private void uploadDirectoryToS3(Path sourceDir, String problemCode) {
        try (Stream<Path> paths = Files.walk(sourceDir)) {
            paths.filter(Files::isRegularFile).forEach(file -> {
                // sourceDir(tests_extracted)을 기준으로 파일의 상대 경로 추출 (예: 1.in, 1.out)
                String relativePath = sourceDir.relativize(file).toString().replace("\\", "/");

                // S3FileStore를 통해 실제 업로드 수행
                fileStore.uploadProblemFile(problemCode, relativePath, file);
            });
        } catch (IOException e) {
            throw new RuntimeException("S3에 업로드할 디렉토리 읽기 실패: " + sourceDir, e);
        }
    }
}