## 1. 커뮤니티

## 공통 항목

# 카테고리 ( 공지 : notice , 자료실 : resources, FAQ : faq, Q&A : qna )

## 1-1. 카테고리 목록 조회 ( 공지 카테고리로 예시 )
GET `/notices/categories?page=1&size=20`
검색
GET `/notices/categories?keyword=카테고리명&page=1&size=20`

Response
{
  "data": [
    {
      "categoryId": 1,
      "name": "일반",
      "postCount" : 12,
      "bgColorHex": "#EEF2FF",
      "textColorHex": "#1E3A8A",
      "createdAt": "2026-01-01T09:00:00"
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
※ 권한: ADMIN
PATCH `/notices/categories/{categoryId}`

Request
{
    "name": "카테고리명",
    "bgColorHex": "#EEF2FF",
    "textColorHex": "#1E3A8A"
}

Response
{
  "data": {
    "success": true
   },
  "meta": {}
}

## 1-3. 카테고리 삭제
※ 권한: ADMIN
DELETE `/notices/categories/{categoryId}`

Request

empty

Response


{
  "data": {
    "success": true
   },
  "meta": {}
}

# 2. 공지사항 (Notice)

## 2-1. 공지사항 목록
GET `/notices?categoryId=1&page=1&size=20`
검색
GET `/notices?categoryId=10&keyword=공지사항명&page=1&size=20`

Response
{
  "data": [
    {
      "noticeId": 101,
      "category": {
        "categoryId": 1,
        "name": "카테고리명",
        "bgColorHex": "#EEF2FF",
        "textColorHex": "#1E3A8A"
      },
      "title": "시스템 점검 안내",
      "viewCount": 124,
      "createdAt": "2026-01-06T12:00:00"
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
        "downloadUrl": "/api/v1/files/501/download"
      }
    ],
    "createdAt": "2026-01-06T12:00:00"
  },
  "meta": {}
}

---

## 2-3. 등록 (관리자)
※ 권한: ADMIN
POST `/notices`

Request
{
  "categoryId": 1,
  "title": "시스템 점검 안내",
  "content": "<p>...</p>",
  "attachmentIds": [501, 502]
}

Response
{
  "data": {
    "success": true
   },
  "meta": {}
}

---

## 2-4. 수정 (관리자)
※ 권한: ADMIN
PATCH `/notices/{noticeId}`

Request
{
  "categoryId": 1,
  "title": "시스템 점검 안내(수정)",
  "content": "<p>수정...</p>",
  "attachmentIds": [501]
}

Response
{
  "data": {
    "success": true
   },
  "meta": {}
}

---

## 2-5. 삭제 (관리자)
※ 권한: ADMIN
DELETE `/notices/{noticeId}`

Response
{
  "data": {
    "success": true
   },
  "meta": {}
}

---

# 3. 자료실 (Resource)

## 3-1. 목록 (제목 검색)
GET `/resources?categoryId=10&page=1&size=20`
검색
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
      "createdAt": "2026-01-05T10:00:00"
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

## 3-2. 상세 (+첨부)  ※ 조회수 증가
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
    "attachments": [
      {
        "fileId": 601,
        "originalName": "휴학신청서.hwp",
        "contentType": "application/x-hwp",
        "fileSize": 99999,
        "downloadUrl": "/files/601/download"
      }
    ],
    "createdAt": "2026-01-05T10:00:00"
  },
  "meta": {}
}

---

## 3-3. 등록 (관리자)
※ 권한: ADMIN
POST `/resources`

Request
{
  "categoryId": 10,
  "title": "휴학 신청서",
  "content": "<p>...</p>",
  "attachmentIds": [601, 602]
}

Response
{
  "data": {
    "success": true
   },
  "meta": {}
}
---

## 3-4. 수정 (관리자)
※ 권한: ADMIN
PATCH `/resources/{resourceId}`
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
  "data": {
    "success": true
   },
  "meta": {}
}

