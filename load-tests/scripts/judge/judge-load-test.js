import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// 커스텀 메트릭
const errorRate = new Rate('errors');
const judgeSuccessRate = new Rate('judge_success');
const submissionTime = new Trend('submission_time');
const judgeTime = new Trend('judge_time');
const submissionCount = new Counter('submissions_total');
const rankingViewCount = new Counter('ranking_views_total');

// 테스트 설정 - 보고서 기반 보수적 접근
// 실제 대회: 20명, 7팀, 2시간, 46회 채점, 360회 랭킹 조회
// 참고: 7팀이 제출하는 구조 (팀당 약 3명)
export const options = {
  stages: [
    // 1단계: 실제 대회 규모 재현 (7팀 = 7개 VU)
    // VU는 팀을 시뮬레이션: 각 VU가 팀 단위로 제출/조회
    { duration: '1m', target: 2 },      // 1분 동안 2팀까지 증가
    { duration: '2m', target: 4 },      // 2분 동안 4팀까지 증가
    { duration: '3m', target: 7 },      // 3분 동안 7팀까지 증가 (실제 대회 규모)
    { duration: '2m', target: 7 },      // 2분 동안 7팀 유지
    
    // 2단계: 점진적 부하 증가 (CPU 70% 도달 지점 측정 목표)
    { duration: '1m', target: 10 },     // 1분 동안 10팀까지 증가
    { duration: '2m', target: 10 },     // 2분 동안 10팀 유지
    { duration: '1m', target: 15 },     // 1분 동안 15팀까지 증가
    { duration: '2m', target: 15 },     // 2분 동안 15팀 유지
    { duration: '1m', target: 20 },     // 1분 동안 20팀까지 증가
    { duration: '2m', target: 20 },     // 2분 동안 20팀 유지
    
    // 3단계: 안전하게 감소
    { duration: '1m', target: 10 },     // 1분 동안 10팀으로 감소
    { duration: '1m', target: 5 },      // 1분 동안 5팀으로 감소
    { duration: '30s', target: 0 },     // 30초 동안 0팀으로 감소
  ],
  thresholds: {
    http_req_duration: ['p(95)<15000'],  // 95% 요청이 15초 이내 (보수적)
    http_req_failed: ['rate<0.1'],       // 실패율 10% 이하 (보수적)
    judge_success: ['rate>0.7'],         // 채점 성공률 70% 이상
    submission_time: ['p(95)<12000'],    // 제출 응답 시간 12초 이내
  },
};

// 서버 설정 (환경변수로 변경 가능)
const BASE_URL = __ENV.BASE_URL || 'http://localhost:80';
const API_BASE = `${BASE_URL}/api`;

// 다양한 테스트 코드들
const TEST_CODES = [
  // A + B (Java)
  {
    problemId: 1,
    language: 'Java',
    code: `import java.util.Scanner;
public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int a = sc.nextInt();
        int b = sc.nextInt();
        System.out.println(a + b);
    }
}`,
    expected: 'ACCEPTED'
  },
  // A + B (C++17)
  {
    problemId: 1,
    language: 'C++17',
    code: `#include <iostream>
using namespace std;
int main() {
    int a, b;
    cin >> a >> b;
    cout << a + b << endl;
    return 0;
}`,
    expected: 'ACCEPTED'
  },
  // Hello World (Java)
  {
    problemId: 2,
    language: 'Java',
    code: `public class Solution {
    public static void main(String[] args) {
        System.out.println("Hello World");
    }
}`,
    expected: 'ACCEPTED'
  },
  // Hello World (C++17)
  {
    problemId: 2,
    language: 'C++17',
    code: `#include <iostream>
using namespace std;
int main() {
    cout << "Hello World" << endl;
    return 0;
}`,
    expected: 'ACCEPTED'
  },
  // 컴파일 에러 (세미콜론 누락)
  {
    problemId: 1,
    language: 'C++17',
    code: `#include <iostream>
using namespace std;
int main() {
    int a, b
    cin >> a >> b;
    cout << a + b << endl;
    return 0;
}`,
    expected: 'COMPILATION_ERROR'
  },
  // 틀린 답 (곱셈으로 잘못 계산)
  {
    problemId: 1,
    language: 'C++17',
    code: `#include <iostream>
using namespace std;
int main() {
    int a, b;
    cin >> a >> b;
    cout << a * b << endl;
    return 0;
}`,
    expected: 'WRONG_ANSWER'
  },
  // 시간 초과 가능성 (무한 루프)
  {
    problemId: 1,
    language: 'C++17',
    code: `#include <iostream>
using namespace std;
int main() {
    while(true) {
        // 무한 루프
    }
    return 0;
}`,
    expected: 'TIME_LIMIT_EXCEEDED'
  }
];

// 랜덤 문제 ID 생성 (1-5 범위, 실제 대회 문제 수 고려)
function getRandomProblemId() {
  return Math.floor(Math.random() * 5) + 1;
}

