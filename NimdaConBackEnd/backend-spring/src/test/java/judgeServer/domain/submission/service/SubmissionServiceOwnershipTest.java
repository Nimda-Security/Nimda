package judgeServer.domain.submission.service;

import judgeServer.domain.submission.dto.SubDetailResponse;
import judgeServer.domain.submission.entity.Submission;
import judgeServer.domain.submission.repository.SubmissionRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

/**
 * P0-3 회귀 테스트: 제출 상세(소스코드) 조회 권한 검증.
 *
 * <p>수정 전에는 소유자 검증이 없어, 로그인한 아무 사용자가 submissionId 를
 * 증가시켜가며 타인의 제출 소스코드를 전부 수집할 수 있었다(대회 부정행위/표절).
 */
@ExtendWith(MockitoExtension.class)
class SubmissionServiceOwnershipTest {

    private static final long OWNER_ID = 100L;
    private static final long ATTACKER_ID = 999L;
    private static final long SUBMISSION_ID = 42L;

    @Mock
    private SubmissionRepository submissionRepository;

    @InjectMocks
    private SubmissionService submissionService;

    private Submission ownedSubmission() {
        return Submission.builder()
                .problemId(1L)
                .problemTitle("A+B")
                .userId(OWNER_ID)
                .language("java")
                .sourceCode("class Main { /* 비밀 소스코드 */ }")
                .build();
    }

    @Test
    @DisplayName("P0-3: 제출자 본인은 자신의 소스코드를 조회할 수 있다")
    void ownerCanReadOwnSubmission() {
        when(submissionRepository.findById(SUBMISSION_ID))
                .thenReturn(Optional.of(ownedSubmission()));

        SubDetailResponse dto =
                submissionService.getSubmitDetail(SUBMISSION_ID, OWNER_ID, false);

        assertThat(dto).isNotNull();
    }

    @Test
    @DisplayName("P0-3: 타인의 제출 소스코드는 조회할 수 없다 (404)")
    void otherUserCannotReadSubmission() {
        when(submissionRepository.findById(SUBMISSION_ID))
                .thenReturn(Optional.of(ownedSubmission()));

        assertThatThrownBy(() ->
                submissionService.getSubmitDetail(SUBMISSION_ID, ATTACKER_ID, false))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(ex -> assertThat(((ResponseStatusException) ex).getStatusCode())
                        .isEqualTo(HttpStatus.NOT_FOUND));
    }

    @Test
    @DisplayName("P0-3: 관리자는 타인의 제출 소스코드를 조회할 수 있다")
    void adminCanReadAnySubmission() {
        when(submissionRepository.findById(SUBMISSION_ID))
                .thenReturn(Optional.of(ownedSubmission()));

        SubDetailResponse dto =
                submissionService.getSubmitDetail(SUBMISSION_ID, ATTACKER_ID, true);

        assertThat(dto).isNotNull();
    }
}
