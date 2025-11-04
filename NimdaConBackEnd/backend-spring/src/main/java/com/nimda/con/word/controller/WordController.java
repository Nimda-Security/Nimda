package com.nimda.con.word.controller;

import com.nimda.con.word.dto.WordRequest;
import com.nimda.con.word.dto.WordResponse;
import com.nimda.con.word.service.WordService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/words")
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
}