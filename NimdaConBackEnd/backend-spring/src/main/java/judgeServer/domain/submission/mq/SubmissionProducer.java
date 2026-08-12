package judgeServer.domain.submission.mq;

/**
 * 채점 요청을 큐에 발행하는 producer.
 * 실제 채점(consumer)은 별도 MSA 서버에서 이 큐를 구독해 처리하고,
 * 결과는 POST /api/judge/submission/result 로 콜백한다.
 */
public interface SubmissionProducer {

    void publish(SubmissionMessage message);
}