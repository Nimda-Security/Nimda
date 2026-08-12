package judgeServer.domain.problem.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class SearchProblemRequest {
    private String title;
    private String code;
}
