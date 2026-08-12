package com.nimda.cite.domain.board.service;

import com.nimda.cite.domain.attachment.service.AttachmentService;
import com.nimda.cite.domain.alarm.service.AlarmService;
import com.nimda.cite.domain.board.entity.Board;
import com.nimda.cite.domain.board.entity.Category;
import com.nimda.cite.domain.board.enums.BoardStatus;
import com.nimda.cite.domain.board.repository.BoardRepository;
import com.nimda.cite.domain.comment.repository.CommentRepository;
import com.nimda.cite.domain.like.repository.BoardLikeRepository;
import com.nimda.cite.user.entity.User;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.Objects;

@Slf4j
@Service
public class BoardService {

    @Autowired
    private BoardRepository boardRepository;
    @Autowired
    private CommentRepository commentRepository;
    @Autowired
    private BoardLikeRepository boardLikeRepository;
    @Autowired
    private AlarmService alarmService;

    @Autowired
    private AttachmentService attachmentService;

    /**
     * 게시글 작성/수정
     *
     * @param attachmentIds 신규: presiggned 등록 후 ID 목록. 수정: 최종 첨부 ID 목록(동기화). null이면 첨부 변경 없음(수정 시).
     */
    @Transactional
    public void write(Board board, User actingUser, List<Long> attachmentIds) {

        boolean isNew = board.getId() == null;
        if (!isNew) {
            Board persistedBoard = boardRepository.findById(board.getId())
                    .orElseThrow(() -> new RuntimeException(
                            "게시글을 찾을 수 없습니다: " + board.getId()));
            requireLegalDocumentAdministrator(persistedBoard, actingUser);
            if (!Objects.equals(persistedBoard.getLegalSlug(), board.getLegalSlug())) {
                throw new IllegalArgumentException("법적 안내 문서 식별자는 변경할 수 없습니다.");
            }
            requireActiveLegalDocument(persistedBoard, board.getStatus());
        } else {
            requireLegalDocumentAdministrator(board, actingUser);
            requireActiveLegalDocument(board, board.getStatus());
        }

        if (isNew) {
            board.setAuthor(actingUser);
        }

        if (board.getPostView() == null) {
            board.setPostView(0);
        }
        if (board.getPinned() == null) {
            board.setPinned(false);
        }

        boardRepository.save(board);

        if (attachmentIds != null) {
            if (isNew) {
                attachmentService.linkAttachmentsToBoard(
                        attachmentIds, board.getId(), actingUser.getId());
            } else {
                boolean canManageAnyBoard = actingUser.getAuthorities().stream()
                        .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthorityName()));
                attachmentService.syncAttachmentsForBoard(
                        board.getId(),
                        attachmentIds,
                        actingUser.getId(),
                        canManageAnyBoard);
            }
        }

        // 2. 공지 알림 전송 (기존 main 기능)
        if (board.getCategory() != null && board.getCategory().getName().contains("공지")) {
            alarmService.sendNoticeToAll(board.getId(), board.getTitle(), actingUser.getId());
        
        }
    }

    // Note. boardListByCategory - 카테고리별 게시글 목록을 페이지네이션으로 조회한다.
    @Transactional(readOnly = true)
    public Page<Board> boardListByCategory(Category category, Pageable pageable) {
        return boardRepository.findByCategoryAndStatusOrderByPinnedDescCreatedAtDesc(
            category, BoardStatus.ACTIVE, pageable);
    }

    // Note. boardListByCategoryWithPinned - 카테고리별 게시글 고정 목록을 페이지네이션으로 조회한다.
    @Transactional(readOnly = true)
    public Page<Board> boardListByCategoryWithPinned(Category category, Pageable pageable) {
        return boardRepository.findByCategoryAndStatusOrderByPinnedDescCreatedAtDesc(category, BoardStatus.ACTIVE, pageable);
    }

    // Note. boardList - 전체 게시글 목록을 페이지네이션으로 조회한다.
    @Transactional(readOnly = true)
    public Page<Board> boardList(Pageable pageable) {
        return boardRepository.findByStatus(BoardStatus.ACTIVE, pageable);
    }

    // Note. boardSearchList - "검색어"(제목 기반)를 기반으로 게시글을 조회한다.
    @Transactional(readOnly = true)
    public Page<Board> boardSearchList(String searchKeyword, Pageable pageable) {
        return boardRepository.findByTitleContainingAndStatus(searchKeyword, BoardStatus.ACTIVE, pageable);
    }

    // Note. boardSearchListByCategory - 특정한 카테고리 내부에서 검색어로 게시글을 조회한다.
    @Transactional(readOnly = true)
    public Page<Board> boardSearchListByCategory(Category category, String searchKeyword, Pageable pageable) {
        return boardRepository.findByCategoryAndTitleContainingAndStatus(category, searchKeyword, BoardStatus.ACTIVE, pageable);
    }

    // Note. boardListByCategories - 여러 카테고리(부모+자식)의 게시글을 페이지네이션으로 조회한다.
    @Transactional(readOnly = true)
    public Page<Board> boardListByCategories(List<Category> categories, Pageable pageable) {
        return boardRepository.findByCategoryInAndStatus(categories, BoardStatus.ACTIVE, pageable);
    }

    // Note. boardSearchListByCategories - 여러 카테고리 내부에서 검색어로 게시글을 조회한다.
    @Transactional(readOnly = true)
    public Page<Board> boardSearchListByCategories(List<Category> categories, String searchKeyword, Pageable pageable) {
        return boardRepository.findByCategoryInAndTitleContainingAndStatus(categories, searchKeyword, BoardStatus.ACTIVE, pageable);
    }

    // Note. boardListPopular - 전체 게시판 인기글을 조회한다.(조회수 기반)
    @Transactional(readOnly = true)
    public Page<Board> boardListPopular(Pageable pageable) {
        return boardRepository.findAllByStatusOrderByViewsDescCreatedAtDesc(BoardStatus.ACTIVE, pageable);
    }
    @Transactional(readOnly = true)
    public Page<Board> boardListPopularExcludingCategories(List<Long> excludedCategoryIds, Pageable pageable) {
        if (excludedCategoryIds == null || excludedCategoryIds.isEmpty()) {
            return boardListPopular(pageable);
        }
        return boardRepository.findAllVisibleByStatusOrderByViewsDescCreatedAtDesc(
                BoardStatus.ACTIVE, excludedCategoryIds, pageable);
    }

    // Note. boardListPopularByCategory - 특정 카테고리 내부 인기글을 조회한다. (조회수 기반)
    @Transactional(readOnly = true)
    public Page<Board> boardListPopularByCategory(Category category, Pageable pageable) {
        return boardRepository.findByCategoryAndStatusOrderByViewsDescCreatedAtDesc(category, BoardStatus.ACTIVE, pageable);
    }

    // Note. getBoard - 포스트 ID로 게시글을 조회한다.
    @Transactional(readOnly = true)
    public Board getBoard(Long id) {
        return boardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다: " + id));
    }

    @Transactional(readOnly = true)
    public Board getLegalDocument(String legalSlug) {
        return boardRepository.findByLegalSlugAndStatus(legalSlug, BoardStatus.ACTIVE)
                .orElseThrow(() -> new RuntimeException("법적 안내 문서를 찾을 수 없습니다."));
    }

    // Note. incrementViewCount - 활성 게시글의 조회수를 원자적으로 증가시킨다.
    @Transactional
    public void incrementViewCount(Board board) {
        int updatedCount = boardRepository.incrementPostView(board.getId(), BoardStatus.ACTIVE);
        if (updatedCount != 1) {
            throw new RuntimeException("게시글을 찾을 수 없습니다: " + board.getId());
        }

        int currentViewCount = board.getPostView() == null ? 0 : board.getPostView();
        board.setPostView(currentViewCount + 1);
    }

    // Note. boardDelete - 포스트 ID로 게시글 삭제 (soft delete)
    // ... 삭제는 관리자만 가능하며 권한 체크는 BorderController에서 진행한다.
    @Transactional
    public void boardDelete(Long id, User actingUser) {
        Board board = boardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다: " + id));
        prohibitLegalDocumentDeletion(board);

        board.setStatus(BoardStatus.DELETED);
        boardRepository.save(board);

        commentRepository.deleteAllByBoardId(id);
        boardLikeRepository.deleteAllByBoardId(id);
    }

    // Note. toggleBoardPin - 게시글 고정/해제 토글
    // ... 고정/해제는 관리자만 가능하며 권한 체크는 BoardController에서 진행한다.
    @Transactional
    public Board toggleBoardPin(Long id) {
        Board board = boardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다: " + id));

        board.setPinned(!board.getPinned());
        boardRepository.save(board);

        return board;
    }

    // BoardService.java (또는 구현체)
    public long countByAuthor(User author) {
        return boardRepository.countByAuthorAndStatus(author, BoardStatus.ACTIVE);
    }

    @Transactional(readOnly = true)
    public List<Board> getMyBoards(User author) {
        return boardRepository.findByAuthorAndStatusOrderByCreatedAtDesc(author, BoardStatus.ACTIVE);
    }

    @Transactional(readOnly = true)
    public Optional<Board> findById(Long id) {
        return boardRepository.findById(id);
    }

    @Transactional
    public void deleteMyBoards(List<Long> boardIds, User author) {
        List<Board> ownedBoards = boardRepository.findAllById(boardIds).stream()
                .filter(board -> board.getAuthor().getId().equals(author.getId()))
                .toList();
        ownedBoards.forEach(this::prohibitLegalDocumentDeletion);
        ownedBoards.forEach(board -> {
            board.setStatus(BoardStatus.DELETED);
            boardRepository.save(board);
            commentRepository.deleteAllByBoardId(board.getId());
            boardLikeRepository.deleteAllByBoardId(board.getId());
        });
    }

    private void requireLegalDocumentAdministrator(Board board, User actingUser) {
        if (board.getLegalSlug() == null) {
            return;
        }
        boolean isAdministrator = actingUser != null
                && actingUser.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthorityName()));
        if (!isAdministrator) {
            throw new AccessDeniedException("법적 안내 문서는 관리자만 변경할 수 있습니다.");
        }
    }

    private void requireActiveLegalDocument(Board persistedBoard, BoardStatus proposedStatus) {
        if (persistedBoard.getLegalSlug() != null && proposedStatus != BoardStatus.ACTIVE) {
            throw new AccessDeniedException("법적 안내 문서는 항상 공개 상태로 유지해야 합니다.");
        }
    }

    private void prohibitLegalDocumentDeletion(Board board) {
        if (board.getLegalSlug() != null) {
            throw new AccessDeniedException("법적 안내 문서는 삭제할 수 없습니다.");
        }
    }

    @Transactional
    public void deleteBoardsByTag(Long categoryId, Long tagId) {
        int deletedCount = boardRepository.updateStatusByTagId(categoryId, tagId, BoardStatus.DELETED);
        log.info("Deactivated {} boards for category {} and tag {}", deletedCount, categoryId, tagId);
    }

    @Transactional
    public int hideBoardsByTag(Long categoryId, Long tagId) {
        return boardRepository.updateStatusByTagIdAndCurrentStatus(categoryId, tagId, BoardStatus.ACTIVE, BoardStatus.HIDDEN);
    }

    @Transactional
    public int activateBoardsByTag(Long categoryId, Long tagId) {
        return boardRepository.updateStatusByTagIdAndCurrentStatus(categoryId, tagId, BoardStatus.HIDDEN, BoardStatus.ACTIVE);
    }

    @Transactional(readOnly = true)
    public List<Board> getRecentBoards() {
        return boardRepository.findTop10ByStatusOrderByCreatedAtDesc(BoardStatus.ACTIVE);
    }

    @Transactional(readOnly = true)
    public long countBoardsByTagAndStatus(Long categoryId, Long tagId, BoardStatus status) {
        return boardRepository.countByCategoryIdAndTagIdAndStatus(categoryId, tagId, status);
    }
}
