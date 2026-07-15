package judgeServer.domain.problem.controller;

import com.nimda.cite.common.response.ApiResponse;
import jakarta.validation.Valid;
import judgeServer.domain.problem.dto.AddProblemsRequest;
import judgeServer.domain.problem.dto.ProblemListResponse;
import judgeServer.domain.problem.dto.SearchProblemRequest;
import judgeServer.domain.problem.dto.ViewProblemDetailsResponse;
import judgeServer.domain.problem.service.ProblemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/judge/problem")
public class ProblemController {
    @Autowired
    private ProblemService problemService;

    @GetMapping
    public ResponseEntity<?> viewProblemList(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        Page<ProblemListResponse> dto =
                problemService.getProblems(pageable).map(
                        ProblemListResponse::from
                );

        return ApiResponse.ok(dto).toResponse();
    }

    @GetMapping(value = "/{id}/html", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<?> viewProblemHtml(@PathVariable Long id) {
        byte[] htmlBytes = problemService.viewProblemHtml(id);
        return ResponseEntity.ok()
                .contentType(MediaType.TEXT_HTML)
                .body(htmlBytes);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> viewProblemDetails(@PathVariable Long id) {
        ViewProblemDetailsResponse dto = ViewProblemDetailsResponse.from(
                problemService.viewProblemDetails(id)
        );

        return ApiResponse.ok(dto).toResponse();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createProblem(@ModelAttribute @Valid AddProblemsRequest request) {
        // 1. ZIP 파일 존재 여부 확인
        if (request.getZipFile() == null || request.getZipFile().isEmpty()) {
            return ResponseEntity.badRequest().body("ZIP 파일이 첨부되지 않았습니다.");
        }

        // 2. 서비스 계층으로 DTO와 파일 전달
        problemService.addProblem(request);

        return ResponseEntity.ok("문제가 성공적으로 등록되었습니다.");
    }

    @GetMapping("/search-by-code")
    public ResponseEntity<?> searchByCode(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
            , @RequestBody SearchProblemRequest req) {
        Page<ProblemListResponse> dto = problemService
                .searchProblemByCode(req.getCode(), pageable)
                .map(ProblemListResponse::from);

        return ApiResponse.ok(dto).toResponse();
    }

    @GetMapping("/search-by-title")
    public ResponseEntity<?> searchByTitle(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
            , @RequestBody SearchProblemRequest req) {

        Page<ProblemListResponse> dto = problemService
                .searchProblemByTitle(req.getTitle(), pageable)
                .map(ProblemListResponse::from);

        return ApiResponse.ok(dto).toResponse();
    }



    @PostMapping("/toggle-public/{id}")
    public ResponseEntity<?> toggleIsPublic(@PathVariable Long id) {
        boolean isPublic = problemService.toggleIsPublic(id);

        return ApiResponse.ok(isPublic).toResponse();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProblem(@PathVariable Long id) {
        problemService.deleteProblem(id);
        return ApiResponse.ok("삭제가 완료되었습니다.").toResponse();
    }
}
