package judgeServer.domain.problem.dto;

import judgeServer.domain.problem.entity.Problem;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ViewProblemsResponse {
    private String title;
    private String description;
    private Double timeLimit;
    private Double memoryLimit;
    private Integer points;
    private LocalDateTime createdAt;

    public static ViewProblemsResponse from(Problem problem) {
        return ViewProblemsResponse.builder()
                .title(problem.getTitle())
                .description(problem.getDescription())
                .timeLimit(problem.getTimeLimit())
                .memoryLimit(problem.getTimeLimit())
                .points(problem.getPoints())
                .createdAt(problem.getCreatedAt())
                .build();
    }
}
