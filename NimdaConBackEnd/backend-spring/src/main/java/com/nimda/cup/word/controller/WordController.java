package com.nimda.cup.word.controller;

import com.nimda.cup.word.dto.WordCountResponse;
import com.nimda.cup.word.dto.WordRequest;
import com.nimda.cup.word.dto.WordResponse;
import com.nimda.cup.word.service.WordService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/words")
@CrossOrigin(origins = "*") // 크롬 익스텐션 관련 보안 설정
@RequiredArgsConstructor
public class WordController {

    private final WordService wordService;

    // -- Get /api/words : 특정 사용자의 모든 단어를 최신순(내림차)으로 조회한다. -- 
    // usage : 특정 사용자가 저장한 모든 단어를 한 번에 내려준다. 
    // 사용시점 : 앱을 처음 설치했거나, 마지막 동기화 시간 (lastSyncTime)이 0인 경우. 
    @GetMapping
    public ResponseEntity<List<WordResponse>> getWordsByUser(
            @RequestParam(name = "user_id", required = false) String userId
    ) {
        List<WordResponse> responses = wordService.getWordsByUserId(userId);
        return ResponseEntity.ok(responses);
    }

    // -- Get /api/words/since : 증분 동기화 메서드로 마지막 동기화 이후 추가되거나 수정된 단어만 내려준다. -- 
    // usage : 마지막 동기화 이후 추가되거나 수정된 단어만 내려준다. 
    // 사용시점 : 앱을 실행할 때마다 호출되어, 마지막 동기화 이후 변경된 단어들만을 내려받는다. 
    // Param : user_id (optional) , 사용자 ID (OAuth 미구현 고려 nullable)
    // Param : since (required) , 마지막 동기화 시각으로, 이 시각 이후에 추가/수정된 단어만을 조회한다.
    @GetMapping("/since")
    public ResponseEntity<List<WordResponse>> getWordsSince(
            @RequestParam(name = "user_id", required = false) String userId,
            @RequestParam("since") long timestamp
    ) {
        List<WordResponse> responses = wordService.getWordsSince(userId, timestamp);
        return ResponseEntity.ok(responses);
    }

    /**
     * 단어 저장 API
     * 
     * @param request 단어 정보 (word, translation, pronunciation, example)
     * @return 저장된 단어 정보
     */
    @PostMapping
    public ResponseEntity<?> saveWord(@Valid @RequestBody WordRequest request) {
        try {
            WordResponse response = wordService.saveWord(request);

            Map<String, Object> result = Map.of(
                    "success", true,
                    "data", response);

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, Object> error = Map.of(
                    "success", false,
                    "message", e.getMessage());

            return ResponseEntity.badRequest().body(error);
        }
    }

    // -- GET /api/words/count : 뱃지에 표시할 새 단어 개수를 조회한다. -- 
    // -- Param : user_id (optional) , 사용자 ID (OAuth 미구현 고려 nullable)
    // -- Param : since (required) , 마지막 동기화 시각으로, 이 시각 이후에 추가/수정된 단어만을 카운트한다.
    @GetMapping("/count")
    public ResponseEntity<WordCountResponse> getNewWordCount(
            @RequestParam(name = "user_id", required = false) String userId,
            @RequestParam("since") long timestamp
    ) {
        int count = wordService.getNewWordCount(userId, timestamp);
        return ResponseEntity.ok(new WordCountResponse(count));
    }
}