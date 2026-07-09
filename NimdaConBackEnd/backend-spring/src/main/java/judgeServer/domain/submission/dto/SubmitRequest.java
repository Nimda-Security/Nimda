package judgeServer.domain.submission.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class SubmitRequest {
    @NotNull(message = "문제 번호가 입력되지 않았습니다.")
    private Long problemId;
    @NotBlank(message = "언어가 선택되지 않았습니다.")
    private String language;
    @NotBlank(message = "코드를 입력해주세요.")
    private String sourceCode;
}
