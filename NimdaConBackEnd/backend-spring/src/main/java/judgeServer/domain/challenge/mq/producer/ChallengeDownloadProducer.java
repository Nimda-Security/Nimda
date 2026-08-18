package judgeServer.domain.challenge.mq.producer;

import judgeServer.domain.challenge.entity.Challenge;
import judgeServer.domain.challenge.mq.message.ChallengeDownloadResultMessage;

/**
 * 문제 첨부파일 다운로드 링크 발급 요청을 큐에 넣는 발행자.
 */
public interface ChallengeDownloadProducer {

    /**
     * 다운로드 링크 발급 요청을 큐에 발행한다.
     *
     * @param challenge 첨부파일이 있는 문제
     * @param userId    요청한 사용자
     * @return 이 요청의 상관 ID(requestId). 결과({@link ChallengeDownloadResultMessage})와 짝지을 때 쓴다.
     */
    String requestDownload(Challenge challenge, Long userId);
}
