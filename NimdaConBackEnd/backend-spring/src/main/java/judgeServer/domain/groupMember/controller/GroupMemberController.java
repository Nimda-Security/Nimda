package judgeServer.domain.groupMember.controller;

import com.nimda.cite.common.response.ApiResponse;
import com.nimda.cite.user.security.CustomUserDetails;
import jakarta.persistence.EntityNotFoundException;
import judgeServer.domain.groupMember.dto.GroupMemberResponse;
import judgeServer.domain.groupMember.service.GroupMemberService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/groups/{groupId}/members")
public class GroupMemberController {

    @Autowired
    private GroupMemberService groupMemberService;

    @GetMapping
    public ResponseEntity<?> getMembers(@PathVariable Long groupId) {
        try {
            List<GroupMemberResponse> members = groupMemberService.getMembers(groupId);

            return ApiResponse.ok("그룹 멤버 목록을 성공적으로 조회하였습니다.", members)
                    .toResponse(HttpStatus.OK);

        } catch (Exception e) {
            return ApiResponse.fail("멤버 목록 조회 중 오류가 발생하였습니다.")
                    .toResponse(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/me")
    public ResponseEntity<?> leave(
            @PathVariable Long groupId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        try {
            Long userId = userDetails.getUser().getId();
            groupMemberService.leave(groupId, userId);

            return ApiResponse.ok("그룹에서 탈퇴하였습니다.", null)
                    .toResponse(HttpStatus.OK);
        } catch (Exception e) {
            return ApiResponse.fail("그룹 탈퇴 중 오류가 발생하였습니다.")
                    .toResponse(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/{targetUserId}")
    public ResponseEntity<?> kick(
            @PathVariable Long groupId,
            @PathVariable Long targetUserId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        try {
            Long leaderId = userDetails.getUser().getId();
            groupMemberService.kick(groupId, leaderId, targetUserId);

            return ApiResponse.ok("해당 멤버를 그룹에서 강퇴하였습니다.", null)
                    .toResponse(HttpStatus.OK);
        } catch (Exception e) {
            return ApiResponse.fail("멤버 강퇴 중 오류가 발생하였습니다.")
                    .toResponse(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // 그룹장 위임 (기존 그룹장 -> targetUserId). 위임 후 기존 그룹장은 leave 가능
    @PatchMapping("/{targetUserId}/leader")
    public ResponseEntity<?> transferLeadership(
            @PathVariable Long groupId,
            @PathVariable Long targetUserId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        try {
            Long currentLeaderId = userDetails.getUser().getId();
            groupMemberService.transferLeadership(groupId, currentLeaderId, targetUserId);

            return ApiResponse.ok("그룹장 권한을 위임하였습니다.", null)
                    .toResponse(HttpStatus.OK);
        } catch (EntityNotFoundException e) {
            return ApiResponse.fail(e.getMessage()).toResponse(HttpStatus.NOT_FOUND);
        } catch (AccessDeniedException e) {
            return ApiResponse.fail(e.getMessage()).toResponse(HttpStatus.FORBIDDEN);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ApiResponse.fail(e.getMessage()).toResponse(HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return ApiResponse.fail("그룹장 위임 중 오류가 발생하였습니다.")
                    .toResponse(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}
