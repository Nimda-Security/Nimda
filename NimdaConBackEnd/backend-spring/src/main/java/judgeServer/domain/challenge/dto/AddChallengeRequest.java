package judgeServer.domain.challenge.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import judgeServer.domain.challenge.enums.ChallengeCategory;
import judgeServer.domain.challenge.enums.FlagType;
import judgeServer.domain.challenge.enums.IsolationType;
import lombok.*;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddChallengeRequest {

    /**
     * 문제 고유 식별자. S3 키(challenges/{code}/{code}.zip)에 그대로 들어가므로
     * 경로로 해석될 수 있는 문자를 막는다.
     */
    @NotBlank(message = "문제 코드는 필수입니다.")
    @Pattern(regexp = "^[a-zA-Z0-9_-]{1,50}$",
            message = "문제 코드는 영문/숫자/-/_ 만 사용할 수 있습니다.")
    private String code;

    @NotBlank(message = "제목은 필수입니다.")
    private String title;

    @NotBlank(message = "설명은 필수입니다.")
    private String description;

    @NotNull(message = "분류는 필수입니다.")
    private ChallengeCategory category;

    /** 미지정 시 엔티티 기본값(100)을 쓴다. */
    private Integer points;

    /** 미지정 시 STATIC */
    private FlagType flagType;

    /** STATIC일 때만 필수. 저장은 해시로만 하고 원문은 남기지 않는다. */
    private String flag;

    /** 미지정 시 NONE */
    private IsolationType isolationType;

    /** 문제 파일 묶음. 첨부가 없는 문제는 비워둘 수 있다. */
    private MultipartFile zipFile;

    @NotNull(message = "공개 여부는 필수입니다.")
    private Boolean isPublic;
}
