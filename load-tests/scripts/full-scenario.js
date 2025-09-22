import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// 커스텀 메트릭
const errorRate = new Rate('errors');
const scenarioSuccessRate = new Rate('scenario_success');

// 테스트 설정
export const options = {
  stages: [
    { duration: '1m', target: 10 },    // 1분 동안 10명까지 증가
    { duration: '3m', target: 30 },    // 3분 동안 30명 유지
    { duration: '1m', target: 50 },    // 1분 동안 50명까지 증가
    { duration: '5m', target: 50 },    // 5분 동안 50명 유지
    { duration: '1m', target: 0 },     // 1분 동안 0명으로 감소
  ],
  thresholds: {
    http_req_duration: ['p(95)<3000'],  // 95%의 요청이 3초 이내
    http_req_failed: ['rate<0.05'],     // 실패율 5% 이하
    scenario_success: ['rate>0.9'],     // 시나리오 성공률 90% 이상
  },
};

// 테스트 데이터
const BASE_URL = 'http://localhost:3001';
const TEST_USER = {
  username: 'admin',
  password: 'password'
};

const PROBLEMS = [
  {
    id: 1,
    title: 'A + B',
    code: `#include <iostream>
using namespace std;
int main() {
    int a, b;
    cin >> a >> b;
    cout << a + b << endl;
    return 0;
}`
  },
  {
    id: 2,
    title: 'Hello World',
    code: `#include <iostream>
using namespace std;
int main() {
    cout << "Hello World" << endl;
    return 0;
}`
  }
];

export default function () {
  let scenarioSuccess = true;
  
  console.log('🚀 Starting full user scenario...');

  // 1. 로그인
  console.log('1️⃣ Logging in...');
  const loginPayload = JSON.stringify(TEST_USER);
  const loginParams = {
    headers: { 'Content-Type': 'application/json' },
  };

  const loginResponse = http.post(
    `${BASE_URL}/api/auth/login`,
    loginPayload,
    loginParams
  );

  const loginSuccess = check(loginResponse, {
    'login successful': (r) => r.status === 200,
    'login response time < 1s': (r) => r.timings.duration < 1000,
  });

  if (!loginSuccess) {
    scenarioSuccess = false;
    console.error('❌ Login failed');
  }

  sleep(1);

  // 2. 문제 목록 조회 (실제로는 하드코딩되어 있지만 API 호출 시뮬레이션)
  console.log('2️⃣ Browsing problems...');
  const problemsResponse = http.get(`${BASE_URL}/api/judge/submissions`); // 임시로 제출 목록 API 사용
  
  check(problemsResponse, {
    'problems list retrieved': (r) => r.status === 200,
  });

  sleep(2);

  // 3. 랜덤 문제 선택 및 코드 제출
  const selectedProblem = PROBLEMS[Math.floor(Math.random() * PROBLEMS.length)];
  console.log(`3️⃣ Solving problem: ${selectedProblem.title}`);
  // g

  const submitPayload = JSON.stringify({
    title: selectedProblem.title,
    code: selectedProblem.code,
    language: 'C++17',
    problemId: selectedProblem.id,
    description: `Solving ${selectedProblem.title}`,
    points: 100
  });

  const submitParams = {
    headers: { 'Content-Type': 'application/json' },
  };

  const submitResponse = http.post(
    `${BASE_URL}/api/judge/submit`,
    submitPayload,
    submitParams
  );

  const submitSuccess = check(submitResponse, {
    'code submission successful': (r) => r.status === 200,
    'judge response time < 10s': (r) => r.timings.duration < 10000,
    'judge result received': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.status !== undefined;
      } catch (e) {
        return false;
      }
    },
  });

  if (!submitSuccess) {
    scenarioSuccess = false;
    console.error('❌ Code submission failed');
  } else {
    try {
      const judgeResult = JSON.parse(submitResponse.body);
      console.log(`✅ Judge result: ${judgeResult.status}`);
      
      if (judgeResult.status === 'ACCEPTED') {
        console.log('🎉 Problem solved successfully!');
      }
    } catch (e) {
      console.error('Failed to parse judge result');
      scenarioSuccess = false;
    }
  }

  sleep(3);

  // 4. 제출 내역 확인
  console.log('4️⃣ Checking submission history...');
  const historyResponse = http.get(`${BASE_URL}/api/judge/submissions`);
  
  const historySuccess = check(historyResponse, {
    'submission history retrieved': (r) => r.status === 200,
    'history response time < 1s': (r) => r.timings.duration < 1000,
  });

  if (!historySuccess) {
    scenarioSuccess = false;
    console.error('❌ Failed to retrieve submission history');
  }

  // 시나리오 성공률 기록
  scenarioSuccessRate.add(scenarioSuccess);
  errorRate.add(!scenarioSuccess);

  if (scenarioSuccess) {
    console.log('✅ Full scenario completed successfully');
  } else {
    console.log('❌ Scenario failed');
  }

  // 다음 시나리오까지 대기
  sleep(5 + Math.random() * 5); // 5~10초 랜덤 대기
}

export function handleSummary(data) {
  return {
    'results/full-scenario-summary.json': JSON.stringify(data, null, 2),
    stdout: `
🎯 통합 시나리오 부하 테스트 결과

📊 주요 지표:
- 평균 응답 시간: ${data.metrics.http_req_duration.values.avg.toFixed(2)}ms
- 95% 응답 시간: ${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms
- 최대 응답 시간: ${data.metrics.http_req_duration.values.max.toFixed(2)}ms
- 총 요청 수: ${data.metrics.http_reqs.values.count}
- 실패율: ${(data.metrics.http_req_failed.values.rate * 100).toFixed(2)}%
- 시나리오 성공률: ${(data.metrics.scenario_success.values.rate * 100).toFixed(2)}%

🎯 목표 달성 현황:
${data.metrics.http_req_duration.values['p(95)'] < 3000 ? '✅' : '❌'} 성능: 95% 요청이 3초 이내
${data.metrics.http_req_failed.values.rate < 0.05 ? '✅' : '❌'} 안정성: 실패율 5% 이하
${data.metrics.scenario_success.values.rate > 0.9 ? '✅' : '❌'} 사용성: 시나리오 성공률 90% 이상

📈 권장 사항:
${data.metrics.http_req_duration.values['p(95)'] > 3000 ? '- 응답 시간 최적화 필요 (캐시, DB 인덱스 등)' : ''}
${data.metrics.http_req_failed.values.rate > 0.05 ? '- 에러 처리 개선 필요' : ''}
${data.metrics.scenario_success.values.rate < 0.9 ? '- 전체적인 사용자 경험 개선 필요' : ''}
    `,
  };
}
