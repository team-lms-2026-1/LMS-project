# permissions.md (초안) — Community (공지/자료실/FAQ/QnA)

본 문서는 커뮤니티 도메인(공지사항/자료실/FAQ/QnA)에 대한 Permission 코드 카탈로그 초안이다.  
권한 코드는 **불변(삭제 금지)**이며, 변경이 필요하면 **비활성화(is_active=false)** 로 처리한다.

---

## 0. 네이밍 규칙

- 기본 패턴: `{DOMAIN}_{ACTION}`
- ACTION은 원칙적으로 아래 2개만 사용
  - `READ`   : 조회/열람(목록, 상세, 첨부 다운로드 포함)
  - `MANAGE` : 등록/수정/삭제/상태변경(노출기간, 고정, 카테고리 관리 포함)
- 권한 코드는 대문자 + 언더스코어 사용
- 권한 추가/변경 시 PR에 반드시 `permissions.md` 수정 포함

---

## 1. Permission 목록 (Community)

| code | name(설명) | scope | used_in(예시) | notes |
|---|---|---|---|---|
| NOTICE_READ | 공지사항 조회 | COMMON | 공지 목록/상세, 첨부 다운로드 | 공개 범위 정책에 따라 비로그인 허용 가능(추후 결정) |
| NOTICE_MANAGE | 공지사항 관리 | ADMIN | 공지 등록/수정/삭제, 노출기간 설정, 고정(상단) 등 | 공지 카테고리 관리 포함 여부는 아래 별도 권한으로 분리 가능 |
| NOTICE_CATEGORY_MANAGE | 공지 카테고리 관리 | ADMIN | 공지 카테고리 CRUD, 색상/정렬 설정 | 운영상 분리 필요하면 사용, 아니면 NOTICE_MANAGE에 포함 |

| RESOURCE_READ | 자료실 조회 | COMMON | 자료실 목록/상세, 첨부 다운로드 | 자료실은 파일 다운로드가 핵심이라 READ에 포함 |
| RESOURCE_MANAGE | 자료실 관리 | ADMIN | 자료 등록/수정/삭제, 첨부 업로드/삭제 | 자료 카테고리 관리 포함 여부는 아래 별도 권한으로 분리 가능 |
| RESOURCE_CATEGORY_MANAGE | 자료 카테고리 관리 | ADMIN | 자료 카테고리 CRUD, 색상/정렬 설정 | 운영상 분리 필요하면 사용, 아니면 RESOURCE_MANAGE에 포함 |

| FAQ_READ | FAQ 조회 | COMMON | FAQ 목록/상세 | 보통 학생/교수/관리자 모두 조회 |
| FAQ_MANAGE | FAQ 관리 | ADMIN | FAQ 등록/수정/삭제 | FAQ 카테고리 관리 포함 여부는 아래 별도 권한으로 분리 가능 |
| FAQ_CATEGORY_MANAGE | FAQ 카테고리 관리 | ADMIN | FAQ 카테고리 CRUD, 색상/정렬 설정 | 운영상 분리 필요하면 사용, 아니면 FAQ_MANAGE에 포함 |

| QNA_READ | QnA 조회 | COMMON | QnA 목록/상세(질문/답변 열람) | 질문자 본인만 조회 같은 정책이 있으면 별도 정책 필요 |
| QNA_ASK | QnA 질문 등록 | STUDENT/PROFESSOR | QnA 질문 작성/수정/삭제(본인) | “본인 글만”은 권한이 아니라 비즈니스 룰로 처리 |
| QNA_ANSWER | QnA 답변 등록 | ADMIN/PROFESSOR | QnA 답변 작성/수정/삭제 | “질문당 답변 1개” 정책은 DB/서비스 룰로 처리 |
| QNA_MANAGE | QnA 관리(관리자) | ADMIN | QnA 전체 관리(숨김/삭제/카테고리 관리 등) | 운영상 필요할 때만 사용. 기본은 ASK/ANSWER로 충분 |

---

## 2. 권장 최소 세트 (초기 버전)

초기에는 아래 권한만으로도 운영 가능하다.

- NOTICE_READ
- NOTICE_MANAGE
- RESOURCE_READ
- RESOURCE_MANAGE
- FAQ_READ
- FAQ_MANAGE
- QNA_READ
- QNA_ASK
- QNA_ANSWER

(카테고리 관리/관리자 QNA_MANAGE는 필요해지면 추가)

---

## 3. API 매핑 가이드 (예시)

### 3-1. 공지사항
- 목록/상세/첨부다운로드: NOTICE_READ
- 등록/수정/삭제/고정/노출기간: NOTICE_MANAGE
- 카테고리 CRUD: NOTICE_CATEGORY_MANAGE (또는 NOTICE_MANAGE에 포함)

### 3-2. 자료실
- 목록/상세/첨부다운로드: RESOURCE_READ
- 등록/수정/삭제/첨부업로드: RESOURCE_MANAGE
- 카테고리 CRUD: RESOURCE_CATEGORY_MANAGE (또는 RESOURCE_MANAGE에 포함)

### 3-3. FAQ
- 목록/상세: FAQ_READ
- 등록/수정/삭제: FAQ_MANAGE
- 카테고리 CRUD: FAQ_CATEGORY_MANAGE (또는 FAQ_MANAGE에 포함)

### 3-4. QnA
- 목록/상세: QNA_READ
- 질문 작성(본인): QNA_ASK + (본인 소유 검증은 서비스 룰)
- 답변 작성: QNA_ANSWER + (질문당 1개 답변 정책은 DB/서비스 룰)
- 전체 관리(숨김/삭제 등): QNA_MANAGE (필요 시)

---

## 4. 변경 규칙

- Permission 코드는 삭제하지 않는다 (불변)
- 변경이 필요하면 `is_active=false`로 비활성화한다
- 새 권한 추가 시:
  - 본 문서(permissions.md) 수정
  - Seed 데이터(로컬 runner 또는 Flyway) 추가
  - 해당 API에 @PreAuthorize 적용
