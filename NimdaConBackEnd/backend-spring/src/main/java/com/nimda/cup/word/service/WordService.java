package com.nimda.cup.word.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import com.nimda.cup.word.dto.WordRequest;
import com.nimda.cup.word.dto.WordResponse;
import com.nimda.cup.word.entity.Word;
import com.nimda.cup.word.repository.WordRepository;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WordService {
    private final WordRepository wordRepository;

    @Transactional
    public WordResponse saveWord(WordRequest request) {

        // TODO: OAuth 미구현: 어떤 값이 오든 임시 사용자로 통일
        String userId = "anonymous";

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

            word.setUserId(userId); // 기존 레코드도 anonymous로 통일
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

    // method: getWordByUserId : 특정 사용자의 모든 단어 목록을 최신순으로 가져온다. 
    public List<WordResponse> getWordsByUserId(String userId) {
        String resolvedUserId = resolveUserId(userId); // null이면 anonymous 설정
        return wordRepository.findAllByUserIdOrderByUpdatedAtDesc(resolvedUserId)
                .stream()
                .map(WordResponse::from)
                .collect(Collectors.toList());
    }

    // method: getWordsSince : 증분 동기화 메서드로 마지막 동기화 이후 추가되거나 수정된 단어만 내려준다. 
    public List<WordResponse> getWordsSince(String userId, long timestamp) {
        String resolvedUserId = resolveUserId(userId);
        LocalDateTime since = timestampToLocalDateTime(timestamp);
        return wordRepository.findByUserIdAndUpdatedAfter(resolvedUserId, since)
                .stream()
                .map(WordResponse::from)
                .collect(Collectors.toList());
    }

    // method: 특정 사용자 (userId)가 마지막으로 동기화한 시점 이후에 서버에 추가된 단어의 개수를 계산한다. 
    public int getNewWordCount(String userId, long timestamp) {
        String resolvedUserId = resolveUserId(userId); // null이면 anonymous 설정
        LocalDateTime since = timestampToLocalDateTime(timestamp);
        return (int) wordRepository.countUpdatedAfter(resolvedUserId, since);
    }

    // method: userId가 null이면 anonymous 설정 - 사용자 인증 미구현 고려 nullable 처리 
    private String resolveUserId(String userId) {
        return (userId == null || userId.trim().isEmpty())
                ? "anonymous"
                : userId.trim();
    }

    // method: timestamp를 LocalDateTime으로 변환한다.
    // timestamp: 1970-01-01 00:00:00 UTC 이후의 밀리초 단위 시간
    private LocalDateTime timestampToLocalDateTime(long timestamp) {
        if (timestamp <= 0) {
            return LocalDateTime.ofInstant(Instant.EPOCH, ZoneId.systemDefault());
        }
        return LocalDateTime.ofInstant(Instant.ofEpochMilli(timestamp), ZoneId.systemDefault());
    }
}