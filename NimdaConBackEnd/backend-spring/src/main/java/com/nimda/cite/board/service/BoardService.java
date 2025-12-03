package com.nimda.cite.board.service;

/**
 * ========================================
 * BoardService.java
 * ========================================
 * 
 * [기존 게시판 코드 기준]
 * - 파일 업로드 로직: 유지 (UUID 방식)
 * - 게시글 CRUD: 기본 구조 유지
 * - 패키지: com.Board.Board.service → com.nimda.cite.board.service
 * 
 * [현재 프로젝트 통합 사항]
 * 1. BoardType 필터링 로직 추가 (boardListByBoardType)
 * 2. User 작성자 정보 처리 (write 메서드에 User 파라미터 추가)
 * 3. 검색 + 타입 필터링 조합 지원 (boardSearchListByBoardType)
 * 4. ID 타입: Long으로 변경
 * 5. @Transactional 어노테이션 추가 (현재 프로젝트 스타일)
 * 
 * [주요 변경점]
 * - 기존: boardList(Pageable) → 모든 게시글
 * - 현재: boardListByBoardType(BoardType, Pageable) → 타입별 게시글
 * - 기존: write(Board, MultipartFile) → 작성자 정보 없음
 * - 현재: write(Board, User, MultipartFile) → 작성자 정보 추가
 * ========================================
 */

