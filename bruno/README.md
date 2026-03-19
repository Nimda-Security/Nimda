# Bruno API Collection

## 환경변수 설정

### 방법 1: Bruno UI에서 환경 선택 (추천)

1. Bruno를 열고 좌측 하단의 **환경 선택 드롭다운**을 클릭하세요
2. `dev` 또는 `prod` 환경을 선택하세요
3. 환경변수가 자동으로 로드됩니다

### 방법 2: 환경 파일 복사

1. `environments/dev.example.bru` 파일을 복사해서 `environments/dev.bru` 파일을 생성하세요:
   ```bash
   cp Nimda/environments/dev.example.bru Nimda/environments/dev.bru
   ```

2. `environments/dev.bru` 파일에 실제 값들을 입력하세요:
   - `adminUserId`: 관리자 계정 ID
   - `adminPassword`: 관리자 계정 비밀번호
   - `testUserId`: 테스트 계정 ID
   - `testPassword`: 테스트 계정 비밀번호
   - `jwtToken`: JWT 인증 토큰 (로그인 후 받은 토큰을 복사해서 입력)

3. 프로덕션 환경도 동일하게 설정:
   ```bash
   cp Nimda/environments/prod.example.bru Nimda/environments/prod.bru
   ```

## 사용 방법

Bruno에서 환경변수를 사용하려면:
- `{{baseUrl}}`: API 기본 URL
- `{{adminUserId}}`: 관리자 사용자 ID
- `{{adminPassword}}`: 관리자 비밀번호
- `{{testUserId}}`: 테스트 사용자 ID
- `{{testPassword}}`: 테스트 계정 비밀번호
- `{{jwtToken}}`: JWT 인증 토큰 (Headers에 `Authorization: Bearer {{jwtToken}}` 형태로 사용)

## 환경별 설정

- **dev**: 로컬 개발 환경 (http://localhost:8080)
- **prod**: 프로덕션 환경 (https://nimda.kr)

## 주의사항

- `environments/*.bru` 파일은 `.gitignore`에 포함되어 있어 git에 올라가지 않습니다
- 실제 비밀번호와 JWT 토큰은 팀원들에게 별도로 공유하세요
- `environments/*.example.bru`는 템플릿 파일이므로 git에 포함됩니다
- JWT 토큰은 만료되면 로그인 API를 다시 호출해서 갱신해야 합니다