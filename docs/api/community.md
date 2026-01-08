## 1. 커뮤니티

## 공통 항목

# 카테고리 ( 공지 : notice , 자료실 : resources, FAQ : faq, Q&A : qna )

## 1-1. 카테고리 목록 조회
GET `/notices/categories?page=1&size=20`

Response
{
  "data": [
    {
      "categoryId": 1,
      "name": "일반",
      "postCount" : 12,
      "bgColorHex": "#EEF2FF",
      "textColorHex": "#1E3A8A",
      "createdAt": "2026-01-01T09:00:00",
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

## 1-2. 카테고리 목록 수정
PATCH `/notices/categories/{categoryId}`

Request

{
    "name": "카테고리명",
    "bgColorHex": "#EEF2FF",
    "textColorHex": "#1E3A8A",
}

Response

{
  "data": {
    "name": "카테고리명",
    "bgColorHex": "#EEF2FF",
    "textColorHex": "#1E3A8A",
   },
  "meta": {
  }
}

## 1-3. 카테고리 삭제
DELETE `/notices/categories/{categoryId}`

Request

empty

Response


{
  "data": {
    "deleted": true
   },
  "meta": {
  }
}

# 2. 공지사항 (Notice)

## 2-1. 목록
GET `/notices/categories?page=1&size=20`

Response
{
  "data": {
    "noticeId": 101,
    "category": {
      "categoryId": 1,
      "name": "카테고리명",
      "bgColorHex": "#EEF2FF",
      "textColorHex": "#1E3A8A"
    },
    "title": "시스템 점검 안내",
    "content": "<p>...</p>",
    "viewCount": 124,
    "createdAt": "2026-01-06T12:00:00",
  },
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

## 2-2. 상세 (+첨부)  ※ 조회수 증가
GET `/notices/{noticeId}`

Response
{
  "data": {
    "noticeId": 101,
    "category": {
      "categoryId": 1,
      "name": "일반",
      "bgColorHex": "#EEF2FF",
      "textColorHex": "#1E3A8A"
    },
    "title": "시스템 점검 안내",
    "content": "<p>...</p>",
    "viewCount": 124,
    "attachments": [
      {
        "fileId": 501,
        "originalName": "점검안내.pdf",
        "contentType": "application/pdf",
        "fileSize": 123456,
        "sortOrder": 0,
        "downloadUrl": "/api/v1/files/501/download"
      }
    ],
    "createdAt": "2026-01-06T12:00:00",
    "updatedAt": "2026-01-07T08:00:00"
  },
  "meta": {}
}

---

## 1-4. 등록 (관리자)
POST `/notices`
Content-Type: application/json

Request
{
  "categoryId": 1,
  "title": "시스템 점검 안내",
  "content": "<p>...</p>",
  "postStartAt": "2026-01-07T09:00:00",
  "postEndAt": null,
  "attachmentIds": [501, 502] 
}

Response (201)
{
  "data": {
    "noticeId": 101
  },
  "meta": {}
}

---

## 1-5. 수정 (관리자)
PUT `/notices/{noticeId}`
Content-Type: application/json

Request
{
  "categoryId": 1,
  "title": "시스템 점검 안내(수정)",
  "content": "<p>수정...</p>",
  "postStartAt": "2026-01-07T09:00:00",
  "postEndAt": null,
  "attachmentIds": [501] 
}

Response
{
  "data": { "noticeId": 101 },
  "meta": {}
}

---

## 1-6. 삭제 (관리자)
DELETE `/notices/{noticeId}`

Response
{
  "data": { "deleted": true },
  "meta": {}
}

---

# 2) 자료실 (Resource)

## 2-1. 카테고리 조회
GET `/resources/categories`

Response
{
  "data": [
    {
      "categoryId": 10,
      "name": "양식",
      "bgColorHex": "#EEF2FF",
      "textColorHex": "#1E3A8A",
      "createdAt": "2026-01-01T09:00:00",
      "updatedAt": "2026-01-02T09:00:00"
    }
  ],
  "meta": {}
}

---

## 2-2. 목록 (제목 검색)
Query
- `categoryId?`
- `keyword?` (제목)
- `page?`, `size?`

GET `/resources?categoryId=10&keyword=신청서&page=1&size=20`

Response
{
  "data": [
    {
      "resourceId": 201,
      "category": {
        "categoryId": 10,
        "name": "양식",
        "bgColorHex": "#EEF2FF",
        "textColorHex": "#1E3A8A"
      },
      "title": "휴학 신청서",
      "viewCount": 55,
      "author": { "accountId": 9001, "name": "관리자A" },
      "createdAt": "2026-01-05T10:00:00",
      "updatedAt": "2026-01-06T11:00:00"
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

---

## 2-3. 상세 (+첨부)  ※ 조회수 증가
GET `/resources/{resourceId}`

Response
{
  "data": {
    "resourceId": 201,
    "category": {
      "categoryId": 10,
      "name": "양식",
      "bgColorHex": "#EEF2FF",
      "textColorHex": "#1E3A8A"
    },
    "title": "휴학 신청서",
    "content": "<p>다운로드 후 작성하세요.</p>",
    "viewCount": 56,
    "author": { "accountId": 9001, "name": "관리자A" },
    "attachments": [
      {
        "fileId": 601,
        "originalName": "휴학신청서.hwp",
        "contentType": "application/x-hwp",
        "fileSize": 99999,
        "sortOrder": 0,
        "downloadUrl": "/api/v1/files/601/download"
      }
    ],
    "createdAt": "2026-01-05T10:00:00",
    "updatedAt": "2026-01-06T11:00:00"
  },
  "meta": {}
}

---

## 2-4. 등록 (관리자)
POST `/resources`
Content-Type: application/json

Request
{
  "categoryId": 10,
  "title": "휴학 신청서",
  "content": "<p>...</p>",
  "attachmentIds": [601, 602]
}

Response (201)
{
  "data": { "resourceId": 201 },
  "meta": {}
}

---

## 2-5. 수정 (관리자)
PUT `/resources/{resourceId}`
Content-Type: application/json

Request
{
  "categoryId": 10,
  "title": "휴학 신청서(수정)",
  "content": "<p>수정...</p>",
  "attachmentIds": [601]
}

Response
{
  "data": { "resourceId": 201 },
  "meta": {}
}

---

## 2-6. 삭제 (관리자)
DELETE `/resources/{resourceId}`

Response
{
  "data": { "deleted": true },
  "meta": {}
}

---

# 3) FAQ

## 3-1. 카테고리 조회
GET `/faqs/categories`

Response
{
  "data": [
    {
      "categoryId": 20,
      "name": "계정",
      "bgColorHex": "#EEF2FF",
      "textColorHex": "#1E3A8A",
      "createdAt": "2026-01-01T09:00:00",
      "updatedAt": "2026-01-02T09:00:00"
    }
  ],
  "meta": {}
}

---

## 3-2. 목록 (제목 검색)
Query
- `categoryId?`
- `keyword?`
- `page?`, `size?`

GET `/faqs?categoryId=20&keyword=비밀번호&page=1&size=20`

Response
{
  "data": [
    {
      "faqId": 301,
      "category": {
        "categoryId": 20,
        "name": "계정",
        "bgColorHex": "#EEF2FF",
        "textColorHex": "#1E3A8A"
      },
      "title": "비밀번호를 잊어버렸어요",
      "viewCount": 200,
      "author": { "accountId": 9001, "name": "관리자A" },
      "createdAt": "2026-01-02T10:00:00",
      "updatedAt": "2026-01-03T11:00:00"
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

---

## 3-3. 상세  ※ 조회수 증가
GET `/faqs/{faqId}`

Response
{
  "data": {
    "faqId": 301,
    "category": {
      "categoryId": 20,
      "name": "계정",
      "bgColorHex": "#EEF2FF",
      "textColorHex": "#1E3A8A"
    },
    "title": "비밀번호를 잊어버렸어요",
    "content": "<p>비밀번호 재설정 메뉴를 이용하세요.</p>",
    "viewCount": 201,
    "author": { "accountId": 9001, "name": "관리자A" },
    "createdAt": "2026-01-02T10:00:00",
    "updatedAt": "2026-01-03T11:00:00"
  },
  "meta": {}
}

---

## 3-4. 등록 (관리자)
POST `/faqs`
Content-Type: application/json

Request
{
  "categoryId": 20,
  "title": "비밀번호를 잊어버렸어요",
  "content": "<p>...</p>"
}

Response (201)
{
  "data": { "faqId": 301 },
  "meta": {}
}

---

## 3-5. 수정 (관리자)
PUT `/faqs/{faqId}`
Content-Type: application/json

Request
{
  "categoryId": 20,
  "title": "비밀번호를 잊어버렸어요(수정)",
  "content": "<p>수정...</p>"
}

Response
{
  "data": { "faqId": 301 },
  "meta": {}
}

---

## 3-6. 삭제 (관리자)
DELETE `/faqs/{faqId}`

Response
{
  "data": { "deleted": true },
  "meta": {}
}

---

# 4) Q&A

## 4-1. 카테고리 조회
GET `/qna/categories`

Response
{
  "data": [
    {
      "categoryId": 30,
      "name": "학사",
      "bgColorHex": "#EEF2FF",
      "textColorHex": "#1E3A8A",
      "createdAt": "2026-01-01T09:00:00",
      "updatedAt": "2026-01-02T09:00:00"
    }
  ],
  "meta": {}
}

---

## 4-2. 질문 목록 (제목 검색)
Query
- `categoryId?`
- `keyword?`
- `page?`, `size?`

GET `/qna/questions?categoryId=30&keyword=휴학&page=1&size=20`

Response
{
  "data": [
    {
      "questionId": 401,
      "category": {
        "categoryId": 30,
        "name": "학사",
        "bgColorHex": "#EEF2FF",
        "textColorHex": "#1E3A8A"
      },
      "title": "휴학 절차가 궁금합니다",
      "viewCount": 10,
      "author": { "accountId": 1001, "name": "학생A" },
      "createdAt": "2026-01-06T10:00:00",
      "updatedAt": "2026-01-06T10:00:00",
      "hasAnswer": true
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

---

## 4-3. 질문 상세 (+답변)  ※ 조회수 증가
GET `/qna/questions/{questionId}`

Response
{
  "data": {
    "questionId": 401,
    "category": {
      "categoryId": 30,
      "name": "학사",
      "bgColorHex": "#EEF2FF",
      "textColorHex": "#1E3A8A"
    },
    "title": "휴학 절차가 궁금합니다",
    "content": "<p>휴학은 어떻게 하나요?</p>",
    "viewCount": 11,
    "author": { "accountId": 1001, "name": "학생A" },
    "createdAt": "2026-01-06T10:00:00",
    "updatedAt": "2026-01-06T10:00:00",
    "answer": {
      "answerId": 90001,
      "author": { "accountId": 9001, "name": "관리자A" },
      "content": "<p>학사팀에 문의하세요...</p>",
      "createdAt": "2026-01-06T12:00:00",
      "updatedAt": "2026-01-06T12:00:00"
    }
  },
  "meta": {}
}

---

## 4-4. 질문 등록 (학생)
POST `/qna/questions`
Content-Type: application/json

Request
{
  "categoryId": 30,
  "title": "휴학 절차가 궁금합니다",
  "content": "<p>휴학은 어떻게 하나요?</p>"
}

Response (201)
{
  "data": { "questionId": 401 },
  "meta": {}
}

---

## 4-5. 질문 수정 (작성자만)
PUT `/qna/questions/{questionId}`
Content-Type: application/json

Request
{
  "categoryId": 30,
  "title": "휴학 절차가 궁금합니다(수정)",
  "content": "<p>수정...</p>"
}

Response
{
  "data": { "questionId": 401 },
  "meta": {}
}

---

## 4-6. 질문 삭제 (작성자만)
DELETE `/qna/questions/{questionId}`

Response
{
  "data": { "deleted": true },
  "meta": {}
}

---

## 4-7. 답변 등록/수정 (관리자)  ※ 질문당 1개만
### 등록(없을 때만)
POST `/qna/questions/{questionId}/answer`
Content-Type: application/json

Request
{
  "content": "<p>학사팀에 문의하세요...</p>"
}

Response (201)
{
  "data": { "answerId": 90001 },
  "meta": {}
}

### 수정(이미 있을 때)
PUT `/qna/questions/{questionId}/answer`
Content-Type: application/json

Request
{
  "content": "<p>수정된 답변...</p>"
}

Response
{
  "data": { "answerId": 90001 },
  "meta": {}
}

### 삭제(필요 시)
DELETE `/qna/questions/{questionId}/answer`

Response
{
  "data": { "deleted": true },
  "meta": {}
}

