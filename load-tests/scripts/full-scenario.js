import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';
import { CONFIG, HEADERS } from './common/config.js';

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
    [`http_req_duration{endpoint:login}`]: [`p(95)<${CONFIG.THRESHOLDS.login.response_time}`],
    [`http_req_duration{endpoint:general}`]: [`p(95)<${CONFIG.THRESHOLDS.general.response_time}`],
    [`http_req_duration{endpoint:judge}`]: [`p(95)<${CONFIG.THRESHOLDS.judge.response_time}`],
    http_req_failed: [`rate<${CONFIG.THRESHOLDS.general.error_rate}`],
    scenario_success: [`rate>${CONFIG.THRESHOLDS.judge.success_rate}`],
  },
};

const { BASE_URL, TEST_USER, PROBLEMS } = CONFIG;

export default function () {
  let scenarioSuccess = true;

  // 1. 로그인
  const loginPayload = JSON.stringify(TEST_USER);
  const loginParams = {
    headers: HEADERS,
    tags: { endpoint: 'login' },
  };

  const loginResponse = http.post(
    `${BASE_URL}/api/auth/login`,
    loginPayload,
    loginParams
  );

  const loginSuccess = check(loginResponse, {
    'login successful': (r) => r.status === 200,
    'login response time within budget': (r) =>
      r.timings.duration < CONFIG.THRESHOLDS.login.response_time,
  });

  if (!loginSuccess) {
    scenarioSuccess = false;
    console.error('Login failed');
  }

  sleep(1);

  // 2. 문제 목록 조회 (실제로는 하드코딩되어 있지만 API 호출 시뮬레이션)
  const problemsResponse = http.get(`${BASE_URL}/api/judge/submissions`, {
    tags: { endpoint: 'general' },
  });
  
  const problemsSuccess = check(problemsResponse, {
    'problems list retrieved': (r) => r.status === 200,
  });
  if (!problemsSuccess) {
    scenarioSuccess = false;
    console.error('Problem list retrieval failed');
  }

  sleep(2);

  // 3. 랜덤 문제 선택 및 코드 제출
  const selectedProblem = PROBLEMS[Math.floor(Math.random() * PROBLEMS.length)];

  const submitPayload = JSON.stringify({
    title: selectedProblem.title,
    code: selectedProblem.code,
    language: 'C++17',
    problemId: selectedProblem.id,
    description: `Solving ${selectedProblem.title}`,
    points: 100
  });

  const submitParams = {
    headers: HEADERS,
    tags: { endpoint: 'judge' },
  };

  const submitResponse = http.post(
    `${BASE_URL}/api/judge/submit`,
    submitPayload,
    submitParams
  );

  const submitSuccess = check(submitResponse, {
    'code submission successful': (r) => r.status === 200,
    'judge response time within budget': (r) =>
      r.timings.duration < CONFIG.THRESHOLDS.judge.response_time,
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
    console.error('Code submission failed');
  }

  sleep(3);

  // 4. 제출 내역 확인
  const historyResponse = http.get(`${BASE_URL}/api/judge/submissions`, {
    tags: { endpoint: 'general' },
  });
  
  const historySuccess = check(historyResponse, {
    'submission history retrieved': (r) => r.status === 200,
    'history response time within budget': (r) =>
      r.timings.duration < CONFIG.THRESHOLDS.general.response_time,
  });

  if (!historySuccess) {
    scenarioSuccess = false;
    console.error('Submission history retrieval failed');
  }

  // 시나리오 성공률 기록
  scenarioSuccessRate.add(scenarioSuccess);
  errorRate.add(!scenarioSuccess);


  // 다음 시나리오까지 대기
  sleep(5 + Math.random() * 5); // 5~10초 랜덤 대기
}

export function handleSummary(data) {
  const loginDuration = data.metrics['http_req_duration{endpoint:login}']?.values;
  const generalDuration = data.metrics['http_req_duration{endpoint:general}']?.values;
  const judgeDuration = data.metrics['http_req_duration{endpoint:judge}']?.values;
  const overallDuration = data.metrics.http_req_duration.values;
  const failureRate = data.metrics.http_req_failed.values.rate;
  const successRate = data.metrics.scenario_success.values.rate;

  return {
    'results/full-scenario-summary.json': JSON.stringify(data, null, 2),
    stdout: `
NIMDA 통합 시나리오 부하 테스트 결과

주요 지표:
- 전체 평균 응답 시간: ${overallDuration.avg.toFixed(2)}ms
- 로그인 p95: ${loginDuration['p(95)'].toFixed(2)}ms
- 일반 API p95: ${generalDuration['p(95)'].toFixed(2)}ms
- 채점 API p95: ${judgeDuration['p(95)'].toFixed(2)}ms
- 최대 응답 시간: ${overallDuration.max.toFixed(2)}ms
- 총 요청 수: ${data.metrics.http_reqs.values.count}
- 실패율: ${(failureRate * 100).toFixed(2)}%
- 시나리오 성공률: ${(successRate * 100).toFixed(2)}%

목표 달성 현황:
${loginDuration['p(95)'] < CONFIG.THRESHOLDS.login.response_time ? 'PASS' : 'FAIL'} 로그인 p95 ${CONFIG.THRESHOLDS.login.response_time}ms 미만
${generalDuration['p(95)'] < CONFIG.THRESHOLDS.general.response_time ? 'PASS' : 'FAIL'} 일반 API p95 ${CONFIG.THRESHOLDS.general.response_time}ms 미만
${judgeDuration['p(95)'] < CONFIG.THRESHOLDS.judge.response_time ? 'PASS' : 'FAIL'} 채점 API p95 ${CONFIG.THRESHOLDS.judge.response_time}ms 미만
${failureRate < CONFIG.THRESHOLDS.general.error_rate ? 'PASS' : 'FAIL'} 실패율 ${CONFIG.THRESHOLDS.general.error_rate * 100}% 미만
${successRate > CONFIG.THRESHOLDS.judge.success_rate ? 'PASS' : 'FAIL'} 시나리오 성공률 ${CONFIG.THRESHOLDS.judge.success_rate * 100}% 초과
    `,
  };
}
