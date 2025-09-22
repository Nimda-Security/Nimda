// K6 부하 테스트 공통 설정

export const CONFIG = {
  // 서버 설정
  BASE_URL: 'http://localhost:3001',
  
  // 테스트 사용자
  TEST_USER: {
    username: 'admin',
    password: 'password'
  },
  
  // 성능 임계값
  THRESHOLDS: {
    login: {
      response_time: 500,    // 로그인 응답 시간 (ms)
      error_rate: 0.1,       // 에러율 (10%)
    },
    judge: {
      response_time: 5000,   // 채점 응답 시간 (ms)
      error_rate: 0.05,      // 에러율 (5%)
      success_rate: 0.8,     // 채점 성공률 (80%)
    },
    general: {
      response_time: 3000,   // 일반 API 응답 시간 (ms)
      error_rate: 0.05,      // 에러율 (5%)
    }
  },
  
  // 부하 패턴
  LOAD_PATTERNS: {
    light: [
      { duration: '30s', target: 5 },
      { duration: '1m', target: 10 },
      { duration: '30s', target: 0 },
    ],
    moderate: [
      { duration: '30s', target: 10 },
      { duration: '2m', target: 25 },
      { duration: '30s', target: 50 },
      { duration: '2m', target: 50 },
      { duration: '30s', target: 0 },
    ],
    heavy: [
      { duration: '1m', target: 20 },
      { duration: '3m', target: 50 },
      { duration: '1m', target: 100 },
      { duration: '5m', target: 100 },
      { duration: '1m', target: 0 },
    ]
  },
  
  // 테스트 데이터
  PROBLEMS: [
    {
      id: 1,
      title: 'A + B',
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
    {
      id: 2,
      title: 'Hello World',
      language: 'C++17',
      code: `#include <iostream>
using namespace std;
int main() {
    cout << "Hello World" << endl;
    return 0;
}`,
      expected: 'ACCEPTED'
    }
  ],
  
  // 잘못된 코드 샘플 (에러 테스트용)
  INVALID_CODES: [
    {
      id: 1,
      title: 'Compilation Error',
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
    {
      id: 1,
      title: 'Wrong Answer',
      language: 'C++17',
      code: `#include <iostream>
using namespace std;
int main() {
    int a, b;
    cin >> a >> b;
    cout << a * b << endl;  // 잘못된 계산
    return 0;
}`,
      expected: 'WRONG_ANSWER'
    }
  ]
};

// 공통 헤더
export const HEADERS = {
  'Content-Type': 'application/json',
};

// 공통 체크 함수들
export const CHECKS = {
  isSuccessful: (r) => r.status >= 200 && r.status < 300,
  isJson: (r) => {
    try {
      JSON.parse(r.body);
      return true;
    } catch (e) {
      return false;
    }
  },
  hasField: (field) => (r) => {
    try {
      const body = JSON.parse(r.body);
      return body[field] !== undefined;
    } catch (e) {
      return false;
    }
  }
};
