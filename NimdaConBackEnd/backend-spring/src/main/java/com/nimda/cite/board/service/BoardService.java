package com.nimda.cite.board.service;

import com.nimda.cite.board.entity.Board;
import com.nimda.cite.board.entity.Category;
import com.nimda.cite.board.repository.BoardRepository;
import com.nimda.cup.user.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.util.UUID;

@Service
public class BoardService {

    @Autowired
    private BoardRepository boardRepository;

    // Note. write Service
    // Param : board : 게시글 정보, author : 작성자, file : 첨부파일
    @Transactional
    public void write(Board board, User author, MultipartFile file) throws Exception {

        // logic1. 파일 저장 로직 TODO: 추후에 보안 취약점은 없는지. 스토리지에 어떻게 보관할 것인지 분석
        if (file != null && !file.isEmpty()) {
            String uploadDir = System.getProperty("user.home") + "/board-uploads";
            File directory = new File(uploadDir);
            if (!directory.exists()) {
                directory.mkdirs();
            }

            UUID uuid = UUID.randomUUID();
            String fileName = uuid + "_" + file.getOriginalFilename();
            File saveFile = new File(uploadDir, fileName);
            file.transferTo(saveFile);

            board.setFilename(fileName);
            board.setFilepath("/api/download/" + fileName);
        }

        // logic2. 작성자/조회수/고정여부 등 기본값 설정
        board.setAuthor(author);

        if (board.getPostView() == null) {
            board.setPostView(0);
        }
        if (board.getPinned() == null) {
            board.setPinned(false);
        }

        boardRepository.save(board);
    }

    // Note. boardListByCategory - 카테고리별 게시글 목록을 페이지네이션으로 조회한다.
    @Transactional(readOnly = true)
    public Page<Board> boardListByCategory(Category category, Pageable pageable) {
        return boardRepository.findByCategory(category, pageable);
    }

    // Note. boardListByCategoryWithPinned - 카테고리별 고정글만 조회 (pinned = true)
    @Transactional(readOnly = true)
    public Page<Board> boardListByCategoryWithPinned(Category category, Pageable pageable) {
        return boardRepository.findByCategoryAndPinnedTrueOrderByCreatedAtDesc(category, pageable);
    }

    // Note. boardList - 전체 게시글 목록을 페이지네이션으로 조회한다.
    @Transactional(readOnly = true)
    public Page<Board> boardList(Pageable pageable) {
        return boardRepository.findAll(pageable);
    }

    // Note. boardSearchList - "검색어"(제목 기반)를 기반으로 게시글을 조회한다.
    @Transactional(readOnly = true)
    public Page<Board> boardSearchList(String searchKeyword, Pageable pageable) {
        return boardRepository.findByTitleContaining(searchKeyword, pageable);
    }

    // Note. boardSearchListByCategory - 특정한 카테고리 내부에서 검색어로 게시글을 조회한다.
    @Transactional(readOnly = true)
    public Page<Board> boardSearchListByCategory(Category category, String searchKeyword, Pageable pageable) {
        return boardRepository.findByCategoryAndTitleContaining(category, searchKeyword, pageable);
    }

    // Note. boardListPopular - 전체 게시판 인기글을 조회한다.(조회수 기반)
    @Transactional(readOnly = true)
    public Page<Board> boardListPopular(Pageable pageable) {
        return boardRepository.findAllOrderByViewsDescCreatedAtDesc(pageable);
    }

    // Note. boardListPopularByCategory - 특정 카테고리 내부 인기글을 조회한다. (조회수 기반)
    @Transactional(readOnly = true)
    public Page<Board> boardListPopularByCategory(Category category, Pageable pageable) {
        return boardRepository.findByCategoryOrderByViewsDescCreatedAtDesc(category, pageable);
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

    // Note. boardDelete - 포스트 ID로 게시글 삭제
    // ... 삭제는 관리자만 가능하며 권한 체크는 BorderController에서 진행한다.
    @Transactional
    public void boardDelete(Long id) {
        if (!boardRepository.existsById(id)) {
            throw new RuntimeException("게시글을 찾을 수 없습니다: " + id);
        }
        boardRepository.deleteById(id);
    }
}
