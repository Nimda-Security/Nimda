package com.nimda.cite.comment.controller;

import com.nimda.cite.comment.dto.CommentResponse;
import com.nimda.cite.comment.service.CommentService;
import com.nimda.cup.common.util.JwtUtil;
import com.nimda.cup.user.security.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cite")
public class CommentController {

    @Autowired
    private CommentService commentService;

    // 특정 게시글의 댓글 조회
    @GetMapping("/board/{boardId}/comments")
    public ResponseEntity<List<CommentResponse>> getComments(@PathVariable Long boardId) {
        return ResponseEntity.ok(commentService.getComments(boardId));
    }

    // 특정 댓글의 대댓글 조회
    @GetMapping("/board/{boardId}/comments/{parentId}/children")
    public ResponseEntity<List<CommentResponse>> getReplies(
            @PathVariable Long boardId,
            @PathVariable Long parentId) {
        return ResponseEntity.ok(commentService.getReplies(boardId, parentId));
    }

    /*
    // 댓글 수정
    @PatchMapping("/comments/{commentId}")
    public ResponseEntity<CommentResponse> updateComment() { }

    // 댓글 삭제
    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
    ) { }
    */

}
