# 🚀 Nimda Zero-Downtime Deployment Guide (v2.0)

## 개요

**고유 태그 기반 Blue-Green 무중단 배포** 시스템

- 각 배포마다 **고유한 이미지 태그** (commit hash 기반)
- **Blue-Green 패턴**으로 기존 서버 유지
- **sed 기반 Nginx 자동 교체**
- **Graceful reload** 사용

---

## 🔧 주요 개선사항

### 1️⃣ 고유 태그 (Unique Tagging)
- CI에서 `${{ github.sha }}`를 사용한 고유 태그 생성
- 각 배포마다 새로운 이미지 ID 보장
- 이미지 캐시 문제 완전 해결

### 2️⃣ 완전한 Blue-Green 스위칭
- nginx.conf의 마커로 현재 활성 서비스 추적
- sed를 사용해 Nginx 설정 자동 업데이트
- Graceful reload로 무중단 적용

### 3️⃣ Docker 이미지 최적화
- `docker-compose pull`로 특정 서비스 & 태그 지정
- `docker image prune -af`로 이전 이미지 자동 정리
- 환경변수 `BACKEND_IMAGE_TAG` 동적 관리

---

## 📋 파일 구조

```
Nimda/
├── .github/workflows/
│   └── ci.yml                    # 고유 태그 사용 (github.sha)
├── docker-compose.yml            # ${BACKEND_IMAGE_TAG} 환경변수
├── deploy.sh                     # 완전한 Blue-Green 배포
├── nginx/
│   ├── nginx.conf               # [ACTIVE_BACKEND_MARKER: blue]
│   └── nginx.conf.template      # (더 이상 사용 안 함)
└── DEPLOYMENT.md                # 이 파일
```

---

### 2️⃣ 상태 확인

```bash
./deploy.sh status
```

**출력 예시:**
```
📊 Nimda 배포 상태
==================================================
  활성 서비스  : green
  대기 서비스  : blue

📦 실행 중인 컨테이너:
NAME                STATUS              IMAGE
nimda-backend-blue  Up 3 hours          xtkww971/nimda-backend:latest
nimda-backend-green Up 5 minutes         xtkww971/nimda-backend:latest
```

---

### 3️⃣ 롤백 (배포 실패 시)

```bash
./deploy.sh rollback
```

**동작 과정:**
1. 이전 버전(대기 중인 서비스) 재시작
2. 헬스체크
3. 트래픽 전환

**결과:** ⏮️ 즉시 이전 버전으로 되돌림

---

## 🔍 동작 원리

### 초기 상태
```
사용자 요청 → Nginx (포트 80/443)
              ↓
         upstream backend_server
              ↓
         backend-blue:8080 (활성)
         backend-green:8080 (대기)
```

### 배포 중
```
Step 1: 새 이미지 Pull
         docker pull xtkww971/nimda-backend:latest

Step 2: 대기 서비스에 배포
         docker-compose up -d backend-green
         (새 이미지로 green 컨테이너 시작)

Step 3: 헬스체크
         curl http://backend-green:8080/api/health
         (정상 응답 확인)

Step 4: 트래픽 전환
         nginx.conf 업데이트: upstream backend_server → backend-green
         docker-compose restart nginx

결과: 모든 신규 요청 → backend-green (새 버전)
     기존 연결은 유지되거나 graceful shutdown
```

---

## 📊 배포 시나리오

### 시나리오 1: 정상 배포

```bash
$ ./deploy.sh deploy

[2026-05-04 14:30:12] 🚀 Nimda 무중단 배포 시작
[2026-05-04 14:30:12]    현재 활성: blue | 배포 대상: green

[2026-05-04 14:30:12] [Step 1/4] 최신 이미지 다운로드...
[2026-05-04 14:31:05] ✓ 이미지 다운로드 완료

[2026-05-04 14:31:05] [Step 2/4] green 서비스에 새 이미지 배포...
[2026-05-04 14:31:10] ✓ 컨테이너 업데이트 완료

[2026-05-04 14:31:10] [Step 3/4] 새 서비스 헬스체크...
[2026-05-04 14:31:15] ✓ nimda-backend-green 정상 작동 확인

[2026-05-04 14:31:15] [Step 4/4] 트래픽 전환 (blue → green)...
[2026-05-04 14:31:18] ✓ Nginx 재시작 완료

[2026-05-04 14:31:20] ✓ 무중단 배포 완료!
```

