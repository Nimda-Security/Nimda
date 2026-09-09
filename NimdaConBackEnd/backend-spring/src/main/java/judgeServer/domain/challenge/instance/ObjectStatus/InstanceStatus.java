package judgeServer.domain.challenge.instance.ObjectStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
public class InstanceStatus {
    private String errorMessage;   // FAILED 시 failure 원인
    private Status status;
    private String resultUrl;      // SUCCESS 시 접속할 프록시/포트 URL
}
