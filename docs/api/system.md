## 시스템관리

## 0-1. 학과 비활성화(토글)
PATCH `/depts/{deptId}/active`

Request
{ "isActive": false }

Response
{ "data": { "success": true }, "meta": {} }


## 0-1. 교수 목록 드롭다운
GET `/professors/options`

Response
{
  "data": [
    { "accountId": 9102, "professorNo": "200000", "name": "김교수" },
    { "accountId": 9120, "professorNo": "200001", "name": "나교수" }
  ],
  "meta": {}
}


## 1. 시스템 계정관리

## 1-1. 계정 목록 조회 ( 2개 api  상단 + 하단)
GET `/system-accounts/summary` (상단)

Response
{
  "data": {
    "totalAccounts": 1523,
    "onlineAccounts": 37,
    "onlineWithinMinutes": 5,
    "asOf": "2026-01-13T10:00:00"
  },
  "meta": {}
}

GET `/system-accounts` (하단)
검색
GET `/system-accounts?keyword=김&page=1&size=20`

Response
{
  "data": [
    {
      "accountId": 9001,
      "loginId": "s20260001",
      "accountType": "STUDENT",

      "name": "홍길동",

      "isOnline": true,
      "lastActiveAt": "2026-01-13T09:59:12"
    }
  ],
  "meta": {
    "page": 1,
    "size": 20,
    "totalElements": 153,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false,
    "sort": ["lastLoginAt,desc"]
  }
}

## 1-2. 계정 로그 상세페이지
GET `/admin/accounts/{accountId}`

Query
- from (required): YYYY-MM-DD  // 캘린더 시작일
- to (required): YYYY-MM-DD    // 캘린더 종료일
- page (optional, default=1)
- size (optional, default=20)

Response
{
  "data": {
    "account": {
      "accountId": 9001,
      "loginId": "s20260001",
      "accountType": "STUDENT",
      "name": "홍길동",
      "dept": { "deptId": 10, "deptName": "컴퓨터공학과" }
    },

    "range": {
      "from": "2026-01-01",
      "to": "2026-01-13"
    },

    "logs": [
      {
        "logId": 12001,
        "accessedAt": "2026-01-13T10:20:12",
        "url": "/api/v1/admin/accounts?page=1",
        "ip": "203.0.113.10",
        "os": "Windows"
      },
      {
        "logId": 12000,
        "accessedAt": "2026-01-13T10:18:02",
        "url": "/api/v1/admin/access-logs?page=1",
        "ip": "203.0.113.10",
        "os": "Windows"
      }
    ]
  },
  "meta": {
    "page": 1,
    "size": 20,
    "totalElements": 8932,
    "totalPages": 447,
    "hasNext": true,
    "hasPrev": false,
    "sort": "accessedAt,DESC"
  }
}

## 1-2. 계정 로그 다운로드
POST `/admin/accounts/{accountId}/download-requests`

{
  "from": "2026-01-01",
  "to": "2026-01-13",
  "agree": true,
  "reason": "감사 대응을 위한 접속이력 제출"
}

## 1-3. 실제 파일 다운로드 (스트리밍)

GET `/admin/access-log-downloads/{downloadId}/file`