---

### 시나리오 2: 배포 실패 시 롤백

```bash
# 배포 중 문제 발생
$ ./deploy.sh deploy
[2026-05-04 14:35:12] ❌ ERROR: green 서비스 헬스체크 실패

# 즉시 롤백
$ ./deploy.sh rollback

[2026-05-04 14:35:20] ⏮️ 롤백 시작: green → blue
[2026-05-04 14:35:25] ✓ 롤백 완료!

# 트래픽 다시 blue로 흐름
```

---

## 🎯 주요 특징

### ✅ 무중단 배포
- 기존 사용자 요청 계속 처리
- 배포 중 서비스 중단 없음

### ✅ 빠른 롤백
- 배포 실패 시 1분 이내 이전 버전 복구
- 상태 파일(`.deployment_state`)로 추적

### ✅ 헬스체크
- 자동 헬스체크 (최대 30초)
- 이상 상황 자동 감지

### ✅ 로그 기록
- `deployment.log`에 모든 배포 기록 저장
- 문제 발생 시 원인 분석 가능

### ✅ 두 버전 동시 유지
- 언제든 빠르게 전환 가능
- 성능 테스트나 카나리 배포 확장 가능

---

## ⚙️ 설정 확인

### 1. 헬스체크 엔드포인트 확인

현재 Spring Boot 백엔드에서 지원하는 엔드포인트 확인:

```bash
# 로컬 테스트
curl http://localhost:8080/api/health

# 또는 actuator 엔드포인트
curl http://localhost:8080/actuator/health
```

**만약 헬스체크 엔드포인트가 없다면:**

[NimdaConBackEnd/backend-spring/src/main/java](../NimdaConBackEnd/backend-spring/src/main/java)에서 

`@RestController` 또는 `@Controller`가 있는 클래스에 추가:

```java
@GetMapping("/api/health")
public ResponseEntity<Map<String, String>> health() {
    return ResponseEntity.ok(Map.of("status", "UP"));
}
```

### 2. docker-compose 서비스 확인

```bash
# 현재 실행 중인 서비스 확인
docker-compose ps

# 특정 서비스 로그 확인
docker-compose logs backend-blue
docker-compose logs backend-green
```

### 3. Nginx 설정 검증

```bash
# Nginx 문법 검사
docker exec nimda-nginx nginx -t

# 현재 설정 확인
docker exec nimda-nginx cat /etc/nginx/nginx.conf
```

---

## 🚨 문제 해결

### Q: "헬스체크 실패" 에러 발생

**원인:** 백엔드 서비스가 준비되지 않음

**해결:**
1. 서비스 로그 확인: `docker-compose logs backend-green`
2. 수동 테스트: `docker exec nimda-backend-green curl http://localhost:8080/api/health`
3. 필요시 헬스체크 엔드포인트 추가

### Q: Nginx 설정 적용 안 됨

**원인:** nginx.conf.template에서 치환 실패

**해결:**
```bash
# 직접 설정 재생성
ACTIVE_SERVICE=green envsubst < nginx/nginx.conf.template > nginx/nginx.conf
docker-compose restart nginx
```

### Q: 이전 버전으로 돌리고 싶음

```bash
./deploy.sh rollback
```

---

## 📋 체크리스트

배포 전 확인:

- [ ] 새 이미지가 Docker Hub에 업로드됨
- [ ] 로컬에서 테스트 완료
- [ ] `.deployment_state` 파일이 최신 상태 반영
- [ ] `docker-compose ps`로 두 서비스 실행 중 확인
- [ ] 배포 스크립트 실행 권한 있음: `chmod +x deploy.sh`

---

## 📞 긴급 상황

### 서비스 즉시 중단 필요

```bash
# 모든 backend 서비스 중단
docker-compose stop backend-blue backend-green

# Nginx만 유지해서 503 에러 반환
# 또는 정적 에러 페이지 띄우기
```

### 완전 재배포

```bash
# 모든 서비스 정지
docker-compose down

# 재시작
docker-compose up -d
```

---

## 📝 로그 위치

```
deployment.log          # 배포 실행 로그
.deployment_state       # 현재 활성 서비스 상태
docker-compose.log      # Docker 컴포즈 로그 (필요시)
```

---

**마지막 업데이트:** 2026-05-04
