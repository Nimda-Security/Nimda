package com.nimda.cite.comment.service;

import com.nimda.cite.board.entity.Board;
import com.nimda.cite.board.repository.BoardRepository;
import com.nimda.cite.comment.dto.CommentCreateRequest;
import com.nimda.cite.comment.dto.CommentResponse;
import com.nimda.cite.comment.entity.Comment;
import com.nimda.cite.comment.enums.STATUS;
import com.nimda.cite.comment.repository.CommentRepository;
import com.nimda.cup.user.entity.User;
import com.nimda.cup.user.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CommentService {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private BoardRepository boardRepository;

    @Autowired
    private UserRepository userRepository;

    // 댓글 등록
    @Transactional
    public void createComment(CommentCreateRequest request, Long userId) {

        // 연관 엔티티 조회
        // 게시글
        Board board = boardRepository.findById(request.getBoardId())
                .orElseThrow(() -> new EntityNotFoundException("게시글을 찾을 수 없습니다."));

        // 작성자
        User author = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다."));

        // 부모 댓글
        Comment parent = null;
        if (request.getParentId() != null) {
            parent = commentRepository.findById(request.getParentId())
                    .orElseThrow(() -> new EntityNotFoundException("부모 댓글을 찾을 수 없습니다."));

            parent.setReplyCount(parent.getReplyCount() + 1);
        }

        // 엔티티 생성
        Comment comment = Comment.builder()
                .context(request.getContext())
                .board(board)
                .author(author)
                .parent(parent)
                .status(STATUS.PUBLIC)
                .replyCount(0)
                .build();

        // 저장
        commentRepository.save(comment);
    }

    // 댓글 목록 조회
    public List<CommentResponse> getComments(Long boardId) {
        return commentRepository.findByBoardIdAndParentIsNullOrderByCreatedAtAsc(boardId)
                .stream()
                .map(CommentResponse::from)
                .collect(Collectors.toList());
    }

    // 대댓글 목록 조회
    public List<CommentResponse> getReplies(Long boardId, Long parentId) {
        return commentRepository.findByBoardIdAndParentIdOrderByCreatedAtAsc(boardId, parentId)
                .stream()
                .map(CommentResponse::from)
                .collect(Collectors.toList());
    }

    // 댓글 삭제
    // 대댓글 O - Soft Delete
    //       X - Hard Delete
    /*
    @Transactional
    public void deleteComment(Long commentId, Long userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new EntityNotFoundException("댓글을 찾을 수 없습니다."));

        // 권한 체크 (작성자 본인인지 확인)
        if (!comment.getAuthor().getId().equals(userId)) {
            throw new AccessDeniedException("삭제 권한이 없습니다.");
        }

        // 실제 삭제 대신 상태값 변경 (대댓글 유실 방지)
        comment.setStatus(STATUS.DELETE);
    }
     */
}