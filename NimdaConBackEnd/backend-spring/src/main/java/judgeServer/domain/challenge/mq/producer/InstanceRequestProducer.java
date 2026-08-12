package judgeServer.domain.challenge.mq.producer;

import judgeServer.domain.challenge.entity.Challenge;
import judgeServer.domain.challenge.mq.message.InstanceResultMessage;

/**
 * CTF 문제 인스턴스 생성 요청을 큐에 넣는 발행자.
 */
public interface InstanceRequestProducer {

    /**
     * 문제 인스턴스 생성 요청을 큐에 발행한다.
     *
     * @param challenge 컨테이너가 필요한 문제
     * @param userId    요청한 사용자
     * @return 이 요청의 상관 ID(requestId). 나중에 결과({@link InstanceResultMessage})와 짝지을 때 쓴다.
     */
    String requestCreate(Challenge challenge, Long userId);
}
