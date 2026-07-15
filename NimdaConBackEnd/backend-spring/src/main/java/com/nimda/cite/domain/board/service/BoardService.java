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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

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
    public void write(Board board, User author, List<Long> attachmentIds) {

        boolean isNew = board.getId() == null;

        board.setAuthor(author);

        if (board.getPostView() == null) {
            board.setPostView(0);
        }
        if (board.getPinned() == null) {
            board.setPinned(false);
        }

        boardRepository.save(board);

        Long categoryId = board.getCategory() != null ? board.getCategory().getId() : null;
        if (attachmentIds != null) {
            if (isNew) {
                attachmentService.linkAttachmentsToBoard(attachmentIds, board.getId(), categoryId, author.getId());
            } else {
                attachmentService.syncAttachmentsForBoard(board.getId(), attachmentIds, categoryId, author.getId());
            }
        }

        // 2. 공지 알림 전송 (기존 main 기능)
        if (board.getCategory() != null && board.getCategory().getName().contains("공지")) {
            alarmService.sendNoticeToAll(board.getId(), board.getTitle(), author.getId());
        
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

    // Note. boardListPopularByCategory - 특정 카테고리 내부 인기글을 조회한다. (조회수 기반)
    @Transactional(readOnly = true)
    public Page<Board> boardListPopularByCategory(Category category, Pageable pageable) {
        return boardRepository.findByCategoryAndStatusOrderByViewsDescCreatedAtDesc(category, BoardStatus.ACTIVE, pageable);
    }

    // Note. boardView - 포스트 ID로 게시글 조회 및 조회수 증가 메서드
    @Transactional
    public Board boardView(Long id) {

        Board board = boardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다: " + id));

        board.setPostView(board.getPostView() + 1);
        boardRepository.save(board);

        return board;
    }

    // Note. boardDelete - 포스트 ID로 게시글 삭제 (soft delete)
    // ... 삭제는 관리자만 가능하며 권한 체크는 BorderController에서 진행한다.
    @Transactional
    public void boardDelete(Long id) {
        Board board = boardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다: " + id));

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
        List<Board> boards = boardRepository.findAllById(boardIds);
        // 본인 게시글만 soft delete
        boards.stream()
                .filter(b -> b.getAuthor().getId().equals(author.getId()))
                .forEach(b -> {
                    b.setStatus(BoardStatus.DELETED);
                    boardRepository.save(b);

                    commentRepository.deleteAllByBoardId(b.getId());
                    boardLikeRepository.deleteAllByBoardId(b.getId());
                });
    }

    @Transactional
    public void deleteBoardsByTag(Long categoryId, Long tagId) {
        int deletedCount = boardRepository.updateStatusByTagId(categoryId, tagId, BoardStatus.DELETED);
        System.out.println("tagId=" + tagId + " 태그를 가진 게시글 " + deletedCount + "건을 비활성화했습니다.");
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
        return boardRepository.findTop10ByOrderByCreatedAtDesc();
    }

    @Transactional(readOnly = true)
    public long countBoardsByTagAndStatus(Long categoryId, Long tagId, BoardStatus status) {
        return boardRepository.countByCategoryIdAndTagIdAndStatus(categoryId, tagId, status);
    }
}
