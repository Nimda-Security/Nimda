package judgeServer.domain.challenge.instance.ObjectStatus;

// 요청에 대한 인스턴스 상태
public enum Status {
    /** 인스턴스 준비 완료 */
    READY,
    /** 인스턴스 생성에 대한 결과가 도착하지 않음 */
    PENDING,
    /** 인스턴스 생성 실패 */
    FAILED
}