// 실제 대회 시나리오: 채점 요청과 랭킹 조회 비율
// 보고서: 46회 채점, 360회 랭킹 조회 (약 1:8 비율)
// 참고: 7팀이 46회 제출 = 팀당 평균 약 6.6회 제출
// 팀 단위로 생각하면: 1팀이 제출하고, 여러 번 랭킹 조회
const JUDGE_TO_RANKING_RATIO = 1 / 8; // 채점 1회당 랭킹 조회 8회

// 팀별 제출 빈도: 실제 대회에서 7팀이 2시간(120분) 동안 46회 제출 = 팀당 평균 6.6회
// 2시간(120분) 동안 팀당 약 6.6회 = 약 18분마다 1회 제출
// 하지만 집중 시간대(19:45~19:54, 9분간)에는 더 빈번하게 제출
// 보수적으로 5~10분 간격으로 제출 시도
const TEAM_SUBMISSION_INTERVAL = 300; // 팀당 평균 5분(300초)마다 제출 시도

// 팀별 상태 관리 (각 VU는 하나의 팀을 시뮬레이션)
let teamLastSubmissionTime = 0;

export default function () {
  const now = Date.now();
  const timeSinceLastSubmission = now - teamLastSubmissionTime;
  const random = Math.random();
  
  // 팀 단위 제출 로직: 일정 시간 간격으로 제출 시도
  // 실제 대회: 7팀이 90분 동안 46회 제출 = 팀당 평균 5~7분마다 1회
  const shouldSubmit = timeSinceLastSubmission >= TEAM_SUBMISSION_INTERVAL || 
                       (timeSinceLastSubmission >= 180 && random < 0.3); // 최소 3분 후 30% 확률
  
  // 채점 요청 (팀 단위 제출)
  if (shouldSubmit) {
    // 랜덤하게 테스트 코드 선택
    const testCase = TEST_CODES[Math.floor(Math.random() * TEST_CODES.length)];
    const problemId = testCase.problemId || getRandomProblemId();
  
  // 코드 제출
  const submitPayload = JSON.stringify({
    title: `Problem ${problemId}`,
    code: testCase.code,
    language: testCase.language,
    problemId: problemId
  });

  const submitParams = {
    headers: {
      'Content-Type': 'application/json',
    },
    tags: { name: 'judge_submit' },
  };

  const submitStartTime = Date.now();
  
  const submitResponse = http.post(
    `${API_BASE}/judge/submit`,
    submitPayload,
    submitParams
  );

  const submitDuration = Date.now() - submitStartTime;
  submissionTime.add(submitDuration);
  submissionCount.add(1);

  // 제출 응답 검증
  const submitSuccess = check(submitResponse, {
    'submit status is 200': (r) => r.status === 200,
    'submit response time < 20s': (r) => r.timings.duration < 20000, // 보수적
    'response is JSON': (r) => {
      try {
        JSON.parse(r.body);
        return true;
      } catch (e) {
        return false;
      }
    },
    'response contains result': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.result !== undefined || body.status !== undefined;
      } catch (e) {
        return false;
      }
    },
  });

  let judgeResult = null;
  let judgeSuccess = false;
  let responseBody = null;
  
  if (submitResponse.status === 200) {
    try {
      responseBody = JSON.parse(submitResponse.body);
      judgeResult = responseBody.result || responseBody;
      
      // 채점 결과 검증
      const status = judgeResult?.status || responseBody.status;
      judgeSuccess = check({ status }, {
        'judge completed': () => {
          return status !== undefined && status !== 'SYSTEM_ERROR';
        },
        'judge status is valid': () => {
          const validStatuses = [
            'ACCEPTED', 'WRONG_ANSWER', 'TIME_LIMIT_EXCEEDED',
            'MEMORY_LIMIT_EXCEEDED', 'RUNTIME_ERROR', 'COMPILATION_ERROR',
            'PENDING', 'JUDGING'
          ];
          return validStatuses.includes(status);
        }
      });
      
      judgeSuccessRate.add(judgeSuccess);
      
      // 채점 완료 시간 기록
      if (judgeResult && judgeResult.executionTime !== undefined) {
        judgeTime.add(judgeResult.executionTime);
      }
      
    } catch (e) {
      console.error(`[VU ${__VU}, Iter ${__ITER}] Failed to parse submit response:`, e);
      judgeSuccessRate.add(false);
    }
  } else {
    console.error(`[VU ${__VU}, Iter ${__ITER}] Submit failed with status ${submitResponse.status}`);
    judgeSuccessRate.add(false);
  }

    errorRate.add(!submitSuccess);
    
    // 팀이 제출한 시간 기록
    teamLastSubmissionTime = now;
    
    // 채점 후 대기 시간 (팀이 결과 확인 후 다음 작업)
    sleep(5 + Math.random() * 10); // 5~15초 대기 (팀 단위이므로 더 긴 간격)
    
  } else {
    // 랭킹 조회 (팀이 스코어보드 확인)
    // 실제 대회: 360회 랭킹 조회 / 7팀 = 팀당 약 51회
    // 2시간(120분) 동안 팀당 51회 = 약 2.4분(140초)마다 1회 조회
    const rankingResponse = http.get(
      `${API_BASE}/scoreboard`,
      { tags: { name: 'ranking_view' } }
    );
    
    rankingViewCount.add(1);
    
    check(rankingResponse, {
      'ranking status is 200': (r) => r.status === 200,
      'ranking response time < 2s': (r) => r.timings.duration < 2000,
    });
    
    // 랭킹 조회 후 대기 (팀이 스코어보드 확인하는 시간)
    sleep(2 + Math.random() * 3); // 2~5초 대기
  }
}

