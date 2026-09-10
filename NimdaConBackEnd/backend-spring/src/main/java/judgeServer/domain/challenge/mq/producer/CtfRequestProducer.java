package judgeServer.domain.challenge.mq.producer;

import judgeServer.domain.challenge.entity.Challenge;

/**
 * CTF 서버(Go 조율자)로 요청을 보내는 발행자.
 */
public interface CtfRequestProducer {

    /**
     * 요청을 큐에 발행한다.
     * @param challenge 대상 문제
     * @param userId    요청한 사용자 (매핑 기록용, 스트림에는 안 나감)
     * @param uuid      호출자가 만든 이 요청의 식별자
     * @return 넘겨받은 uuid 그대로
     */
    String request(Challenge challenge, Long userId, String uuid);
}
