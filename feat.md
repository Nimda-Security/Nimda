Backend 
1) 회원 상태는 Enum으로 관리한다. (ok)
ApprovalStatus로 상태를 관리한다. { PENDING[Default], APPROVED, REJECTED } 
→ [Before] UserService.createUser()에서 자동으로 ROLE_USER()를 부여
… [After] 승인 전까지 권한을 NULL 상태로 두고, 승인 시 ROLE_USER를 부여하고, status를 APPROVED로 변경하도록 구상한다. 
→ 활성화/비활성화 상태도 따로 추가하는게 좋을듯. 

2) User Entity 필드 수정 
현재는 status가 String varchar 형태라서 Enum Type으로 수정 

3) UserService.createUser() 로직 수정 
[Before] 현재는 회원가입시 자동으로 ROLE_USER를 부여하는 형태. 
[After] 권한 없이 생성 후 승인 시 부여하는 방안 채택 

4) AuthService.validateUser() 로직 수정 
현재는 비밀번호만 확인하는 형태. 
승인 상태 확인 로직을 추가. 
단, 승인 상태 확인 로직에서 적절한 예외나 응답을 반환해야함
단순히 Optional.empty()를 반환하면 “비밀번호 오류”라고 오인할 가능성이 있음 
ex) 현재 승인 대기중인 계정입니다. 
or 비활성화된 계정입니다. 

5) AdminUserController 설계 
클래스 레벨 권한 체크 보안 설정 
기존 UsersController는 일반 사용자용 API로 역할을 분리 (자신 정보 조회) 
AdminUserController는 관리자용 API 

6) SecurityConfig 보안 업데이트
AdminUserController의 모든 엔드포인트는 /api/admin/** 패턴으로 설정 

Frontend 
→ 회원가입 성공 : “관리자 승인 대기 중” 메시지 표시
→ 로그인 실패 : “승인 대기 상태인 계정의 경우” 별도의 메시지로 표시 
→ 관리자 페이지 : “승인 대기 사용자 목록 섹션 UI 추가

Migration 
기존 사용자는 status를 모두 APPROVED 로 설정 
기존 DB는 String형태라 enum으로 마이그레이션  