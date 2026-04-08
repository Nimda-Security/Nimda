package com.nimda.cite.board.controller;

import com.nimda.cite.board.entity.Category;
import com.nimda.cite.board.enums.BoardStatus;
import com.nimda.cite.board.repository.CategoryRepository;
import com.nimda.cite.board.service.BoardService;
import com.nimda.cite.tag.entity.Tag;
import com.nimda.cite.tag.repository.TagRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/admin/boards")
@PreAuthorize("hasRole('ADMIN')")
public class AdminBoardController {

    @Autowired
    private BoardService boardService;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private TagRepository tagRepository;

    /**
     * 카테고리의 태그별 게시글 통계 조회
     */
    @GetMapping("/tag-stats")
    public ResponseEntity<?> getTagStats(@RequestParam Long categoryId) {
        try {
            Optional<Category> categoryOpt = categoryRepository.findById(categoryId);
            if (categoryOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("success", false, "message", "카테고리를 찾을 수 없습니다."));
            }

            List<Tag> tags = tagRepository.findAllByCategoryIdOrderBySortValueAsc(categoryId);

            List<Map<String, Object>> tagStats = new ArrayList<>();
            for (Tag tag : tags) {
                long activeCount = boardService.countBoardsByTagAndStatus(categoryId, tag.getId(), BoardStatus.ACTIVE);
                long hiddenCount = boardService.countBoardsByTagAndStatus(categoryId, tag.getId(), BoardStatus.HIDDEN);

                Map<String, Object> stat = new LinkedHashMap<>();
                stat.put("tagId", tag.getId());
                stat.put("tagName", tag.getTagName());
                stat.put("activeCount", activeCount);
                stat.put("hiddenCount", hiddenCount);
                tagStats.add(stat);
            }

            Map<String, Object> response = new LinkedHashMap<>();
            response.put("success", true);
            response.put("categoryId", categoryId);
            response.put("tagStats", tagStats);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "태그 통계 조회 중 오류가 발생했습니다."));
        }
    }

    /**
     * 태그 기반 게시글 비활성화 (ACTIVE → HIDDEN)
     */
    @PutMapping("/deactivate-by-tag")
    public ResponseEntity<?> deactivateByTag(@RequestParam Long categoryId, @RequestParam Long tagId) {
        try {
            Optional<Category> categoryOpt = categoryRepository.findById(categoryId);
            if (categoryOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("success", false, "message", "카테고리를 찾을 수 없습니다."));
            }

            int count = boardService.hideBoardsByTag(categoryId, tagId);

            Map<String, Object> response = new LinkedHashMap<>();
            response.put("success", true);
            response.put("message", "tagId=" + tagId + " 태그의 게시글 " + count + "건이 비활성화되었습니다.");
            response.put("affectedCount", count);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "비활성화 중 오류가 발생했습니다."));
        }
    }

    /**
     * 태그 기반 게시글 활성화 (HIDDEN → ACTIVE)
     */
    @PutMapping("/activate-by-tag")
    public ResponseEntity<?> activateByTag(@RequestParam Long categoryId, @RequestParam Long tagId) {
        try {
            Optional<Category> categoryOpt = categoryRepository.findById(categoryId);
            if (categoryOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("success", false, "message", "카테고리를 찾을 수 없습니다."));
            }

            int count = boardService.activateBoardsByTag(categoryId, tagId);

            Map<String, Object> response = new LinkedHashMap<>();
            response.put("success", true);
            response.put("message", "tagId=" + tagId + " 태그의 게시글 " + count + "건이 활성화되었습니다.");
            response.put("affectedCount", count);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "활성화 중 오류가 발생했습니다."));
        }
    }
}

