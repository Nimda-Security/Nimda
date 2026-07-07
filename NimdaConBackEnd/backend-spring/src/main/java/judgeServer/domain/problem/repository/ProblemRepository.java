package judgeServer.domain.problem.repository;

import judgeServer.domain.problem.entity.Problem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProblemRepository extends JpaRepository<Problem, Long> {
    Problem findByTitle(String title);
    Problem findByCode(String code);
    boolean existsByCode(String code);
}
