package com.nimda.cup.judge.repository;

import com.nimda.cup.judge.entity.Problem;
import com.nimda.cup.judge.enums.Difficulty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProblemRepository extends JpaRepository<Problem, Long> {
    
    /**
     * 문제 제목으로 검색
     */
    Optional<Problem> findByTitle(String title);
    
    /**
     * 난이도별 문제 조회
     */
    List<Problem> findByDifficulty(Difficulty difficulty);
    
    /**
     * 점수 범위로 문제 조회
     */
    List<Problem> findByPointsBetween(Integer minPoints, Integer maxPoints);
    
    /**
     * 문제 제목에 키워드가 포함된 문제들 검색
     */
    @Query("SELECT p FROM Problem p WHERE p.title LIKE %:keyword%")
    List<Problem> findByTitleContaining(String keyword);
    
    /**
     * 최근 생성된 문제들 조회
     */
    @Query("SELECT p FROM Problem p ORDER BY p.createdAt DESC LIMIT 10")
    List<Problem> findTop10ByOrderByCreatedAtDesc();
}
