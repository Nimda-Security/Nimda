import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// 커스텀 메트릭
const errorRate = new Rate('errors');
const judgeSuccessRate = new Rate('judge_success');

// 테스트 설정
export const options = {
  stages: [
    { duration: '30s', target: 5 },    // 30초 동안 5명까지 증가
    { duration: '1m', target: 20 },    // 1분 동안 20명 유지
    { duration: '30s', target: 50 },   // 30초 동안 50명까지 증가
    { duration: '2m', target: 50 },    // 2분 동안 50명 유지
    { duration: '30s', target: 0 },    // 30초 동안 0명으로 감소
  ],
  thresholds: {
    http_req_duration: ['p(95)<5000'],  // 채점은 시간이 걸리므로 5초
    http_req_failed: ['rate<0.05'],     // 실패율 5% 이하
    judge_success: ['rate>0.8'],        // 채점 성공률 80% 이상
  },
};

// 테스트 데이터
const BASE_URL = 'http://localhost:3001';

// 다양한 테스트 코드들
const TEST_CODES = [
  // Hello World (문제 ID: 2)
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
  // A + B (문제 ID: 1)
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
  // 잘못된 코드 (컴파일 에러)
  {
    problemId: 1,
    language: 'C++17',
    code: `#include <iostream>
using namespace std;
int main() {
    int a, b
    cin >> a >> b;  // 세미콜론 누락
    cout << a + b << endl;
    return 0;
}`,
    expected: 'COMPILATION_ERROR'
  },
  // 틀린 답
  {
    problemId: 1,
    language: 'C++17',
    code: `#include <iostream>
using namespace std;
int main() {
    int a, b;
    cin >> a >> b;
    cout << a * b << endl;  // 곱셈으로 잘못 계산
    return 0;
}`,
    expected: 'WRONG_ANSWER'
  }
];

export default function () {
  // 랜덤하게 테스트 코드 선택
  const testCase = TEST_CODES[Math.floor(Math.random() * TEST_CODES.length)];
  
  // 코드 제출
  const submitPayload = JSON.stringify({
    title: `Problem ${testCase.problemId}`,
    code: testCase.code,
    language: testCase.language,
    problemId: testCase.problemId,
    description: "부하 테스트용 제출",
    points: 100
  });

  const submitParams = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  console.log(`Submitting code for problem ${testCase.problemId}...`);
  
  const submitResponse = http.post(
    `${BASE_URL}/api/judge/submit`,
    submitPayload,
    submitParams
  );

  // 제출 응답 검증
  const submitSuccess = check(submitResponse, {
    'submit status is 200': (r) => r.status === 200,
    'submit response time < 10s': (r) => r.timings.duration < 10000,
    'response contains result': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.status !== undefined;
      } catch (e) {
        return false;
      }
    },
  });

  let judgeResult = null;
  if (submitResponse.status === 200) {
    try {
      judgeResult = JSON.parse(submitResponse.body);
      console.log(`Judge result: ${judgeResult.status} for problem ${testCase.problemId}`);
      
      // 채점 결과 검증
      const judgeSuccess = check(judgeResult, {
        'judge completed': (result) => result.status !== 'SYSTEM_ERROR',
        'expected result': (result) => {
          // 예상 결과와 일치하는지 확인 (완전히 정확하지 않을 수 있음)
          return result.status === testCase.expected || 
                 (testCase.expected === 'ACCEPTED' && result.status === 'ACCEPTED') ||
                 (testCase.expected === 'COMPILATION_ERROR' && result.status === 'COMPILATION_ERROR') ||
                 (testCase.expected === 'WRONG_ANSWER' && result.status === 'WRONG_ANSWER');
        }
      });
      
      judgeSuccessRate.add(judgeSuccess);
    } catch (e) {
      console.error('Failed to parse submit response:', e);
      judgeSuccessRate.add(false);
    }
  } else {
    judgeSuccessRate.add(false);
  }

  errorRate.add(!submitSuccess);

  // 제출 목록 조회 테스트
  const submissionsResponse = http.get(`${BASE_URL}/api/judge/submissions`);
  
  check(submissionsResponse, {
    'submissions list retrieved': (r) => r.status === 200,
    'submissions response time < 1s': (r) => r.timings.duration < 1000,
  });

  // 요청 간 간격 (채점 시스템 부하 고려)
  sleep(2 + Math.random() * 3); // 2~5초 랜덤 대기
}

export function handleSummary(data) {
  return {
    'results/judge-test-summary.json': JSON.stringify(data, null, 2),
    stdout: `
⚖️ 채점 시스템 부하 테스트 결과

📊 주요 지표:
- 평균 응답 시간: ${data.metrics.http_req_duration.values.avg.toFixed(2)}ms
- 95% 응답 시간: ${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms
- 최대 응답 시간: ${data.metrics.http_req_duration.values.max.toFixed(2)}ms
- 총 요청 수: ${data.metrics.http_reqs.values.count}
- 실패율: ${(data.metrics.http_req_failed.values.rate * 100).toFixed(2)}%
- 채점 성공률: ${(data.metrics.judge_success.values.rate * 100).toFixed(2)}%

${data.metrics.http_req_duration.values['p(95)'] < 5000 ? '✅' : '❌'} 성능 목표: 95% 요청이 5초 이내
${data.metrics.http_req_failed.values.rate < 0.05 ? '✅' : '❌'} 안정성 목표: 실패율 5% 이하  
${data.metrics.judge_success.values.rate > 0.8 ? '✅' : '❌'} 품질 목표: 채점 성공률 80% 이상
    `,
  };
}
