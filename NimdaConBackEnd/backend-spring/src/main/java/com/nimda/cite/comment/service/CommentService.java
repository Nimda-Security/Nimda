package com.nimda.cite.comment.service;

import com.nimda.cite.comment.dto.CommentRequestDto;
import com.nimda.cite.comment.dto.CommentResponseDto;
import com.nimda.cite.comment.dto.ReplyResponseDto;
import com.nimda.cite.comment.entity.Comment;
import com.nimda.cite.comment.enums.STATUS;
import com.nimda.cite.comment.repository.CommentRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CommentService {

    private final CommentRepository commentRepository;

    /**
     * 댓글 및 대댓글 등록
     */
    @Transactional
    public Long createComment(CommentRequestDto dto) {
        Comment comment = dto.toEntity();

        // 대댓글인 경우 부모 댓글 설정
        if (dto.getParentId() != null) {
            Comment parent = commentRepository.findById(dto.getParentId())
                    .orElseThrow(() -> new EntityNotFoundException("부모 댓글이 존재하지 않습니다."));

            comment.setParent(parent);

            // 부모 댓글의 답글 수 증가 (더티 체킹)
            parent.setReplyCount(parent.getReplyCount() + 1);
        }

        return commentRepository.save(comment).getId();
    }

    /**
     * 댓글 삭제 (Soft Delete)
     * 자식 댓글이 있으면 'DELETED' 상태로 변경, 없으면 물리 삭제 고려 가능
     */
    @Transactional
    public void deleteComment(Long commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new EntityNotFoundException("댓글을 찾을 수 없습니다."));

        // 실제 DB에서 지우지 않고 상태만 변경 (대댓글 구조 유지 목적)
        comment.setStatus(STATUS.DELETE);
        comment.setContext("삭제된 댓글입니다.");
    }

    /**
     * 특정 게시글의 댓글 목록 조회 (계층 구조 정렬은 쿼리나 로직에서 처리)
     */
    public List<CommentResponseDto> getCommentsByBoard(Long boardId) {
        List<Comment> comments = commentRepository.findByBoardIdAndParentIsNullOrderByCreatedAtAsc(boardId);
        return comments.stream()
                .map(CommentResponseDto::from)
                .collect(Collectors.toList());
    }
/*
    public List<ReplyResponseDto> getRepliesByParent() {

    }
 */
}