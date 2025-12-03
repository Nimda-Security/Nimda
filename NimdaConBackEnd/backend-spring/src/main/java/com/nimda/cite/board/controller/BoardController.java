package com.nimda.cite.board.controller;

/**
 * ========================================
 * BoardController.java
 * ========================================
 * 
 * [기존 게시판 코드 기준]
 * - 엔드포인트: /api/board → /api/cite/board로 변경
 * - 응답 형식: Page<Board>, Board, String → Map<String, Object>로 변경
 * - 반환 타입: String "success" → ResponseEntity<Map<String, Object>>로 변경
 * - 패키지: com.Board.Board.controller → com.nimda.cite.board.controller
 * 
 * [현재 프로젝트 통합 사항]
 * 1. 응답 형식: Map<String, Object> (success, message, data 포함) - 현재 프로젝트 스타일
 * 2. BoardType 필터링 파라미터 추가 (게시판 타입별 조회)
 * 3. User 작성자 정보 처리 (JWT 토큰에서 추출)
 * 4. 예외 처리: 현재 프로젝트 스타일 적용 (try-catch, Map 응답)
 * 5. ID 타입: Long으로 변경
 * 
 * [주요 변경점]
 * - 기존: @GetMapping → return Page<Board>
 * - 현재: @GetMapping → return ResponseEntity<Map<String, Object>>
 * - 기존: @PostMapping → return "success"
 * - 현재: @PostMapping → return ResponseEntity<Map<String, Object>>
 * - 기존: 작성자 정보 없음
 * - 현재: JWT 토큰에서 작성자 정보 추출
 * ========================================
 */

import com.nimda.cite.board.entity.Board;
import com.nimda.cite.board.enums.BoardType;
import com.nimda.cite.board.service.BoardService;
import com.nimda.cup.common.util.JwtUtil;
import com.nimda.cup.user.entity.User;
import com.nimda.cup.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/cite/board")  // [수정] /api/board → /api/cite/board
@CrossOrigin(origins = "*")
public class BoardController {

    @Autowired
    private BoardService boardService;

    @Autowired
    private JwtUtil jwtUtil;  // [신규] JWT 토큰 처리용

    @Autowired
    private UserRepository userRepository;  // [신규] User 조회용

