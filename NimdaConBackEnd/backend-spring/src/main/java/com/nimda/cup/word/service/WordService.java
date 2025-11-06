package com.nimda.cup.word.service;

import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import jakarta.transaction.Transactional;
import com.nimda.cup.word.repository.WordRepository;
import com.nimda.cup.word.dto.WordRequest;
import com.nimda.cup.word.dto.WordResponse;
import com.nimda.cup.word.entity.Word;

@Service
@RequiredArgsConstructor
public class WordService {
    private final WordRepository wordRepository;

    @Transactional
    public WordResponse saveWord(WordRequest request) {

        // OAuth 미구현 시 userId가 null이면 기본값 설정
        String userId = request.getUserId();
        if (userId == null || userId.trim().isEmpty()) {
            userId = "anonymous"; // 또는 "temp_user_" + System.currentTimeMillis()
        }

        // 중복 체크 (같은 사용자가 같은 단어를 여러 번 저장하는 것 방지)
        boolean exists = wordRepository.existsByUserIdAndWord(
                userId,
                request.getWord());

        Word word;

        if (exists) {

            // 이미 존재하면 업데이트
            // 리스트를 스트림으로 변환 후 필터링에 맞는 요소만 선택
            // 필터 조건 (Word의 word 필드가 request.getWord()와 같은 요소만 선택)
            word = wordRepository.findByUserId(userId).stream()
                    .filter(w -> w.getWord().equals(request.getWord()))
                    .findFirst()
                    .orElseThrow();

            word.setTranslation(request.getTranslation());
            word.setPronunciation(request.getPronunciation());
            word.setExample(request.getExample());

        } else {
            // 없으면 새로 생성
            word = Word.builder()
                    .userId(userId)
                    .word(request.getWord())
                    .translation(request.getTranslation())
                    .pronunciation(request.getPronunciation())
                    .example(request.getExample())
                    .build();
        }

        Word savedWord = wordRepository.save(word);
        return WordResponse.from(savedWord);
    }
}