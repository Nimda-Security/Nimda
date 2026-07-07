package judgeServer.domain.problem.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class AddProblemsRequest {
    private String code;
    private String title;
    private String description;
    private Double timeLimit;
    private Integer memoryLimit;
    private Integer points;
    private Boolean isPublic = false;
}