// 테스트 완료 후 실행되는 함수
export function handleSummary(data) {
  const metrics = data.metrics;
  
  // 실제 대회 데이터와 비교
  const actualContestSubmissions = 46;
  const actualContestRankingViews = 360;
  const testSubmissions = metrics.submissions_total ? metrics.submissions_total.values.count : 0;
  const testRankingViews = metrics.ranking_views_total ? metrics.ranking_views_total.values.count : 0;
  
  return {
    'results/judge-load-test-summary.json': JSON.stringify(data, null, 2),
    stdout: `
⚖️ 채점 서버 부하 테스트 결과 (보고서 기반 보수적 접근)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 실제 대회 데이터 비교:
  실제 대회: ${actualContestSubmissions}회 채점, ${actualContestRankingViews}회 랭킹 조회
  테스트 실행: ${testSubmissions}회 채점, ${testRankingViews}회 랭킹 조회
  비율: ${testSubmissions > 0 ? ((testSubmissions / actualContestSubmissions) * 100).toFixed(1) : 0}% (채점), ${testRankingViews > 0 ? ((testRankingViews / actualContestRankingViews) * 100).toFixed(1) : 0}% (랭킹)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📈 HTTP 요청 통계:
  - 총 요청 수: ${metrics.http_reqs.values.count}
  - 평균 응답 시간: ${metrics.http_req_duration.values.avg.toFixed(2)}ms
  - 중앙값 응답 시간: ${metrics.http_req_duration.values.med.toFixed(2)}ms
  - 95% 응답 시간: ${metrics.http_req_duration.values['p(95)'].toFixed(2)}ms
  - 99% 응답 시간: ${metrics.http_req_duration.values['p(99)'].toFixed(2)}ms
  - 최대 응답 시간: ${metrics.http_req_duration.values.max.toFixed(2)}ms
  - 최소 응답 시간: ${metrics.http_req_duration.values.min.toFixed(2)}ms

📉 제출 통계:
  - 총 제출 수: ${testSubmissions}회
  - 평균 제출 시간: ${metrics.submission_time ? metrics.submission_time.values.avg.toFixed(2) : 'N/A'}ms
  - 95% 제출 시간: ${metrics.submission_time ? metrics.submission_time.values['p(95)'].toFixed(2) : 'N/A'}ms

⚡ 채점 통계:
  - 평균 채점 시간: ${metrics.judge_time ? metrics.judge_time.values.avg.toFixed(2) : 'N/A'}ms
  - 95% 채점 시간: ${metrics.judge_time ? metrics.judge_time.values['p(95)'].toFixed(2) : 'N/A'}ms

📊 랭킹 조회 통계:
  - 총 랭킹 조회 수: ${testRankingViews}회

❌ 에러 통계:
  - HTTP 실패율: ${(metrics.http_req_failed.values.rate * 100).toFixed(2)}%
  - 전체 에러율: ${metrics.errors ? (metrics.errors.values.rate * 100).toFixed(2) : 'N/A'}%
  - 채점 성공률: ${metrics.judge_success ? (metrics.judge_success.values.rate * 100).toFixed(2) : 'N/A'}%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ 성능 목표 달성 여부:
  ${metrics.http_req_duration.values['p(95)'] < 15000 ? '✅' : '❌'} 95% 요청이 15초 이내
  ${metrics.http_req_failed.values.rate < 0.1 ? '✅' : '❌'} 실패율 10% 이하
  ${metrics.judge_success && metrics.judge_success.values.rate > 0.7 ? '✅' : '❌'} 채점 성공률 70% 이상
  ${metrics.submission_time && metrics.submission_time.values['p(95)'] < 12000 ? '✅' : '❌'} 제출 응답 시간 12초 이내

📝 테스트 설정:
  - 서버 URL: ${BASE_URL}
  - 최대 동시 팀 수: 20팀 (점진적 증가)
  - 실제 대회 규모: 7팀 재현
  - 총 테스트 시간: 약 ${(data.state.testRunDurationMs / 1000 / 60).toFixed(1)}분
  - 테스트 접근: 보수적 (실제 대회 규모 재현 후 점진적 증가)
  - 참고: 각 VU는 하나의 팀을 시뮬레이션 (팀 단위 제출/조회)

💡 CloudWatch 모니터링 권장사항:
  - CPU Utilization 목표: 70% 도달 지점 측정
  - CPUCreditBalance 모니터링
  - NetworkIn/NetworkOut 추적
  - RDS 연결 수 모니터링

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `,
  };
}

