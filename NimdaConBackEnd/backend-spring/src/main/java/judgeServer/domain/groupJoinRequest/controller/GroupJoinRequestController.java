package judgeServer.domain.groupJoinRequest.controller;

import com.nimda.cite.common.response.ApiResponse;
import com.nimda.cite.user.security.CustomUserDetails;
import judgeServer.domain.groupJoinRequest.service.GroupJoinRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/groups/{groupId}/join-requests")
public class GroupJoinRequestController {

    @Autowired
    private GroupJoinRequestService groupJoinRequestService;

    // 가입 신청
    @PostMapping("/apply")
    public ResponseEntity<?> apply(
            @PathVariable Long groupId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        try {
            Long userId = userDetails.getUser().getId();
            Long requestId = groupJoinRequestService.applyToGroup(groupId, userId);

            return ApiResponse.ok("가입 신청이 완료되었습니다.",
                            Map.of("requestId", requestId)).toResponse(HttpStatus.CREATED);

        } catch (Exception e) {
            return ApiResponse.fail("가입 신청 중 오류가 발생하였습니다.")
                    .toResponse(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // 초대
    @PostMapping("/invite")
    public ResponseEntity<?> invite(
            @PathVariable Long groupId,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam Long inviteeId
    ) {
        try {
            Long inviterId = userDetails.getUser().getId();
            Long requestId = groupJoinRequestService.inviteToGroup(groupId, inviterId, inviteeId);

            return ApiResponse.ok("초대가 완료되었습니다.",
                            Map.of("requestId", requestId)).toResponse(HttpStatus.CREATED);

        } catch (Exception e) {
            return ApiResponse.fail("초대 처리 중 오류가 발생하였습니다.")
                    .toResponse(HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }

    // 대기중인 요청 목록 (그룹장이 신청 목록 확인)
    @GetMapping
    public ResponseEntity<?> getPendingRequests(
            @PathVariable Long groupId
    ) {
        try {
            return ApiResponse.ok("신청 목록을 성공적으로 조회하였습니다.",
                            Map.of("requests", groupJoinRequestService.getPendingRequestsOfGroup(groupId)))
                    .toResponse(HttpStatus.OK);
        } catch (Exception e) {
            return ApiResponse.fail("목록 조회 중 오류가 발생하였습니다.")
                    .toResponse(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // 수락
    @PostMapping("/{requestId}/accept")
    public ResponseEntity<?> accept(
            @PathVariable Long groupId,
            @PathVariable Long requestId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        try {
            Long userId = userDetails.getUser().getId();
            groupJoinRequestService.accept(requestId, userId);

            return ApiResponse.ok("가입 요청을 수락하였습니다.").toResponse(HttpStatus.OK);

        } catch (Exception e) {
            return ApiResponse.fail("요청 수락 중 오류가 발생하였습니다.")
                    .toResponse(HttpStatus.INTERNAL_SERVER_ERROR);
            }
    }

    // 거절
    @PostMapping("/{requestId}/reject")
    public ResponseEntity<?> reject(
            @PathVariable Long groupId,
            @PathVariable Long requestId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        try {
            Long userId = userDetails.getUser().getId();
            groupJoinRequestService.reject(requestId, userId);

            return ApiResponse.ok("가입 요청을 거절하였습니다.")
                    .toResponse(HttpStatus.OK);
        } catch (Exception e) {
            return ApiResponse.fail("요청 거절 중 오류가 발생하였습니다.")
                    .toResponse(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // 취소 (신청자 본인)
    @DeleteMapping("/{requestId}")
    public ResponseEntity<?> cancel(
            @PathVariable Long groupId,
            @PathVariable Long requestId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        try {
            Long userId = userDetails.getUser().getId();
            groupJoinRequestService.cancel(requestId, userId);

            return ApiResponse.ok("신청을 취소하였습니다.").toResponse(HttpStatus.OK);

        } catch (Exception e) {
            return ApiResponse.fail("신청 취소 중 오류가 발생하였습니다.")
                    .toResponse(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


}
