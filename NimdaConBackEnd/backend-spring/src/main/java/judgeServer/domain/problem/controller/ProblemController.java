package judgeServer.domain.problem.controller;

import com.nimda.cite.common.response.ApiResponse;
import judgeServer.domain.problem.dto.AddProblemsRequest;
import judgeServer.domain.problem.dto.ViewProblemsResponse;
import judgeServer.domain.problem.service.ProblemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
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

    @GetMapping("/{id}")
    public ResponseEntity<?> viewProblemDetails(@PathVariable Long id) {
        ViewProblemDetailsResponse dto = ViewProblemDetailsResponse
                .from(problemService.viewProblem(id));

        return ApiResponse.ok(dto).toResponse();
    }

    @PostMapping
    public ResponseEntity<?> addProblems(@RequestBody AddProblemsRequest req) {
        try {
            problemService.addProblems(req);
        } catch (RuntimeException e) {
            throw new RuntimeException(e);
        }

        return ApiResponse.ok("문제 추가가 완료되었습니다.").toResponse();
    }

    @PostMapping("/toggle-public/{id}")
    public ResponseEntity<?> toggleIsPublic(@PathVariable Long id) {
        boolean isPublic = problemService.toggleIsPublic(id);

        return ApiResponse.ok(isPublic).toResponse();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProblem(@PathVariable Long id) {
        problemService.deleteProblem(id);
        return ApiResponse.ok("삭제가 완료되었습니다.").toResponse();
    }
}
