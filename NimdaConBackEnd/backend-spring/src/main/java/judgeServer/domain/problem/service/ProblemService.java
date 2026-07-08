package judgeServer.domain.problem.service;

import judgeServer.domain.problem.dto.AddProblemsRequest;
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

@Service
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

    @Transactional
    public void addProblems(AddProblemsRequest req) {
        if(problemRepository.existsByCode(req.getCode()))
            throw new IllegalStateException("문제 코드는 고유해야 합니다.");

        Problem problem = Problem.builder()
                .code(req.getCode())
                .title(req.getTitle())
                .description(req.getDescription())
                .points(req.getPoints())
                .timeLimit(req.getTimeLimit())
                .memoryLimit(req.getMemoryLimit())
                .isPublic(req.getIsPublic())
                .build();

        problemRepository.save(problem);
    }

    @Transactional(readOnly = true)
    public Problem viewProblem(Long id) {
        return problemRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    @Transactional
    public void deleteProblem(Long id) {
        if(!problemRepository.existsById(id)) {
            throw new RuntimeException("삭제하려는 문제가 존재하지 않습니다.");
        }
        problemRepository.deleteById(id);
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

    private void unzip(InputStream is, Path targetDir) {
        try (ZipInputStream zis = new ZipInputStream(is)) {
            ZipEntry entry;
            while ((entry = zis.getNextEntry()) != null) {
                Path newPath = targetDir.resolve(entry.getName()).normalize();

                // 보안 체크: 경로가 targetDir 내부인지 확인 (Path Traversal 방지)
                if (!newPath.startsWith(targetDir)) {
                    throw new SecurityException("ZIP 파일 내부에 허용되지 않는 경로가 포함되어 있습니다.");
                }

                if (entry.isDirectory()) {
                    Files.createDirectories(newPath);
                } else {
                    Files.createDirectories(newPath.getParent());
                    Files.copy(zis, newPath, StandardCopyOption.REPLACE_EXISTING);
                }
            }
        } catch (IOException e) {
            throw new RuntimeException("압축 풀기 실패", e);
        }
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
            System.err.println("임시 디렉토리 삭제 실패: " + path);
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