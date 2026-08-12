package judgeServer.domain.submission.dto;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class UserProblemStatusResponse {
    // 맞춘 문제 번호 목록
    private List<Long> solvedProblems;

    // 시도했지만 틀린 문제 번호 목록
    private List<Long> incorrectProblems;

}
