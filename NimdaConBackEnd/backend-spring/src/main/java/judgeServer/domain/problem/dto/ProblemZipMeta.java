package judgeServer.domain.problem.dto;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProblemZipMeta {
    private String name;
    private String group;
    private String url;
    private int memoryLimit;   // 단일 숫자를 바로 받도록 수정
    private Double timeLimit;
}
