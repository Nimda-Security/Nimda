package judgeServer.domain.problem.dto;

import com.google.api.client.util.DateTime;
import judgeServer.domain.problem.entity.Problem;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.ZoneId;

@Getter
@Builder
@AllArgsConstructor
public class ProblemListResponse {
    private Long id;
    private String title;
    private Integer points;
    private DateTime createdAt;
    private String code;

    public static ProblemListResponse from(Problem problem) {

        // LocalDateTime -> DateTime
        LocalDateTime localDateTime = problem.getCreatedAt();
        long millis = localDateTime.atZone(ZoneId.systemDefault())
                .toInstant()
                .toEpochMilli();
        DateTime dateTime = new DateTime(millis);

        return ProblemListResponse.builder()
                .id(problem.getId())
                .title(problem.getTitle())
                .points(problem.getPoints())
                .createdAt(dateTime)
                .code(problem.getCode())
                .build();
    }
}
