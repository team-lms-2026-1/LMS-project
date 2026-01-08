## 공통 응답 포맷 ##

1. 공통 응답 포맷

{
  "data": {},
  "meta": {
    "requestId": "01HZZ... (옵션)"
  }
}

2. 페이징 규칙

{
  "data": [ ... ],
  "meta": {
    "page": 1,
    "size": 20,
    "totalElements": 153,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false,
    "sort": ["createdAt,desc"]
  }
}

3. 에러 응답 포맷

{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "요청값이 올바르지 않습니다.",
    "fieldErrors": [
      { "field": "title", "reason": "required" }
    ]
  }
}

- VALIDATION_ERROR (400)
- UNAUTHORIZED (401)
- FORBIDDEN (403)
- NOT_FOUND (404)
- CONFLICT (409) : 중복/상태충돌
- INTERNAL_ERROR (500)

4. 날짜/시간 규칙

서버/클라이언트 모두 ISO-8601
 ex "2026-01-07T10:00:00"

5. 파일 업로드 / 다운로드 공통

{
  "data": [
    {
      "fileId": 501,
      "originalName": "guide.pdf",
      "contentType": "application/pdf",
      "fileSize": 123456,
      "downloadUrl": "/api/v1/files/501/download"
    }
  ],
  "meta": {}
}
