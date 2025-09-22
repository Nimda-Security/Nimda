import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// 커스텀 메트릭 정의
const errorRate = new Rate('errors');

// 테스트 설정
export const options = {
  stages: [
    { duration: '30s', target: 10 },   // 30초 동안 10명까지 증가
    { duration: '1m', target: 50 },    // 1분 동안 50명 유지
    { duration: '30s', target: 100 },  // 30초 동안 100명까지 증가
    { duration: '2m', target: 100 },   // 2분 동안 100명 유지
    { duration: '30s', target: 0 },    // 30초 동안 0명으로 감소
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95%의 요청이 500ms 이내
    http_req_failed: ['rate<0.1'],     // 실패율 10% 이하
    errors: ['rate<0.1'],              // 에러율 10% 이하
  },
};

// 테스트 데이터
const BASE_URL = 'http://localhost:3001';
const TEST_USER = {
  username: 'admin',
  password: 'password'
};

export default function () {
  // 로그인 요청
  const loginPayload = JSON.stringify(TEST_USER);
  const loginParams = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const loginResponse = http.post(
    `${BASE_URL}/api/auth/login`,
    loginPayload,
    loginParams
  );

  // 응답 검증
  const loginSuccess = check(loginResponse, {
    'login status is 200': (r) => r.status === 200,
    'login response time < 500ms': (r) => r.timings.duration < 500,
    'response contains access_token': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.access_token !== undefined;
      } catch (e) {
        return false;
      }
    },
  });

  // 에러율 계산
  errorRate.add(!loginSuccess);

  // 로그인 성공 시 토큰 추출
  let token = null;
  if (loginResponse.status === 200) {
    try {
      const responseBody = JSON.parse(loginResponse.body);
      token = responseBody.access_token;
    } catch (e) {
      console.error('Failed to parse login response:', e);
    }
  }

  // 인증이 필요한 API 테스트 (토큰이 있을 경우)
  if (token) {
    const authHeaders = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    // 사용자 정보 조회
    const profileResponse = http.get(
      `${BASE_URL}/api/users/profile`,
      { headers: authHeaders }
    );

    check(profileResponse, {
      'profile request successful': (r) => r.status === 200 || r.status === 404, // 404도 정상 (API 미구현)
    });
  }

  // 요청 간 간격
  sleep(1);
}

// 테스트 완료 후 실행되는 함수
export function handleSummary(data) {
  return {
    'results/login-test-summary.json': JSON.stringify(data, null, 2),
    stdout: `
🚀 로그인 부하 테스트 결과

📊 주요 지표:
- 평균 응답 시간: ${data.metrics.http_req_duration.values.avg.toFixed(2)}ms
- 95% 응답 시간: ${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms
- 최대 응답 시간: ${data.metrics.http_req_duration.values.max.toFixed(2)}ms
- 총 요청 수: ${data.metrics.http_reqs.values.count}
- 실패율: ${(data.metrics.http_req_failed.values.rate * 100).toFixed(2)}%
- 에러율: ${(data.metrics.errors.values.rate * 100).toFixed(2)}%

${data.metrics.http_req_duration.values['p(95)'] < 500 ? '✅' : '❌'} 성능 목표 달성: 95% 요청이 500ms 이내
${data.metrics.http_req_failed.values.rate < 0.1 ? '✅' : '❌'} 안정성 목표 달성: 실패율 10% 이하
    `,
  };
}
