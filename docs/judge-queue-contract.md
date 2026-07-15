# 채점 큐 계약 (Producer → Consumer)

nimda 백엔드(`backend-spring`)가 producer, 채점 서버(MSA, 별도 스택 미정)가 consumer인
producer-consumer 큐. 브로커는 기존 인프라의 Redis를 Stream으로 사용한다 (`XADD` / `XREADGROUP`).

## 1. 연결 정보

기존 `nimda-redis` 컨테이너(docker-compose)를 그대로 사용한다. 채점 서버는 같은
`nimda-network`에 컨테이너로 붙거나, `SPRING_REDIS_HOST` / `REDIS_PASSWORD`와 동일한 값으로
접속하면 된다.

| 항목 | 값 | 비고 |
|---|---|---|
| Stream Key | `judge:submissions` | `JUDGE_QUEUE_STREAM_KEY` 로 오버라이드 가능 |
| Consumer Group | `judge-workers` | `JUDGE_QUEUE_CONSUMER_GROUP` 로 오버라이드 가능 |

Consumer Group은 producer(backend-spring)가 기동 시 `XGROUP CREATE ... MKSTREAM` 으로
미리 만들어 둔다 (`judgeServer.config.JudgeQueueConfig`). 채점 서버는 그룹을 새로 만들 필요 없이
바로 `XREADGROUP GROUP judge-workers <consumer-name> ...` 로 읽으면 된다.

## 2. 메시지 스키마 (Stream 필드)

`XADD judge:submissions * submissionId ... problemId ...` 형태로, 값은 모두 문자열이다.

| 필드 | 타입 | 설명 |
|---|---|---|
| `submissionId` | Long | 채점 결과 콜백 시 그대로 돌려줘야 하는 식별자 |
| `problemId` | Long | 문제 ID |
| `userId` | Long | 제출자 ID |
| `language` | String | `JAVA` / `PYTHON3` / `CPP` / `C` (`judgeServer.domain.submission.enums.SupportedLanguage`) |
| `sourceCode` | String | 제출 소스 코드 원문 |
| `timeLimitSeconds` | Double | 문제의 시간 제한(초) |
| `memoryLimitMb` | Integer | 문제의 메모리 제한(MB) |
| `submittedAt` | String (ISO_LOCAL_DATE_TIME) | 제출 시각 |

Java 쪽 정의: `judgeServer.domain.submission.mq.SubmissionMessage`.

## 3. 채점 서버가 해야 할 일 (consumer, 아직 미구현)

1. `XREADGROUP` 으로 `judge:submissions` 스트림을 소비.
2. 소스 코드를 언어별로 컴파일/실행하여 채점.
3. 채점이 끝나면 아래 콜백 API를 호출.
4. 처리 성공 시 `XACK` 으로 확인 응답 (재시도/장애 시 `XPENDING` + `XCLAIM` 으로 미확인 메시지 재처리).

큐 자체는 재시도 횟수 제한이나 DLQ가 없으므로, 반복 실패하는 메시지를 무한 재처리하지 않도록
consumer 쪽에서 재시도 횟수를 세고 임계치를 넘으면 실패로 콜백하는 로직이 필요하다.

## 4. 결과 콜백 (이미 구현되어 있음)

채점이 끝나면 채점 서버가 nimda 백엔드에 아래 API를 호출한다.

```
POST /api/judge/submission/result
Content-Type: application/json

{
  "submissionId": 123,
  "status": "ACCEPTED",
  "executionTimeMs": 120,
  "usedMemoryKb": 15360,
  "errorMessage": null
}
```

- `status`: `judgeServer.domain.submission.enums.SubmissionStatus`
  (`PENDING`, `JUDGING`, `ACCEPTED`, `WRONG_ANSWER`, `TIME_LIMIT_EXCEEDED`,
  `MEMORY_LIMIT_EXCEEDED`, `COMPILE_ERROR`, `RUNTIME_ERROR`)
- 구현: `judgeServer.domain.submission.controller.SubmissionController#updateResult`,
  `judgeServer.domain.submission.service.SubmissionService#updateJudgeResult`

## 5. 현재까지 만들어진 것 / 아직 없는 것

- [x] Producer: 제출(`SubmissionService#submit`) 시 `judge:submissions` 스트림에 발행
      (`judgeServer.domain.submission.mq.RedisSubmissionProducer`)
- [x] Consumer Group 사전 생성 (`judgeServer.config.JudgeQueueConfig`)
- [x] 결과 콜백 API (`POST /api/judge/submission/result`)
- [ ] Consumer(채점 서버) 자체 — 스택 미정, 별도 서비스로 신규 구현 필요
- [ ] Stream 트리밍(`XTRIM`) — 아직 무제한 증가하므로 운영 전 추가 필요
- [ ] 실패/재시도/DLQ 정책 — consumer 구현 시 함께 설계 필요