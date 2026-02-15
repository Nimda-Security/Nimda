# Bruno API Collection

## 환경변수 설정

1. `vars.example.json` 파일을 복사해서 `vars.json` 파일을 생성하세요:
   ```bash
   cp Nimda/vars.example.json Nimda/vars.json
   ```

2. `vars.json` 파일에 실제 값들을 입력하세요:
   - `adminUserId`: 관리자 계정 ID
   - `adminPassword`: 관리자 계정 비밀번호
   - `testUserId`: 테스트 계정 ID
   - `testPassword`: 테스트 계정 비밀번호

3. 환경 선택:
   - `dev`: 로컬 개발 환경 (http://localhost:8080)
   - `prod`: 프로덕션 환경 (https://nimda.kr)

## 사용 방법

Bruno에서 환경변수를 사용하려면:
- `{{baseUrl}}`: API 기본 URL
- `{{adminUserId}}`: 관리자 사용자 ID
- `{{adminPassword}}`: 관리자 비밀번호
- `{{testUserId}}`: 테스트 사용자 ID
- `{{testPassword}}`: 테스트 비밀번호

## 주의사항

- `vars.json` 파일은 `.gitignore`에 포함되어 있어 git에 올라가지 않습니다
- 실제 비밀번호는 팀원들에게 별도로 공유하세요
- `vars.example.json`은 템플릿 파일이므로 git에 포함됩니다
