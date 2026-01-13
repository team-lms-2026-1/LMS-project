## 1. 인증 / 인가 (Login & Authorization)

본 프로젝트는 JWT 기반 인증과 BFF(Backend For Frontend) 패턴을 사용한다.
모든 API 호출은 Next.js 서버(BFF)를 통해서만 이루어진다.

---

## 1-1. 인증 기본 정책

- 인증 방식: JWT (Access Token only)
- 토큰 만료: 1시간 (고정 만료)
- 토큰 저장 위치: HttpOnly Cookie
- Refresh Token: 사용하지 않음
- 만료 시 동작: 자동 로그아웃 (재로그인 필요)

---

## 1-2. 로그인 화면 분리

- 학생 / 교수 로그인: /login
- 관리자 로그인: /admin/login

로그인 성공 후 이동 경로:
- STUDENT → /student/dashboard
- PROFESSOR → /professor/dashboard
- ADMIN → /admin/dashboard

---

## 1-3. 전체 요청 흐름 (BFF 구조)

[ Browser ]
    ↓
[ Next.js (BFF) ]
    /api/auth/**
    /api/admin/auth/**
    ↓
[ Spring Boot ]
    /api/v1/**

---

## 1-4. 로그인 API

### 1-4-1. 브라우저 → BFF

POST /api/auth/login  
POST /api/admin/auth/login  

Request
{
  "loginId": "admin01",
  "password": "********"
}

---

### 1-4-2. BFF → Spring

POST /api/v1/auth/login

아이디 / 비밀번호 검증  
성공 시 Access JWT 발급 (exp = 1시간)

---

### 1-4-3. 로그인 응답 (BFF → 브라우저)

JWT는 HttpOnly Cookie로 저장  
JSON 응답에 토큰은 포함하지 않음  

Response
{
  "data": {
    "success": true
  },
  "meta": {}
}

---

## 1-5. 인증 확인 API (me)

GET /api/auth/me  

Response
{
  "data": {
    "accountId": 9001,
    "name": "관리자A",
    "accountType": "ADMIN",
    "roles": [
      "ADMIN_CONTENT"
    ],
    "permissions": [
      "NOTICE_READ",
      "NOTICE_MANAGE"
    ]
  },
  "meta": {}
}

---

## 1-6. 로그아웃

POST /api/auth/logout  

Response
{
  "data": {
    "success": true
  },
  "meta": {}
}

---

## 1-7. 자동 로그아웃 정책

- JWT 만료 시간: 1시간
- 만료 시 Spring Boot에서 401 응답
- 프론트 처리:
  - 인증 상태 초기화
  - 로그인 페이지로 이동

---

## 1-8. 권한 테이블 구조

auth_permission  
auth_role  
auth_role_permission  
auth_account_role  

---

## 1-9. 권한 설계 원칙

- CRUD 단위로 permission을 쪼개지 않는다
- 도메인 책임 단위로 permission을 정의한다

예시 (공지사항):
- NOTICE_READ
- NOTICE_MANAGE (등록 / 수정 / 삭제 포함)

---

## 1-10. 계정 생성 시 권한 처리

POST /api/v1/admin/accounts  

Request
{
  "loginId": "admin01",
  "accountType": "ADMIN"
}

Service Layer에서 accountType 기준으로 기본 role 자동 부여

---

## 1-11. 백엔드 권한 체크 방식

Spring Security에서 permission 기반으로 API 접근을 제어한다.

@PreAuthorize("hasAuthority('NOTICE_MANAGE')")
@PostMapping("/api/v1/notices")
public void createNotice() {
    ...
}

permission 문자열은 DB의 auth_permission.code 값과 일치해야 한다  
권한이 없을 경우 403 FORBIDDEN 응답

---

## 1-12. 책임 분리

Frontend (Next.js)
- 로그인 여부 확인
- 라우팅 가드
- 메뉴 / 버튼 노출 제어 (UX)

Backend (Spring Boot)
- JWT 검증
- Role / Permission 조회
- API 접근 제어 (보안 최종 책임)

---

## 1-13. 요약

- JWT Access Token 기반 인증
- HttpOnly Cookie 사용
- 1시간 고정 만료
- BFF 패턴 적용
- Role + Permission 기반 인가
- 기존 API 엔드포인트 및 JSON 계약 변경 없음
