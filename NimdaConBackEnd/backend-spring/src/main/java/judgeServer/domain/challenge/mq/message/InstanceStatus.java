package judgeServer.domain.challenge.mq.message;

/**
 * 인스턴스 생성 요청의 처리 결과 상태 (Go 조율자 → 웹 백엔드).
 */
public enum InstanceStatus {
    /** 컨테이너가 떠서 포트가 열렸고, 사용자가 접근할 수 있는 상태. host/port가 채워진다. */
    READY,

    /** 생성에 실패한 상태. message에 사유가 담기고 host/port는 비어 있다. */
    FAILED
}
