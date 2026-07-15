package judgeServer.domain.problem.dto;

import jakarta.validation.constraints.NotBlank;
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
    private Integer points;
    private MultipartFile zipFile;
    private Boolean isPublic = true;
}
