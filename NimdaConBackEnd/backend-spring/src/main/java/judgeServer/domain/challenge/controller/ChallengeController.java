package judgeServer.domain.challenge.controller;

import com.nimda.cite.common.response.ApiResponse;
import jakarta.validation.Valid;
import judgeServer.domain.challenge.dto.AddChallengeRequest;
import judgeServer.domain.challenge.entity.Challenge;
import judgeServer.domain.challenge.service.ChallengeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ctf/challenge")
@RequiredArgsConstructor
public class ChallengeController {

    private final ChallengeService challengeService;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createChallenge(@ModelAttribute @Valid AddChallengeRequest request) {
        Challenge challenge = challengeService.addChallenge(request);

        // 플래그 해시가 섞여 나가지 않도록 식별자만 돌려준다.
        return ApiResponse.ok(challenge.getId()).toResponse();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/toggle-public/{id}")
    public ResponseEntity<?> toggleIsPublic(@PathVariable Long id) {
        return ApiResponse.ok(challengeService.toggleIsPublic(id)).toResponse();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteChallenge(@PathVariable Long id) {
        challengeService.deleteChallenge(id);
        return ApiResponse.ok("삭제가 완료되었습니다.").toResponse();
    }
}