    // ========== [통합 포인트 #1] ==========
    /**
     * 게시판 타입별 게시글 리스트 조회 API
     * 
     * [기존 코드]
     * - 엔드포인트: GET /api/board
     * - 파라미터: Pageable pageable, String searchKeyword (optional)
     * - 반환 타입: Page<Board>
     * - 기능: 모든 게시글 조회 또는 검색
     * 
     * [수정 사항]
     * - 엔드포인트: GET /api/cite/board
     * - 파라미터: BoardType boardType (필수), String searchKeyword (optional), Pageable pageable
     * - 반환 타입: ResponseEntity<Map<String, Object>>
     * - 기능: 게시판 타입별 조회 또는 타입별 검색
     * - 이유: 게시판 타입별 필터링 기능 추가, 현재 프로젝트 응답 형식 적용
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getPostsByBoardType(
            @RequestParam BoardType boardType,  // [신규] 게시판 타입 필터링 (필수)
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,  // [기존 유지] 검색어 (선택)
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable  // [기존 유지] 페이지네이션
    ) {
        try {
            Page<Board> boards;

            // ========== [기존 로직 유지 + 확장] ==========
            // [기존] 검색어가 없으면 전체 조회, 있으면 검색
            // [수정] 검색어가 없으면 타입별 조회, 있으면 타입별 검색
            if (searchKeyword == null || searchKeyword.isEmpty()) {
                // [신규] 게시판 타입별 조회
                boards = boardService.boardListByBoardType(boardType, pageable);
            } else {
                // [신규] 게시판 타입별 + 검색 조합
                boards = boardService.boardSearchListByBoardType(boardType, searchKeyword, pageable);
            }

            // ========== [통합 포인트 #2] ==========
            // [기존] return boards;  // Page<Board> 직접 반환
            // [수정] Map<String, Object> 응답 형식으로 변경 (현재 프로젝트 스타일)
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "게시글 목록을 성공적으로 조회했습니다.");
            response.put("posts", boards.getContent());
            response.put("totalElements", boards.getTotalElements());
            response.put("totalPages", boards.getTotalPages());
            response.put("currentPage", boards.getNumber());
            response.put("boardType", boardType);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            // ========== [통합 포인트 #3] ==========
            // [기존] 예외 처리 없음
            // [수정] 현재 프로젝트 스타일의 예외 처리 (Map 응답)
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "게시글 목록 조회 중 오류가 발생했습니다: " + e.getMessage());

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // ========== [기존 코드 유지 + 수정] ==========
    /**
     * 게시글 등록 API
     * 
     * [기존 코드]
     * - 엔드포인트: POST /api/board
     * - 파라미터: String title, String content, MultipartFile file (optional)
     * - 반환 타입: String "success"
     * - 기능: 게시글 작성
     * 
     * [수정 사항]
     * - 엔드포인트: POST /api/cite/board
     * - 파라미터: BoardType boardType (신규), String title, String content, MultipartFile file (optional), Authorization header (JWT)
     * - 반환 타입: ResponseEntity<Map<String, Object>>
     * - 기능: 게시글 작성 (작성자 정보 추가, BoardType 설정)
     * - 이유: 작성자 정보 관리, 게시판 타입 설정, 현재 프로젝트 응답 형식 적용
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> write(
            @RequestHeader(value = "Authorization", required = false) String authHeader,  // [신규] JWT 토큰
            @RequestParam("boardType") BoardType boardType,  // [신규] 게시판 타입
            @RequestParam("title") String title,  // [기존 유지]
            @RequestParam("content") String content,  // [기존 유지]
            @RequestPart(value = "file", required = false) MultipartFile file  // [기존 유지] 파일 업로드
    ) {
        try {
            // ========== [통합 포인트 #4] ==========
            // [기존] 작성자 정보 없음
            // [수정] JWT 토큰에서 작성자 정보 추출 (현재 프로젝트 스타일)
            User author = null;
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7); // "Bearer " 제거
                try {
                    Long userId = jwtUtil.extractUserId(token);
                    if (userId != null && !jwtUtil.isTokenExpired(token)) {
                        author = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다: " + userId));
                    }
                } catch (Exception e) {
                    // 토큰이 유효하지 않으면 익명 사용자로 처리
                }
            }

            // 작성자가 없으면 에러 반환 (선택사항: 익명 사용자 허용 가능)
            if (author == null) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "로그인이 필요합니다.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
            }

            // ========== [기존 로직 유지] ==========
            // [기존] Board 객체 생성 및 설정
            Board board = new Board();
            board.setTitle(title);
            board.setContent(content);
            board.setBoardType(boardType);  // [신규] 게시판 타입 설정

            // ========== [기존 로직 유지] ==========
            // [기존] 게시글 작성 처리 (파일 업로드 포함)
            boardService.write(board, author, file);  // [수정] author 파라미터 추가

            // ========== [통합 포인트 #5] ==========
            // [기존] return "success";  // String 직접 반환
            // [수정] Map<String, Object> 응답 형식으로 변경 (현재 프로젝트 스타일)
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "게시글이 성공적으로 작성되었습니다.");
            response.put("board", board);

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (Exception e) {
            // ========== [통합 포인트 #6] ==========
            // [기존] 예외 처리 없음
            // [수정] 현재 프로젝트 스타일의 예외 처리 (Map 응답)
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "게시글 작성 중 오류가 발생했습니다: " + e.getMessage());

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // ========== [기존 코드 유지 + 수정] ==========
    /**
     * 게시글 상세 조회 API
     * 
     * [기존 코드]
     * - 엔드포인트: GET /api/board/{id}
     * - 파라미터: Integer id
     * - 반환 타입: Board
     * - 기능: 게시글 상세 조회
     * 
     * [수정 사항]
     * - 엔드포인트: GET /api/cite/board/{id}
     * - 파라미터: Long id
     * - 반환 타입: ResponseEntity<Map<String, Object>>
     * - 기능: 게시글 상세 조회 (응답 형식 변경)
     * - 이유: 현재 프로젝트 응답 형식 적용
     */
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> view(@PathVariable("id") Long id) {  // [수정] Integer → Long
        try {
            // ========== [기존 로직 유지] ==========
            // [기존] 게시글 조회
            Board board = boardService.boardView(id);

            // ========== [통합 포인트 #7] ==========
            // [기존] return board;  // Board 직접 반환
            // [수정] Map<String, Object> 응답 형식으로 변경 (현재 프로젝트 스타일)
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "게시글을 성공적으로 조회했습니다.");
            response.put("board", board);

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            // ========== [통합 포인트 #8] ==========
            // [기존] 예외 처리 없음
            // [수정] 현재 프로젝트 스타일의 예외 처리 (Map 응답)
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());

            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "게시글 조회 중 오류가 발생했습니다: " + e.getMessage());

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // ========== [기존 코드 유지 + 수정] ==========
    /**
     * 게시글 수정 API
     * 
     * [기존 코드]
     * - 엔드포인트: PUT /api/board/{id}
     * - 파라미터: Integer id, String title, String content, MultipartFile file (optional)
     * - 반환 타입: String "success"
     * - 기능: 게시글 수정
     * 
     * [수정 사항]
     * - 엔드포인트: PUT /api/cite/board/{id}
     * - 파라미터: Long id, BoardType boardType (신규), String title, String content, MultipartFile file (optional), Authorization header (JWT)
     * - 반환 타입: ResponseEntity<Map<String, Object>>
     * - 기능: 게시글 수정 (작성자 권한 확인, BoardType 수정 가능)
     * - 이유: 작성자 권한 확인, 게시판 타입 수정, 현재 프로젝트 응답 형식 적용
     */
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> update(
            @RequestHeader(value = "Authorization", required = false) String authHeader,  // [신규] JWT 토큰
            @PathVariable("id") Long id,  // [수정] Integer → Long
            @RequestParam("boardType") BoardType boardType,  // [신규] 게시판 타입
            @RequestParam("title") String title,  // [기존 유지]
            @RequestParam("content") String content,  // [기존 유지]
            @RequestPart(value = "file", required = false) MultipartFile file  // [기존 유지] 파일 업로드
    ) {
        try {
            // ========== [기존 로직 유지] ==========
            // [기존] 게시글 조회
            Board boardTemp = boardService.boardView(id);

            // ========== [통합 포인트 #9] ==========
            // [기존] 작성자 권한 확인 없음
            // [수정] 작성자 권한 확인 (현재 프로젝트 스타일)
            User currentUser = null;
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                try {
                    Long userId = jwtUtil.extractUserId(token);
                    if (userId != null && !jwtUtil.isTokenExpired(token)) {
                        currentUser = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다: " + userId));
                    }
                } catch (Exception e) {
                    // 토큰이 유효하지 않으면 에러 반환
                }
            }

            // 작성자 권한 확인 (선택사항: 관리자는 수정 가능하도록 확장 가능)
            if (currentUser == null || !boardTemp.getAuthor().getId().equals(currentUser.getId())) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "게시글을 수정할 권한이 없습니다.");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
            }

            // ========== [기존 로직 유지] ==========
            // [기존] 게시글 정보 수정
            boardTemp.setTitle(title);
            boardTemp.setContent(content);
            boardTemp.setBoardType(boardType);  // [신규] 게시판 타입 수정

            // ========== [기존 로직 유지] ==========
            // [기존] 게시글 수정 처리 (파일 업로드 포함)
            boardService.write(boardTemp, currentUser, file);  // [수정] author 파라미터 추가

            // ========== [통합 포인트 #10] ==========
            // [기존] return "success";  // String 직접 반환
            // [수정] Map<String, Object> 응답 형식으로 변경 (현재 프로젝트 스타일)
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "게시글이 성공적으로 수정되었습니다.");
            response.put("board", boardTemp);

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());

            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "게시글 수정 중 오류가 발생했습니다: " + e.getMessage());

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // ========== [기존 코드 유지 + 수정] ==========
    /**
     * 게시글 삭제 API
     * 
     * [기존 코드]
     * - 엔드포인트: DELETE /api/board/{id}
     * - 파라미터: Integer id
     * - 반환 타입: void (200 OK 응답)
     * - 기능: 게시글 삭제
     * 
     * [수정 사항]
     * - 엔드포인트: DELETE /api/cite/board/{id}
     * - 파라미터: Long id, Authorization header (JWT)
     * - 반환 타입: ResponseEntity<Map<String, Object>>
     * - 기능: 게시글 삭제 (작성자 권한 확인)
     * - 이유: 작성자 권한 확인, 현재 프로젝트 응답 형식 적용
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> delete(
            @RequestHeader(value = "Authorization", required = false) String authHeader,  // [신규] JWT 토큰
            @PathVariable("id") Long id  // [수정] Integer → Long
    ) {
        try {
            // ========== [기존 로직 유지] ==========
            // [기존] 게시글 조회
            Board board = boardService.boardView(id);

            // ========== [통합 포인트 #11] ==========
            // [기존] 작성자 권한 확인 없음
            // [수정] 작성자 권한 확인 (현재 프로젝트 스타일)
            User currentUser = null;
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                try {
                    Long userId = jwtUtil.extractUserId(token);
                    if (userId != null && !jwtUtil.isTokenExpired(token)) {
                        currentUser = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다: " + userId));
                    }
                } catch (Exception e) {
                    // 토큰이 유효하지 않으면 에러 반환
                }
            }

            // 작성자 권한 확인 (선택사항: 관리자는 삭제 가능하도록 확장 가능)
            if (currentUser == null || !board.getAuthor().getId().equals(currentUser.getId())) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "게시글을 삭제할 권한이 없습니다.");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
            }

            // ========== [기존 로직 유지] ==========
            // [기존] 게시글 삭제
            boardService.boardDelete(id);

            // ========== [통합 포인트 #12] ==========
            // [기존] 반환 없음 (200 OK 응답)
            // [수정] Map<String, Object> 응답 형식으로 변경 (현재 프로젝트 스타일)
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "게시글이 성공적으로 삭제되었습니다.");

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());

            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "게시글 삭제 중 오류가 발생했습니다: " + e.getMessage());

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}

