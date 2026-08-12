package com.nimda.cite.domain.comment.service;

import com.nimda.cite.domain.alarm.Event.AddChildCommentEvent;
import com.nimda.cite.domain.alarm.Event.AddCommentEvent;
import com.nimda.cite.domain.board.entity.Board;
import com.nimda.cite.domain.board.entity.Category;
import com.nimda.cite.domain.board.enums.BoardStatus;
import com.nimda.cite.domain.board.repository.BoardRepository;
import com.nimda.cite.domain.board.repository.CategoryRepository;
import com.nimda.cite.domain.comment.dto.*;
import com.nimda.cite.domain.comment.entity.Comment;
import com.nimda.cite.domain.comment.enums.STATUS;
import com.nimda.cite.domain.comment.repository.CommentRepository;
import com.nimda.cite.domain.like.repository.CommentLikeRepositroy;
import com.nimda.cite.user.entity.User;
import com.nimda.cite.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;


@Service
public class CommentService {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private BoardRepository boardRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    @Autowired
    private CommentLikeRepositroy commentLikeRepository;

    private Board requireVisibleActiveBoard(Long boardId, User user) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다."));

        if (!canViewActiveBoard(board, user)) {
            throw new AccessDeniedException("접근할 수 없는 게시글입니다.");
        }
        return board;
    }

    private boolean canViewActiveBoard(Board board, User user) {
        if (board == null || board.getStatus() != BoardStatus.ACTIVE || board.getCategory() == null) {
            return false;
        }

        Set<Long> visited = new HashSet<>();
        Category category = board.getCategory();
        while (category != null && (category.getId() == null || visited.add(category.getId()))) {
            if ("cartel".equalsIgnoreCase(category.getSlug())) {
                return user != null && user.getAuthorities().stream()
                        .anyMatch(authority -> "ROLE_CARTEL".equals(authority.getAuthorityName())
                                || "ROLE_ADMIN".equals(authority.getAuthorityName()));
            }
            category = category.getParentId() == null
                    ? null
                    : categoryRepository.findById(category.getParentId()).orElse(null);
        }
        return true;
    }

    // =============== CREATE ===============

    // 댓글 등록
    @Transactional
    public CommentResponse createComment(Long boardId, CommentCreateRequest request, Long userId) {

        User author = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        Board board = requireVisibleActiveBoard(boardId, author);

        // 부모 댓글 조회
        Comment parent = null;
        if (request.getParentId() != null && request.getParentId() > 0) {
            parent = commentRepository.findById(request.getParentId())
                    .orElseThrow(() -> new IllegalArgumentException("부모 댓글을 찾을 수 없습니다."));

            if (!parent.getBoard().getId().equals(boardId)) {
                throw new IllegalStateException("다른 게시글의 댓글에는 답글을 달 수 없습니다.");
            }

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
                        new AddCommentEvent(this, board.getAuthor(), comment.getAuthor(), board.getTitle(), boardId, comment.getContext())
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

        return CommentResponse.forUser(saved, userId);
    }


    // =============== READ ===============

    // 댓글 조회
    @Transactional(readOnly = true)
    public List<CommentResponse> getComments(Long boardId, Long userId, boolean isAdmin) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        requireVisibleActiveBoard(boardId, user);
        List<Comment> allComments = commentRepository.findAllCommentsByBoardId(boardId);

        List<CommentResponse> rootComments = new ArrayList<>();
        Map<Long, CommentResponse> map = new HashMap<>();

        for (Comment comment : allComments) {
            CommentResponse dto = isAdmin
                    ? CommentResponse.forAdmin(comment, userId)
                    : CommentResponse.forUser(comment, userId);

            // 좋아요 상태 설정
            if (userId != null) {
                dto.setIsLiked(commentLikeRepository.existsByCommentIdAndUserId(comment.getId(), userId));
            } else {
                dto.setIsLiked(false);
            }

            map.put(dto.getId(), dto);

            if (comment.getParent() == null) {
                // 댓글인 경우
                rootComments.add(dto);
            } else {
                // 대댓글인 경우
                CommentResponse parentDto = map.get(comment.getParent().getId());
                if (parentDto != null) {
                    parentDto.getChildren().add(dto);
                } else {
                    // 자식 댓글의 부모가 db에 없는 경우
                    // TODO 로그 남기기
                }
            }
        }

        return rootComments;
    }

    // 마이 페이지 작성 댓글 조회
    @Transactional(readOnly = true)
    public List<MyCommentResponse> getMyComments(Long userId) {
        // 작성자
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        List<Comment> comments = commentRepository.findByMyComments(user, List.of(STATUS.DELETED));

        return comments.stream()
                .map(MyCommentResponse::from)
                .collect(Collectors.toList());
    }
    @Transactional(readOnly = true)
    public List<MyCommentResponse> getVisibleCommentsByUser(Long subjectUserId, Long viewerUserId) {
        User subject = userRepository.findById(subjectUserId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        User viewer = userRepository.findById(viewerUserId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        return commentRepository.findByMyComments(subject, List.of(STATUS.DELETED)).stream()
                .filter(comment -> comment.getStatus() == STATUS.PUBLIC)
                .filter(comment -> canViewActiveBoard(comment.getBoard(), viewer))
                .map(MyCommentResponse::from)
                .collect(Collectors.toList());
    }

    // =============== UPDATE ===============

    @Transactional
    public CommentResponse updateCommentStatus(
            Long commentId, CommentStatusUpdateRequest request, Long userId) {

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("댓글을 찾을 수 없습니다. id=" + commentId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        requireVisibleActiveBoard(comment.getBoard().getId(), user);

        if (comment.getStatus() == STATUS.DELETED) {
            throw new IllegalStateException("삭제된 댓글은 상태를 변경할 수 없습니다.");
        }

        comment.updateStatus(request.getStatus());

        return CommentResponse.forAdmin(comment);
    }

    @Transactional
    public CommentResponse updateComment(Long commentId, CommentUpdateRequest request, Long userId) {

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("댓글을 찾을 수 없습니다. id=" + commentId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        requireVisibleActiveBoard(comment.getBoard().getId(), user);

        if(!comment.getAuthor().getId().equals(userId)) {
            throw new AccessDeniedException("댓글 수정 권한이 없습니다. userId=" + userId);
        }

        if (comment.getStatus() == STATUS.DELETED) {
            throw new IllegalStateException("삭제된 댓글은 수정할 수 없습니다.");
        }

        comment.updateContext(request.getContext());

        return CommentResponse.forUser(comment, userId);
    }


    // =============== DELETE ===============

    // SOFT DELETE
    @Transactional
    public void deleteComment(Long commentId, Long userId) {

        Comment comment = commentRepository.findWithAuthorById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("댓글을 찾을 수 없습니다. id=" + commentId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        requireVisibleActiveBoard(comment.getBoard().getId(), user);

        if (!comment.getAuthor().getId().equals(userId)) {
            throw new AccessDeniedException("댓글 삭제 권한이 없습니다.");
        }

        if (comment.getStatus() == STATUS.DELETED) {
            throw new IllegalStateException("이미 삭제된 댓글입니다.");
        }

        comment.updateStatus(STATUS.DELETED);
    }

    @Transactional
    public void deleteMyComments(List<Long> commentIds, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        commentRepository.findAllById(commentIds).stream()
                .filter(comment -> comment.getAuthor().getId().equals(userId))
                .forEach(comment -> requireVisibleActiveBoard(comment.getBoard().getId(), user));

        commentRepository.deleteAllByIdInAndAuthor(commentIds, user);
    }
    @Transactional(readOnly = true)
    public long countByUserId(Long userId) {
        // 삭제된 댓글(DELETED)은 개수에서 제외합니다.
        return commentRepository.countByAuthorIdAndStatusNot(userId, STATUS.DELETED);
    }

    // 내가 댓글을 단 게시글 ID 목록 조회
    @Transactional(readOnly = true)
    public List<Long> getCommentedBoardIds(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        return commentRepository.findDistinctBoardIdsByAuthor(user, List.of(STATUS.DELETED));
    }
}