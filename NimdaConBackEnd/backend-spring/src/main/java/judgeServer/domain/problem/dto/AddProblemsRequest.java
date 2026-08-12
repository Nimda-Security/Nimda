package judgeServer.domain.problem.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddProblemsRequest {

    private String code;
    private String title;
    private String description;
    private Float timeLimit;
    private Integer memoryLimit;
    @NotNull(message = "점수 입력은 필수입니다.")
    private Integer points;
    private MultipartFile zipFile;
    @NotNull(message = "공개 여부는 필수입니다.")
    private Boolean isPublic;
}
