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

@Service
public class ProblemService {
    @Autowired
    private ProblemRepository problemRepository;

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

    public boolean toggleIsPublic(Long id) {
        Problem problem = problemRepository
                .findById(id).orElseThrow(
                        () -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        problem.setIsPublic(!problem.getIsPublic());
        return problem.getIsPublic();
    }
}
