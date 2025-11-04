package com.nimda.con.word.repository;

import com.nimda.con.word.entity.Word;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WordRepository extends JpaRepository<Word, Long> {

    List<Word> findByUserId(String userId);

    boolean existsByUserIdAndWord(String userId, String word);

}
