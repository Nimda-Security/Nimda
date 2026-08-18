package judgeServer.domain.challenge.controller;

import com.nimda.cite.common.response.ApiResponse;
import com.nimda.cite.user.security.CustomUserDetails;
import judgeServer.domain.challenge.dto.ChallengeDetailResponse;
import judgeServer.domain.challenge.dto.ChallengeSummaryResponse;
import judgeServer.domain.challenge.entity.Challenge;
import judgeServer.domain.challenge.repository.ChallengeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

/**
 * 참가자가 문제를 보는 조회 API (읽기 전용).
 *
 * <pre>
 *   GET /api/ctf/challenges         -> 공개된 문제 목록
 *   GET /api/ctf/challenges/{code}  -> 문제 상세
 * </pre>
 *
 * <p>등록/삭제/공개전환은 관리자용 {@link ChallengeController}(단수 경로 {@code /api/ctf/challenge})에
 * 있다. 조회를 복수 경로로 분리한 것은 시큐리티 규칙 때문이다. 단수 경로에는 "POST/DELETE는
 * 관리자만"이 걸려 있어서, 참가자용 조회를 같은 경로에 두면 규칙이 서로 얽힌다.
 *
 * <p>비공개(초안) 문제는 관리자에게만 보인다. 코드만 알면 열람되는 일이 없도록, 없는 문제와
 * 같은 404로 답한다.
 */
@RestController
@RequestMapping("/api/ctf/challenges")
@RequiredArgsConstructor
public class ChallengeQueryController {

    private final ChallengeRepository challengeRepository;

    /** 문제 목록. 관리자는 초안까지 함께 본다. */
    @GetMapping
    public ResponseEntity<?> list(@AuthenticationPrincipal CustomUserDetails user) {
        List<Challenge> challenges = isAdmin(user)
                ? challengeRepository.findAllByOrderByIdAsc()
                : challengeRepository.findByIsPublicTrueOrderByIdAsc();

        return ApiResponse.ok(challenges.stream().map(ChallengeSummaryResponse::from).toList())
                .toResponse();
    }

    /** 문제 상세. */
    @GetMapping("/{code}")
    public ResponseEntity<?> detail(@PathVariable String code,
                                    @AuthenticationPrincipal CustomUserDetails user) {
        Challenge challenge = challengeRepository.findByCode(code)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "존재하지 않는 문제입니다."));

        if (!Boolean.TRUE.equals(challenge.getIsPublic()) && !isAdmin(user)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "존재하지 않는 문제입니다.");
        }
        return ApiResponse.ok(ChallengeDetailResponse.from(challenge)).toResponse();
    }

    private boolean isAdmin(CustomUserDetails user) {
        if (user == null) {
            return false;
        }
        return user.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch("ROLE_ADMIN"::equals);
    }
}
