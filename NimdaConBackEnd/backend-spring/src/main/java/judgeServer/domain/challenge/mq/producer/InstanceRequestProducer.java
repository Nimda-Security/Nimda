package judgeServer.domain.challenge.mq.producer;

import judgeServer.domain.challenge.entity.Challenge;
import judgeServer.domain.challenge.mq.message.InstanceResultMessage;

/**
 * CTF 문제 인스턴스 생성 요청을 큐에 넣는 발행자.
 */
public interface InstanceRequestProducer {

    /**
     * 문제 인스턴스 생성 요청을 큐에 발행한다. 상관 ID는 이 메서드가 만든다.
     *
     * @param challenge 컨테이너가 필요한 문제
     * @param userId    요청한 사용자
     * @return 이 요청의 상관 ID(requestId). 나중에 결과({@link InstanceResultMessage})와 짝지을 때 쓴다.
     */
    String requestCreate(Challenge challenge, Long userId);

    /**
     * 상관 ID를 호출자가 정해서 발행한다.
     *
     * <p>발행 전에 그 ID로 뭔가를 먼저 기록해 둬야 하는 경우(예: userId:challengeId → requestId 매핑)
     * 호출자가 ID를 먼저 쥐고 있어야 하므로 이 형태를 쓴다.
     *
     * @param requestId 호출자가 만든 상관 ID
     * @return 넘겨받은 requestId 그대로
     */
    String requestCreate(Challenge challenge, Long userId, String requestId);
}
