package judgeServer.domain.problem.repository;

import judgeServer.domain.problem.entity.Problem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProblemRepository extends JpaRepository<Problem, Long> {
    Problem findByTitle(String title);
    Problem findByCode(String code);
    boolean existsByCode(String code);
    Page<Problem> findByCodeContainingIgnoreCase(String code, Pageable pageable);
    Page<Problem> findByTitleContainingIgnoreCase(String title, Pageable pageable);
}
