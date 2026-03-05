package com.nimda.cite.comment.service;

import com.nimda.cite.alarm.Event.AddChildCommentEvent;
import com.nimda.cite.alarm.Event.AddCommentEvent;
import com.nimda.cite.alarm.service.AlarmService;
import com.nimda.cite.board.entity.Board;
import com.nimda.cite.board.entity.Category;
import com.nimda.cite.board.repository.BoardRepository;
import com.nimda.cite.board.repository.CategoryRepository;
import com.nimda.cite.comment.dto.*;
import com.nimda.cite.comment.entity.Comment;
import com.nimda.cite.comment.enums.STATUS;
import com.nimda.cite.comment.repository.CommentRepository;
import com.nimda.cup.user.entity.User;
import com.nimda.cup.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class CommentService {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private BoardRepository boardRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private AlarmService alarmService;

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    // =============== CREATE ===============

    // 댓글 등록
    @Transactional
    public CommentUserResponse createComment(Long boardId, CommentCreateRequest request, Long userId) {

        // 연관 엔티티 조회
        // 게시글
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다."));

        // 작성자
        User author = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // 카테고리
        Category category = board.getCategory();
        if (category == null) {
            throw new IllegalArgumentException("게시글에 카테고리가 설정되어 있지 않습니다.");
        }

        // 부모 댓글 조회
        Comment parent = null;
        if (request.getParentId() != null && request.getParentId() > 0) {
            parent = commentRepository.findById(request.getParentId())
                    .orElseThrow(() -> new IllegalArgumentException("부모 댓글을 찾을 수 없습니다."));

            // 깊이 제한: 부모 댓글이 이미 대댓글인지 확인
            if (parent.getParent() != null) {
                throw new IllegalStateException("대댓글에는 답글을 달 수 없습니다.");
            }

            // 상태 확인: 부모 댓글 삭제 여부 확인
            if (parent.getStatus() == STATUS.DELETED) {
                throw new IllegalStateException("삭제된 댓글에는 답글을 달 수 없습니다.");
            }
        }

        // 엔티티 생성
        Comment comment = Comment.builder()
                .context(request.getContext())
                .board(board)
                .category(category)
                .author(author)
                .parent(parent)
                .status(STATUS.PUBLIC)
                .build();

        // 저장
        Comment saved = commentRepository.save(comment);

        // 게시글에 댓글이 달린 경우
        if(parent == null) {
            // 게시글 작성자와 댓글 작성자가 다를 때만 알림
            if(!board.getAuthor().getId().equals(userId)) {
                eventPublisher.publishEvent(
                        new AddCommentEvent(this, board.getAuthor(), comment.getAuthor(), board.getTitle(), boardId)
                );
            }
        }
        // 댓글에 대댓글이 달린 경우
        else {
            if (!parent.getAuthor().getId().equals(userId)) {
                eventPublisher.publishEvent(
                        new AddChildCommentEvent(this, board, comment.getAuthor(), parent.getAuthor())
                );
            }
        }

        return CommentUserResponse.from(saved, userId);
    }


    // =============== READ ===============

    // 댓글 조회(유저용)
    @Transactional(readOnly = true)
    public List<CommentUserResponse> getCommentsForUser(Long boardId, Long userId) {
        List<Comment> allComments = commentRepository.findAllByBoardIdOrderByCreatedAtAsc(boardId);

        Map<Long, CommentUserResponse> map = new HashMap<>();
        List<CommentUserResponse> rootComments = new ArrayList<>();

        for (Comment comment : allComments) {
            CommentUserResponse dto = CommentUserResponse.from(comment, userId);
            map.put(dto.getId(), dto);

            if (comment.getParent() == null) {
                // 댓글인 경우
                rootComments.add(dto);
            } else {
                // 대댓글인 경우
                CommentUserResponse parentDto = map.get(comment.getParent().getId());
                if (parentDto != null) {
                    parentDto.getChildren().add(dto);
                }
            }
        }

        return rootComments;
    }

    // 댓글 조회(어드민용)
    @Transactional(readOnly = true)
    public List<CommentAdminResponse> getCommentsForAdmin(Long boardId) {
        List<Comment> allComments = commentRepository.findAllByBoardIdOrderByCreatedAtAsc(boardId);

        Map<Long, CommentAdminResponse> map = new HashMap<>();
        List<CommentAdminResponse> rootComments = new ArrayList<>();

        for (Comment comment : allComments) {
            CommentAdminResponse dto = CommentAdminResponse.from(comment);
            map.put(dto.getId(), dto);

            if (comment.getParent() == null) {
                rootComments.add(dto);
            } else {
                CommentAdminResponse parentDto = map.get(comment.getParent().getId());
                if (parentDto != null) {
                    parentDto.getChildren().add(dto);
                }
            }
        }

        return rootComments;
    }


    // =============== UPDATE ===============

    @Transactional
    public CommentAdminResponse updateCommentStatus(Long commentId, CommentStatusUpdateRequest request) {

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("댓글을 찾을 수 없습니다. id=" + commentId));

        if (comment.getStatus() == STATUS.DELETED) {
            throw new IllegalStateException("삭제된 댓글은 상태를 변경할 수 없습니다.");
        }

        comment.updateStatus(request.getStatus());

        return CommentAdminResponse.from(comment);
    }

    @Transactional
    public CommentUserResponse updateComment(Long commentId, CommentUpdateRequest request, Long userId) {

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("댓글을 찾을 수 없습니다. id=" + commentId));

        if(!comment.getAuthor().getId().equals(userId)) {
            throw new AccessDeniedException("댓글 수정 권한이 없습니다. userId=" + userId);
        }

        if (comment.getStatus() == STATUS.DELETED) {
            throw new IllegalStateException("삭제된 댓글은 수정할 수 없습니다.");
        }

        comment.updateContext(request.getContext());

        return CommentUserResponse.from(comment, userId);
    }


    // =============== DELETE ===============

    // SOFT DELETE
    @Transactional
    public void deleteComment(Long commentId, Long userId) {

        Comment comment = commentRepository.findWithAuthorById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("댓글을 찾을 수 없습니다. id=" + commentId));

        if (!comment.getAuthor().getId().equals(userId)) {
            throw new AccessDeniedException("댓글 삭제 권한이 없습니다.");
        }

        if (comment.getStatus() == STATUS.DELETED) {
            throw new IllegalStateException("이미 삭제된 댓글입니다.");
        }

        comment.updateStatus(STATUS.DELETED);
    }

}