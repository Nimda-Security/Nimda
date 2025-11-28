package com.nimda.cup.word.repository;

import com.nimda.cup.word.entity.Word;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface WordRepository extends JpaRepository<Word, Long> {

    List<Word> findByUserId(String userId);

    boolean existsByUserIdAndWord(String userId, String word);

    //-- countUpdatedAfter : 뱃지에 표시할 새 단어 개수를 조회한다 -- //
    @Query("SELECT COUNT(w) FROM Word w WHERE w.userId = :userId AND w.updatedAt >= :timestamp")
    long countUpdatedAfter(@Param("userId") String userId, @Param("timestamp") LocalDateTime timestamp);
}