import com.nimda.cite.board.entity.Board;
import com.nimda.cite.board.enums.BoardType;
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

    // ========== [통합 포인트 #1] ==========
    /**
     * 게시글 작성 처리
     * 
     * [기존 코드]
     * - 메서드: write(Board board, MultipartFile file)
     * - 작성자 정보: 없음
     * 
     * [수정 사항]
     * - 메서드: write(Board board, User author, MultipartFile file)
     * - 작성자 정보: User author 파라미터 추가
     * - BoardType 설정: board.getBoardType() 사용
     * - 이유: 현재 프로젝트 User 엔티티 사용, 작성자 정보 관리
     */
    @Transactional
    public void write(Board board, User author, MultipartFile file) throws Exception {

        // ========== [기존 코드 유지] ==========
        // [기존] 파일 업로드 로직 - 변경 없음 (UUID 방식 유지)
        if (file != null && !file.isEmpty()) {
            String uploadDir = System.getProperty("user.home") + "/board-uploads"; // 외부 디렉토리

            File directory = new File(uploadDir);
            if (!directory.exists()) {
                directory.mkdirs(); // 경로 없으면 자동 생성
            }

            // 저장할 경로 지정
            UUID uuid = UUID.randomUUID();
            // 파일 이름을 붙힐 랜덤 이름 생성
            String fileName = uuid + "_" + file.getOriginalFilename();

            File saveFile = new File(uploadDir, fileName);
            // File 이라는 클래스를 이용해서 빈 껍데기를 생성하여 경로와 파일이름 지정
            file.transferTo(saveFile);

            board.setFilename(fileName);
            board.setFilepath("/api/download/" + fileName);
        }

        // ========== [통합 포인트 #2] ==========
        // [기존] 없음
        // [신규] 작성자 정보 설정 (현재 프로젝트 User 엔티티 사용)
        board.setAuthor(author);

        // ========== [기존 코드 유지] ==========
        // [기존] 게시글 저장 - 변경 없음
        boardRepository.save(board);
    }

    // ========== [통합 포인트 #3] ==========
    /**
     * 게시판 타입별 게시글 리스트 처리
     * 
     * [기존 코드]
     * - 메서드: boardList(Pageable pageable)
     * - 기능: 모든 게시글 조회
     * 
     * [수정 사항]
     * - 메서드: boardListByBoardType(BoardType boardType, Pageable pageable)
     * - 기능: 특정 게시판 타입별 조회 (NEWS, ACADEMIC, COMMUNITY 등)
     * - 이유: 게시판 타입별 필터링 기능 추가
     */
    @Transactional(readOnly = true)
    public Page<Board> boardListByBoardType(BoardType boardType, Pageable pageable) {
        // [신규] BoardType으로 필터링하여 조회
        return boardRepository.findByBoardType(boardType, pageable);
    }

    // ========== [기존 코드 유지] ==========
    /**
     * 모든 게시글 리스트 처리 (기존 메서드 유지 - 필요시 사용)
     * 
     * [기존 코드]
     * - 메서드: boardList(Pageable pageable)
     * - 기능: 모든 게시글 조회
     * 
     * [현재]
     * - 메서드: boardList(Pageable pageable) - 유지
     * - 기능: 모든 게시글 조회 (BoardType 필터링 없음)
     */
    @Transactional(readOnly = true)
    public Page<Board> boardList(Pageable pageable) {
        // [기존] findAll 메서드 사용 - 변경 없음
        return boardRepository.findAll(pageable);
    }

    // ========== [기존 코드 유지] ==========
    /**
     * 게시글 검색 리스트 처리 (기존 메서드 유지)
     * 
     * [기존 코드]
     * - 메서드: boardSearchList(String searchKeyword, Pageable pageable)
     * - 기능: 제목에 검색어가 포함된 게시글 조회
     * 
     * [현재]
     * - 메서드: boardSearchList(String searchKeyword, Pageable pageable) - 유지
     * - 기능: 제목에 검색어가 포함된 게시글 조회 (BoardType 필터링 없음)
     */
    @Transactional(readOnly = true)
    public Page<Board> boardSearchList(String searchKeyword, Pageable pageable) {
        // [기존] findByTitleContaining 메서드 사용 - 변경 없음
        return boardRepository.findByTitleContaining(searchKeyword, pageable);
    }

    // ========== [통합 포인트 #4] ==========
    /**
     * 게시판 타입별 + 검색 조합 리스트 처리
     * 
     * [기존 코드]
     * - 없음
     * 
     * [신규 추가]
     * - 메서드: boardSearchListByBoardType(BoardType boardType, String searchKeyword, Pageable pageable)
     * - 기능: 특정 게시판 타입별 + 제목 검색 조합
     * - 이유: 게시판 타입별 검색 기능 지원
     */
    @Transactional(readOnly = true)
    public Page<Board> boardSearchListByBoardType(BoardType boardType, String searchKeyword, Pageable pageable) {
        // [신규] BoardType + 검색어 조합 메서드 사용
        return boardRepository.findByBoardTypeAndTitleContaining(boardType, searchKeyword, pageable);
    }

    // ========== [기존 코드 유지] ==========
    /**
     * 특정 게시글 불러오기
     * 
     * [기존 코드]
     * - 메서드: boardView(Integer id)
     * - 반환 타입: Board
     * 
     * [수정 사항]
     * - 메서드: boardView(Long id) - ID 타입만 변경
     * - 반환 타입: Board - 유지
     * - 예외 처리: Optional 처리 (기존과 동일)
     */
    @Transactional(readOnly = true)
    public Board boardView(Long id) {  // [수정] Integer → Long
        // [기존] findById 메서드 사용 - 변경 없음
        return boardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다: " + id));
    }

    // ========== [기존 코드 유지] ==========
    /**
     * 특정 게시글 삭제
     * 
     * [기존 코드]
     * - 메서드: boardDelete(Integer id)
     * 
     * [수정 사항]
     * - 메서드: boardDelete(Long id) - ID 타입만 변경
     * - 기능: 게시글 삭제 - 변경 없음
     */
    @Transactional
    public void boardDelete(Long id) {  // [수정] Integer → Long
        // [기존] deleteById 메서드 사용 - 변경 없음
        if (!boardRepository.existsById(id)) {
            throw new RuntimeException("게시글을 찾을 수 없습니다: " + id);
        }
        boardRepository.deleteById(id);
    }
}

