# 🚀 NimdaCon 부하 테스트

## 📁 디렉토리 구조
```
load-tests/
├── scripts/          # K6 테스트 스크립트들
│   ├── auth/         # 인증 관련 테스트
│   ├── judge/        # 채점 관련 테스트
│   └── common/       # 공통 유틸리티
├── data/            # 테스트 데이터 (사용자, 문제 등)
├── results/         # 테스트 결과 파일들
└── README.md        # 이 파일
```

## 🛠️ K6 설치

### macOS (Homebrew)
```bash
brew install k6
```

### 다른 OS
```bash
# Linux/Windows WSL
curl -fsSL https://dl.k6.io/key.gpg | gpg --dearmor -o /usr/share/keyrings/k6-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | tee /etc/apt/sources.list.d/k6.list
apt-get update && apt-get install k6
```

## 🏃‍♂️ 테스트 실행

### 로그인 성능 테스트
```bash
k6 run scripts/auth/login-test.js
```

### 채점 시스템 부하 테스트  
```bash
k6 run scripts/judge/submit-test.js
```

### 전체 시나리오 테스트
```bash
k6 run scripts/full-scenario.js
```

## 📊 결과 분석

테스트 결과는 `results/` 디렉토리에 저장됩니다:
- JSON 형식: `--out json=results/test-result.json`
- HTML 리포트: `--out web-dashboard`
- InfluxDB/Grafana 연동 가능

## 🎯 테스트 목표

1. **로그인 성능**: 응답 시간 < 500ms
2. **채점 처리량**: 초당 10개 이상 처리
3. **동시 사용자**: 100명 동시 접속 지원
4. **메모리 사용량**: 안정적인 메모리 사용
