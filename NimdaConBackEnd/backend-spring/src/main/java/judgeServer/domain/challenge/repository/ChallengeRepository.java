package judgeServer.domain.challenge.repository;

import judgeServer.domain.challenge.entity.Challenge;
import judgeServer.domain.challenge.enums.ChallengeCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ChallengeRepository extends JpaRepository<Challenge, Long> {
    Optional<Challenge> findByCode(String code);
    boolean existsByCode(String code);
    Page<Challenge> findByCategory(ChallengeCategory category, Pageable pageable);
    Page<Challenge> findByTitleContainingIgnoreCase(String title, Pageable pageable);
}
