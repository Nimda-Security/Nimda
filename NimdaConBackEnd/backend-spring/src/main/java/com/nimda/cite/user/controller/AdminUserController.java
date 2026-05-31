package com.nimda.cite.user.controller;

import com.nimda.cite.domain.board.service.BoardService;
import com.nimda.cite.user.dto.AdminUserDetailResponseDTO;
import com.nimda.cite.user.dto.AdminUserListResponseDTO;
import com.nimda.cite.user.dto.UserSuggestionResponseDTO;
import com.nimda.cite.user.entity.Authority;
import com.nimda.cite.user.entity.User;
import com.nimda.cite.user.enums.ApprovalStatus;
import com.nimda.cite.user.service.AdminUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 관리자용 사용자 관리 컨트롤러
 *
 * [역할]
 * - 사용자 승인/거부
 * - 승인 대기 사용자 목록 조회
 * - 모든 사용자 조회
 *
 * [보안]
 * - 클래스 레벨: @PreAuthorize("hasRole('ADMIN')")로 관리자 권한 체크
 * - SecurityConfig: /api/admin/** 패턴으로 관리자 권한 설정
 */
@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private static final Logger log = LoggerFactory.getLogger(AdminUserController.class);

    @Autowired
    private AdminUserService adminUserService;

    @Autowired
    private BoardService boardService;

    /**
     * 모든 사용자 조회
     *
     * @return 사용자 목록
     */
    @GetMapping
    public ResponseEntity<?> getAllUsers() {
        try {
            List<User> users = adminUserService.findAll();

            List<AdminUserListResponseDTO> dtoList = users.stream()
                    .map(user -> AdminUserListResponseDTO.builder()
                            .id(user.getId())
                            .nickname(user.getNickname())
                            .email(user.getEmail())
                            .createdAt(user.getCreatedAt())
                            .build())
                    .collect(Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("users", dtoList);

            return ResponseEntity.ok(response);
        }

        catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "사용자 목록 조회 중 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * 승인 대기 사용자 목록 조회
     *
     * @return 승인 대기 사용자 목록
     */
    @GetMapping("/pending")
    public ResponseEntity<?> getPendingUsers() {
        try {
            List<User> pendingUsers = adminUserService.findByStatus(ApprovalStatus.PENDING);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("users", pendingUsers);
            response.put("count", pendingUsers.size());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "승인 대기 사용자 목록 조회 중 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * 사용자 승인
     * - status를 APPROVED로 변경
     * - ROLE_USER 권한 부여
     *
     * @param id 사용자 ID
     * @return 승인된 사용자 정보
     */
    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveUser(@PathVariable Long id) {
        try {
            User approvedUser = adminUserService.approveUser(id);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "사용자가 승인되었습니다.");
            response.put("user", approvedUser);

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("사용자 승인 중 오류 발생", e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "사용자 승인 중 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            log.error("사용자 승인 중 예기치 않은 오류 발생", e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "사용자 승인 중 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * 사용자 거부
     * - status를 REJECTED로 변경
     *
     * @param id 사용자 ID
     * @return 거부된 사용자 정보
     */
    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectUser(@PathVariable Long id) {
        try {
            User rejectedUser = adminUserService.rejectUser(id);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "사용자 승인이 거부되었습니다.");
            response.put("user", rejectedUser);

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("사용자 거부 중 오류 발생", e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "사용자 거부 중 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            log.error("사용자 거부 중 예기치 않은 오류 발생", e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "사용자 거부 중 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * 서버에 등록된 전체 권한 목록 조회
     */
    @GetMapping("/roles")
    public ResponseEntity<?> getAvailableRoles() {
        try {
            List<String> roles = adminUserService.findAllRoleNames();

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("roles", roles);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "권한 목록 조회 중 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * 사용자 권한 1개를 추가 부여
     */
    @PutMapping("/{id}/role")
    public ResponseEntity<?> grantRole(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        try {
            String role = request != null ? request.get("role") : null;
            User updatedUser = adminUserService.grantRole(id, role);

            List<String> assignedRoles = updatedUser.getAuthorities().stream()
                    .map(a -> a.getAuthorityName())
                    .toList();

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "권한이 부여되었습니다.");
            response.put("roles", assignedRoles);

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("권한 부여 중 오류 발생", e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "권한 부여 중 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            log.error("권한 부여 중 예기치 않은 오류 발생", e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "권한 부여 중 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * 사용자 권한 1개 제거
     */
    @PutMapping("/{id}/role/remove")
    public ResponseEntity<?> revokeRole(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        try {
            String role = request != null ? request.get("role") : null;
            User updatedUser = adminUserService.revokeRole(id, role);

            List<String> assignedRoles = updatedUser.getAuthorities().stream()
                    .map(a -> a.getAuthorityName())
                    .toList();

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "권한이 제거되었습니다.");
            response.put("roles", assignedRoles);

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("권한 제거 중 오류 발생", e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "권한 제거 중 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            log.error("권한 제거 중 예기치 않은 오류 발생", e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "권한 제거 중 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * 특정 사용자 상세 조회
     * 
     * @param id 사용자 ID
     * @return 사용자 정보
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        try {
            User user = adminUserService.findById(id);

            AdminUserDetailResponseDTO detailDTO = AdminUserDetailResponseDTO.builder()
                    .id(user.getId())
                    .userId(user.getUserId())
                    .name(user.getName())
                    .nickname(user.getNickname())
                    .email(user.getEmail())
                    .studentNum(user.getStudentNum())
                    .major(user.getMajor())
                    .birth(user.getBirth())
                    .status(user.getStatus())
                    .createdAt(user.getCreatedAt())
                    .updatedAt(user.getUpdatedAt())

                    .roles(user.getAuthorities().stream()
                            .map(Authority::getAuthorityName)
                            .collect(Collectors.toList()))

                    .profileImage(user.getProfileImage())
                    .profileDecoration(user.getProfileDecoration())
                    .build();

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("user", detailDTO);

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("사용자 조회 중 오류 발생", e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } catch (Exception e) {
            log.error("사용자 조회 중 예기치 않은 오류 발생", e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "사용자 조회 중 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PostMapping("/tag-delete/{tag}")
    public ResponseEntity<?> deleteTag(@PathVariable String tag) {
        try {
            return ResponseEntity.status(HttpStatus.OK).body(tag);

        }catch(RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "태그 제거 중 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * 마일리지 유저 추천 목록
     */
    @GetMapping("/suggestions")
    public ResponseEntity<?> getUserSuggestions() {
        try {
            // 1. 서비스 레이어에서 전체 유저(학생) 목록을 조회합니다.
            List<User> users = adminUserService.findAll();

            // 2. 스트림을 이용해 학번과 이름만 담긴 전용 DTO 리스트로 변환합니다.
            List<UserSuggestionResponseDTO> dtoList = users.stream()
                    .map(user -> UserSuggestionResponseDTO.builder()
                            .studentNum(user.getStudentNum())
                            .name(user.getNickname())
                            .build())
                    .collect(Collectors.toList());

            // 3. 기존 포맷과 동일하게 Map을 활용하여 성공 응답을 구성합니다.
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("users", dtoList);

            return ResponseEntity.ok(response);
        }

        catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "학생 목록 조회 중 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}

