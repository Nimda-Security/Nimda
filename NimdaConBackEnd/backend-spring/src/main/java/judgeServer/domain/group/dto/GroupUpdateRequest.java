package judgeServer.domain.group.dto;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class GroupUpdateRequest {

    @NotBlank(message = "그룹 이름을 입력해주세요.")
    @Size(max = 50)
    private String name;

    @NotNull(message = "최대 인원을 입력해주세요.")
    @Min(1) @Max(15)
    private Integer capacity;

    @Size(max = 200, message = "설명은 200자 이내로 입력해주세요.")
    private String description;

}
