## 1. 학과 관리 API (관리자)!

### 1-1. 학과 목록 조회 (페이징)
GET `/api/admin/depts?page=1&size=20&sort=createdAt,desc`

Response
```json
{
  "data": [
    {
      "학과_id": 1,
      "학과명": "신학과",
      "활성여부": true,
      "생성일시": "2026-01-07T10:00:00",
      "수정일시": "2026-01-07T10:00:00"
    }
  ],
  "meta": {
    "page": 1,
    "size": 20,
    "totalElements": 1,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false,
    "sort": ["createdAt,desc"]
  }
}
```

---

### 1-2. 학과 상세 조회
GET `/api/admin/depts/{학과_id}`

Response
```json
{
  "data": {
    "학과_id": 1,
    "학과명": "신학과",
    "활성여부": true,
    "생성일시": "2026-01-07T10:00:00",
    "수정일시": "2026-01-07T10:00:00"
  },
  "meta": {}
}
```

---

### 1-3. 학과 생성
POST `/api/admin/depts`

Response
```json
{
  "data": {
    "학과_id": 2,
    "학과명": "기독교교육과",
    "활성여부": true,
    "생성일시": "2026-01-07T11:00:00",
    "수정일시": "2026-01-07T11:00:00"
  },
  "meta": {}
}
```

---

## 2. 학생 계정 관리 API (관리자)

### 2-1. 학생 계정 생성
POST `/api/admin/students`

Response
```json
{
  "data": {
    "계정_id": 1001,
    "로그인아이디": "s20250001",
    "계정유형": "STUDENT",
    "상태": "ACTIVE",
    "학생프로필": {
      "학번": "20250001",
      "이름": "홍길동",
      "학년": 1,
      "재학상태": "ENROLLED",
      "소속학과": {
        "학과_id": 1,
        "학과명": "신학과"
      }
    },
    "createdAt": "2026-01-07T10:30:00"
  },
  "meta": {}
}
```

---

### 2-2. 학생 목록 조회 (페이징)
GET `/api/admin/students?page=1&size=20`

Response
```json
{
  "data": [
    {
      "계정_id": 1001,
      "로그인아이디": "s20250001",
      "이름": "홍길동",
      "학번": "20250001",
      "학년": 1,
      "재학상태": "ENROLLED",
      "소속학과": {
        "학과_id": 1,
        "학과명": "신학과"
      }
    }
  ],
  "meta": {
    "page": 1,
    "size": 20,
    "totalElements": 1,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false,
    "sort": ["createdAt,desc"]
  }
}
```

---

### 2-3. 학생 소속 학과 변경
PATCH `/api/admin/students/{계정_id}/dept`

Response
```json
{
  "data": {
    "계정_id": 1001,
    "소속학과": {
      "학과_id": 2,
      "학과명": "기독교교육과"
    },
    "updatedAt": "2026-01-07T14:00:00"
  },
  "meta": {}
}
```

---

## 3. 교수 계정 관리 API (관리자)

### 3-1. 교수 계정 생성
POST `/api/admin/professors`

Response
```json
{
  "data": {
    "계정_id": 2001,
    "로그인아이디": "t90001",
    "계정유형": "PROFESSOR",
    "상태": "ACTIVE",
    "교수프로필": {
      "교번": "90001",
      "이름": "김교수",
      "소속학과": {
        "학과_id": 1,
        "학과명": "신학과"
      }
    },
    "createdAt": "2026-01-07T10:40:00"
  },
  "meta": {}
}
```

---

### 3-2. 교수 목록 조회 (페이징)
GET `/api/admin/professors?page=1&size=20`

Response
```json
{
  "data": [
    {
      "계정_id": 2001,
      "로그인아이디": "t90001",
      "이름": "김교수",
      "교번": "90001",
      "소속학과": {
        "학과_id": 1,
        "학과명": "신학과"
      }
    }
  ],
  "meta": {
    "page": 1,
    "size": 20,
    "totalElements": 1,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false,
    "sort": ["createdAt,desc"]
  }
}
```

---

### 3-3. 교수 소속 학과 변경
PATCH `/api/admin/professors/{계정_id}/dept`

Response
```json
{
  "data": {
    "계정_id": 2001,
    "소속학과": {
      "학과_id": 3,
      "학과명": "선교학과"
    },
    "updatedAt": "2026-01-07T15:00:00"
  },
  "meta": {}
}
```

---

## 공통 에러 응답 예시

### VALIDATION_ERROR (400)

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "소속학과_id는 필수입니다.",
    "fieldErrors": [
      { "field": "소속학과_id", "reason": "required" }
    ]
  }
}
```
