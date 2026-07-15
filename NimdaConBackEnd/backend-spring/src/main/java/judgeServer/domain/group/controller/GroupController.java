package judgeServer.domain.group.controller;

import com.nimda.cite.common.response.ApiResponse;
import com.nimda.cite.user.security.CustomUserDetails;
import jakarta.validation.Valid;
import judgeServer.domain.group.dto.GroupCreateRequest;
import judgeServer.domain.group.dto.GroupDetailResponse;
import judgeServer.domain.group.dto.GroupListResponse;
import judgeServer.domain.group.dto.GroupUpdateRequest;
import judgeServer.domain.group.service.GroupService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/groups")
public class GroupController {

    @Autowired
    private GroupService groupService;

    @PostMapping
    public ResponseEntity<?> createGroup(
            @Valid @RequestBody GroupCreateRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        try {
            Long userId = userDetails.getUser().getId();
            GroupDetailResponse response = groupService.createGroup(userId, request);

            return ApiResponse.ok("그룹이 성공적으로 생성되었습니다.",
                    Map.of("group", response)).toResponse(HttpStatus.CREATED);

        } catch(Exception e) {
            return ApiResponse.fail("그룹 생성 중 오류가 발생하였습니다.")
                    .toResponse(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping
    public ResponseEntity<?> getGroups(
            @RequestParam(required = false) String keyword
    ) {
        try {
            List<GroupListResponse> groups = (keyword == null || keyword.isBlank())
                    ? groupService.getAllGroups()
                    : groupService.searchGroups(keyword);

            return ApiResponse.ok("그룹 목록을 성공적으로 조회하였습니다.",
                    Map.of("groups", groups)).toResponse(HttpStatus.OK);
        } catch (Exception e) {
            return ApiResponse.fail("그룹 목록 조회 중 오류가 발생하였습니다.")
                    .toResponse(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/{groupId}")
    public ResponseEntity<?> getGroup(@PathVariable Long groupId) {
        try {
            GroupDetailResponse response = groupService.getGroup(groupId);
            return ApiResponse.ok("그룹을 성공적으로 조회하였습니다.",
                    Map.of("group", response)).toResponse(HttpStatus.CREATED);

        } catch (Exception e) {
            return ApiResponse.fail("그룹 조회 중 오류가 발생하였습니다.")
                    .toResponse(HttpStatus.INTERNAL_SERVER_ERROR);

        }
    }

    @PatchMapping("/{groupId}")
    public ResponseEntity<?> updateGroup(
            @PathVariable Long groupId,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody GroupUpdateRequest request
    ) {
        try {
            Long userId = userDetails.getUser().getId();
            groupService.updateGroup(groupId, userId, request);

            return ApiResponse.ok("그룹이 성공적으로 수정되었습니다.", null)
                    .toResponse(HttpStatus.OK);

        } catch (Exception e) {
            return ApiResponse.fail("그룹 수정 중 오류가 발생하였습니다.")
                    .toResponse(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/{groupId}")
    public ResponseEntity<?> deleteGroup(
            @PathVariable Long groupId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        try {
            Long userId = userDetails.getUser().getId();
            groupService.deleteGroup(groupId, userId);

            return ApiResponse.ok("그룹이 성공적으로 삭제되었습니다.").toResponse();

        } catch (Exception e) {
            return ApiResponse.fail("그룹 삭제 중 오류가 발생하였습니다.")
                    .toResponse(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


}
