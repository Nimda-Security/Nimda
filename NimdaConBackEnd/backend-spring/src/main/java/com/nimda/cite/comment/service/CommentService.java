package com.nimda.cite.comment.service;

import com.nimda.cite.board.entity.Board;
import com.nimda.cite.board.repository.BoardRepository;
import com.nimda.cite.comment.dto.CommentCreateRequest;
import com.nimda.cite.comment.dto.CommentResponse;
import com.nimda.cite.comment.dto.CommentUpdateRequest;
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


    // =============== CREATE ===============

    // 댓글 등록
    @Transactional
    public CommentResponse createComment(Long boardId, CommentCreateRequest request, Long userId) {

        // 연관 엔티티 조회
        // 게시글
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다."));

        // 작성자
        User author = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // 부모 댓글 조회
        Comment parent = null;
        if (request.getParentId() != null) {
            parent = commentRepository.findById(request.getParentId())
                    .orElseThrow(() -> new IllegalArgumentException("부모 댓글을 찾을 수 없습니다."));

            // 부모 댓글이 DELETED 상태라면 대댓글 작성 불가
            if (parent.getStatus() == STATUS.DELETED) {
                throw new IllegalStateException("삭제된 댓글에는 답글을 달 수 없습니다.");
            }

            commentRepository.incrementReplyCount(parent.getId());
        }

        // 엔티티 생성
        Comment comment = new Comment();
        comment.setBoard(board);
        comment.setAuthor(author);
        comment.setParent(parent);
        comment.setContext(request.getContext());

        // 저장
        Comment saved = commentRepository.save(comment);
        return CommentResponse.from(saved, false);
    }


    // =============== READ ===============

    // 댓글 목록 조회
    @Transactional(readOnly = true)
    public List<CommentResponse> getComments(Long boardId, String role) {
        boolean isAdmin = "ROLE_ADMIN".equals(role);

        return commentRepository.findByBoardIdAndParentIsNullOrderByCreatedAtAsc(boardId)
                .stream()
                .map(comment -> CommentResponse.from(comment, isAdmin))
                .collect(Collectors.toList());
    }

    // 대댓글 목록 조회
    @Transactional(readOnly = true)
    public List<CommentResponse> getReplies(Long boardId, Long parentId, String role) {
        boolean isAdmin = "ROLE_ADMIN".equals(role);

        return commentRepository.findByBoardIdAndParentIdOrderByCreatedAtAsc(boardId, parentId)
                .stream()
                .map(comment -> CommentResponse.from(comment, isAdmin))
                .collect(Collectors.toList());
    }


    // =============== UPDATE ===============

    @Transactional
    public CommentResponse updateComment(Long boardId, Long commentId, CommentUpdateRequest request, Long userId, String role) {

        Comment comment = commentRepository.findWithAuthorById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("댓글을 찾을 수 없습니다. id=" + commentId));

        // 게시글 일치 여부 확인
        if (!comment.getBoard().getId().equals(boardId)) {
            throw new IllegalArgumentException("해당 게시글의 댓글이 아닙니다.");
        }

        // 삭제된 댓글은 수정 불가
        if (comment.getStatus() == STATUS.DELETED) {
            throw new IllegalStateException("삭제된 댓글은 수정할 수 없습니다.");
        }

        boolean isAdmin = "ROLE_ADMIN".equals(role);
        boolean isAuthor = comment.getAuthor().getId().equals(userId);

        if (!isAdmin && !isAuthor) {
            throw new IllegalStateException("댓글을 수정할 권한이 없습니다.");
        }

        comment.setContext(request.getContext());

        boolean isAdminViewing = "ROLE_ADMIN".equals(role);
        return CommentResponse.from(comment, isAdminViewing);
    }


    // =============== DELETE ===============

    // SOFT DELETE
    @Transactional
    public void deleteComment(Long boardId, Long commentId, Long userId, String role) {

        Comment comment = commentRepository.findWithAuthorById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("댓글을 찾을 수 없습니다. id=" + commentId));

        if (!comment.getBoard().getId().equals(boardId)) {
            throw new IllegalArgumentException("해당 게시글의 댓글이 아닙니다.");
        }

        boolean isAdmin = "ROLE_ADMIN".equals(role);
        boolean isAuthor = comment.getAuthor().getUserId().equals(userId);

        if (!isAdmin && !isAuthor) {
            throw new IllegalStateException("댓글을 삭제할 권한이 없습니다.");
        }

        // 소프트 삭제
        commentRepository.updateStatus(commentId, STATUS.DELETED);

        // 대댓글이라면 부모의 replyCount 감소
        if (comment.getParent() != null) {
            commentRepository.decrementReplyCount(comment.getParent().getId());
        }
    }

}