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

    // method: findAllByUserIdOrderByUpdatedAtDesc : 특정 사용자의 모든 단어를 최신순(내림차)으로 조회한다. 
    // usage: 앱을 처음 설치/로그인 하였거나 단 한번도 동기화를 하지 않은 상태에서만 호출되는 API 
    // - 기존에 저장된 단어가 하나도 없다고 보고, Get /api/words를 호출하여 해당 사용자의 모든 단어를 내려받는다. 
    @Query("SELECT w FROM Word w WHERE w.userId = :userId ORDER BY w.updatedAt DESC")
    List<Word> findAllByUserIdOrderByUpdatedAtDesc(@Param("userId") String userId);

    // method: findByUserIdAndUpdatedAfter : 증분 동기화 메서드로 "마지막 동기화 이후 변경된 단어들만" 조회하는 핵심 쿼리.
    @Query("SELECT w FROM Word w WHERE w.userId = :userId AND w.updatedAt >= :timestamp ORDER BY w.updatedAt DESC")
    List<Word> findByUserIdAndUpdatedAfter(@Param("userId") String userId, @Param("timestamp") LocalDateTime timestamp);
}
