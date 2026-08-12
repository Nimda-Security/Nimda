package judgeServer.domain.problem.dto;

import judgeServer.domain.problem.entity.Problem;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class ProblemListResponse {
    private Long id;
    private String title;
    private Integer points;
    private LocalDateTime createdAt;
    private String code;

    public static ProblemListResponse from(Problem problem) {

        return ProblemListResponse.builder()
                .id(problem.getId())
                .title(problem.getTitle())
                .points(problem.getPoints())
                .createdAt(problem.getCreatedAt())
                .code(problem.getCode())
                .build();
    }
}
