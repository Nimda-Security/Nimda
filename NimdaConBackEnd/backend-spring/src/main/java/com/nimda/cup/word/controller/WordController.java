package com.nimda.cup.word.controller;

import com.nimda.cup.word.dto.WordCountResponse;
import com.nimda.cup.word.dto.WordRequest;
import com.nimda.cup.word.dto.WordResponse;
import com.nimda.cup.word.service.WordService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/words")
@CrossOrigin(origins = "*") // 크롬 익스텐션 관련 보안 설정
@RequiredArgsConstructor
public class WordController {

    private final WordService wordService;

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