---

## 3-5. 삭제 (관리자)
※ 권한: ADMIN
DELETE `/resources/{resourceId}`

Response
{
  "data": {
    "success": true
   },
  "meta": {}
}

---

# 4. FAQ

## 4-1. 목록 (제목 검색)
GET `/faqs?categoryId=20&page=1&size=20`
검색
GET `/faqs?categoryId=20&keyword=자주묻는질문&page=1&size=20`

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
      "createdAt": "2026-01-02T10:00:00"
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

## 4-2. 상세  ※ 조회수 증가
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
    "createdAt": "2026-01-02T10:00:00"
  },
  "meta": {}
}

---

## 4-3. 등록 (관리자)
※ 권한: ADMIN
POST `/faqs`

Request
{
  "categoryId": 20,
  "title": "비밀번호를 잊어버렸어요",
  "content": "<p>...</p>"
}

Response
{
  "data": {
    "success": true
   },
  "meta": {}
}

---

## 4-4. 수정 (관리자)
※ 권한: ADMIN
PATCH `/faqs/{faqId}`

Request
{
  "categoryId": 20,
  "title": "비밀번호를 잊어버렸어요(수정)",
  "content": "<p>수정...</p>"
}

Response
{
  "data": {
    "success": true
   },
  "meta": {}
}

---

## 4-5. 삭제 (관리자)
※ 권한: ADMIN
DELETE `/faqs/{faqId}`

Response
{
  "data": {
    "success": true
   },
  "meta": {}
}

---

# 5. Q&A

## 5-1. 질문 목록 (제목 검색)
GET `/qna/questions?categoryId=20&page=1&size=20`
검색
GET `/qna/questions?categoryId=20&keyword=질문&page=1&size=20`

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

## 5-2. 질문 상세 (+답변)  ※ 조회수 증가
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
    "author": { "accountId": 1001, "name": "관리자" },
    "createdAt": "2026-01-06T10:00:00",
    "answer": {
      "answerId": 90001,
      "content": "<p>학사팀에 문의하세요...</p>",
      "createdAt": "2026-01-06T12:00:00"
    }
  },
  "meta": {}
}

---

## 5-3. 질문 등록 (학생)
※ 권한: STUDENT
POST `/qna/questions`

Request
{
  "categoryId": 30,
  "title": "휴학 절차가 궁금합니다",
  "content": "<p>휴학은 어떻게 하나요?</p>"
}

Response
{
  "data": {
    "success": true
   },
  "meta": {}
}

---

## 5-4. 질문 수정 (작성자만 즉 학생만)
※ 권한: STUDENT (작성자)
PATCH `/qna/questions/{questionId}`

Request
{
  "categoryId": 30,
  "title": "휴학 절차가 궁금합니다(수정)",
  "content": "<p>수정...</p>"
}

Response
{
  "data": {
    "success": true
   },
  "meta": {}
}

---

## 5-5. 질문 삭제 (작성자랑 관리자)
※ 권한: ADMIN , STUDENT(작성자)
DELETE `/qna/questions/{questionId}`

Response
{
  "data": {
    "success": true
   },
  "meta": {}
}

---

## 5-6. 답변 등록 ( 질문당 1개만 )
※ 권한: ADMIN
POST `/qna/questions/{questionId}/answer`

Request
{
  "content": "<p>학사팀에 문의하세요...</p>"
}

Response
{
  "data": {
    "success": true
   },
  "meta": {}
}

## 5-7. 답변 수정
※ 권한: ADMIN
PATCH `/qna/questions/{questionId}/answer`

Request
{
  "content": "<p>수정된 답변...</p>"
}

Response
{
  "data": {
    "success": true
   },
  "meta": {}
}

## 5-8. 답변 삭제
※ 권한: ADMIN
DELETE `/qna/questions/{questionId}/answer`

Response
{
  "data": {
    "success": true
   },
  "meta": {}
}

