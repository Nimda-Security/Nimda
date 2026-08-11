package judgeServer.domain.challenge.enums;

// 컨테이너를 가동 여부
public enum IsolationType {
    // 포렌식, 리버싱, 암호학 같이 다운로드만 해야 하는 경우
    NONE,

    // 읽기만 가능한 웹해킹 문제 같이 컨테이너를 다른 유저들이 공유하는 경우
    SHARED,

    // 구조가 동적으로 바뀌는 포너블 같이 프로세스를 유저마다 제공해야 하는 경우
    PER_USER
}
