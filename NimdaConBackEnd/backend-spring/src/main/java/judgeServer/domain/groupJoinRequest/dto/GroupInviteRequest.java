package judgeServer.domain.groupJoinRequest.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class GroupInviteRequest {

    @NotNull
    private Long userId;
}