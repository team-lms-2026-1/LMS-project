## 멘토링 공통 규칙

## 1. 멘토링 모집 관리 ( 관리자 )

## 1-1. 멘토링 모집 조회
GET `/mentoring-recruitments?page=1&size=20`
검색
GET `/mentoring-recruitments?keyword=카테고리명&page=1&size=20`

{
  "data": [
    {
      "recruitmentId": 101,
      "semesterId" : 12,
      "title": "2026-1학기 지도교수 멘토링 모집",
      "recruitmentStartAt": "2026-03-02T09:00:00",
      "recruitmentEndAt": "2026-03-16T23:59:59",
      "status": "OPEN",
      "createdAt": "2026-02-20T10:00:00",
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

## 1-2. 멘토링 모집 상세보기
GET `/mentoring-recruitments/{recruitmentId}`

{
  "semesterId": 12,
  "title": "2026-1학기 지도교수 멘토링 모집",
  "description": "<p>학기 초 지도교수 멘토링 모집 안내</p>",
  "recruitmentStartAt": "2026-03-02T09:00:00",
  "recruitmentEndAt": "2026-03-16T23:59:59"
}

## 1-3. 멘토링 모집 등록
POST `/mentoring-recruitments`

Request
{
  "semesterId": 12,
  "title": "2026-1학기 지도교수 멘토링 모집",
  "description": "<p>학기 초 지도교수 멘토링 모집 안내</p>",
  "recruitmentStartAt": "2026-03-02T09:00:00",
  "recruitmentEndAt": "2026-03-16T23:59:59"
}


Response
{
  "data": {
    "success": true
   },
  "meta": {}
}

## 1-4. 멘토링 모집 수정
PATCH `/mentoring-recruitments/{recruitmentId}`

Request
{
  "title": "2026-1학기 지도교수 멘토링 모집",
  "description": "<p>학기 초 지도교수 멘토링 모집 안내</p>",
  "recruitmentStartAt": "2026-03-02T09:00:00",
  "recruitmentEndAt": "2026-03-16T23:59:59"
}

Response
{
  "data": {
    "success": true
   },
  "meta": {}
}

## 1-5. 멘토링 모집 삭제
DELETE `/mentoring-recruitments/{recruitmentId}`

Response
{
  "data": {
    "success": true
   },
  "meta": {}
}

## 2. 멘토링 신청 결과 관리 ( 관리자 )

## 2.1 멘토링 신청 결과 목록

GET `/mentoring-applications?page=1&size=20`
검색
GET /mentoring-applications?
  recruitmentId=101
  &role=MENTEE
  &status=APPLIED
  &keyword=홍길동
  &page=1
  &size=20

Response
{
  "data": [
    {
      "applicationId": 501,
      "recruitmentId": 101,
      "role": "MENTEE",
      "account": {
        "accountId": 3001,
        "name": "홍길동",
        "department": "컴퓨터공학과",
        "grade": 3
      },
      "status": "APPLIED",
      "appliedAt": "2026-03-03T14:22:00",
      "processedAt": null,
    }
  ],
  "meta": {
    "page": 1,
    "size": 20,
    "totalElements": 32,
    "totalPages": 2,
    "hasNext": true,
    "hasPrev": false,
    "sort": ["appliedAt,desc"],
    "stats": {
        "MENTEE": {
            "total": 128,
            "applied": 20,
            "approved": 90,
            "rejected": 15,
            "canceled": 3,
            "matched": 0
        },
        "MENTOR": {
            "total": 12,
            "applied": 2,
            "approved": 8,
            "rejected": 1,
            "canceled": 1,
            "matched": 0
        }
    }
  }
}

## 2.1 멘토링 신청 승인 
POST `/mentoring-applications/{applicationId}/approve`

Response
{
  "data": {
    "success": true
   },
  "meta": {}
}

## 2.2 멘토링 신청 반려사유
POST `/mentoring-applications/{applicationId}/reject`

Request
{
  "data": {
    "rejectReason": "신청 요건 미충족"
   },
  "meta": {}
}

Response
{
  "data": {
    "success": true
   },
  "meta": {}
}

## 3. 멘토링 배치 관리 ( 관리자 )

## 3.1 멘토링 배치 관리 페이지
학기 선택후 > 학기별 모집 선택 ( 2단 로딩 )

GET `/mentoring-batch/semesters`
Response
{
  "data": [
    { "semesterId": 12 },
    { "semesterId": 13 }
  ],
  "meta": {}
}

GET `/mentoring-batch/recruitments?semesterId=12` (CLOSED 만)
{
  "data": [
    {
      "recruitmentId": 101,
      "title": "2026-1학기 지도교수 멘토링 모집"
    }
  ],
  "meta": {}
}

GET `/mentoring-batch/recruitments/{recruitmentId}`
{
  "data": {
    "recruitment": {
      "recruitmentId": 101,
      "semesterId": 12,
      "title": "2026-1학기 지도교수 멘토링 모집",
      "recruitmentStartAt": "2026-03-02T09:00:00",
      "recruitmentEndAt": "2026-03-16T23:59:59",
      "status": "CLOSED"
    },
    "mentors": [
      {
        "mentorApplicationId": 701,
        "accountId": 5001,
        "name": "김교수",
        "department": "컴퓨터공학과",
      }
    ],
    "mentees": [
      {
        "menteeApplicationId": 801,
        "accountId": 3001,
        "name": "홍길동",
        "department": "컴퓨터공학과",
      }
    ],
    "counts": {
      "mentorApproved": 8,
      "menteeApproved": 50
    },
  },
  "meta": {}
}

## 3-4. 멘토링 배치 확정 저장 ( 한번 재배치 완료된 모집은 수정 불가 )
POST `/mentoring-batch/recruitments/{recruitmentId}/commit`

Request
{
  "assignments": [
    {
      "menteeApplicationId": 801,
      "mentorApplicationId": 701
    },
    {
      "menteeApplicationId": 802,
      "mentorApplicationId": 701
    }
  ]
}

Response
{
  "data": {
    "success": true
   },
  "meta": {}
}

## 4. 멘토링 Q&A 관리 ( 관리자 )

## 4-1. 멘토링 Q&A 목록 페이지
2단 로딩

GET `/mentoring-qna/semesters`
{
  "data": [
    { "semesterId": 12 },
    { "semesterId": 13 }
  ],
  "meta": {}
}

GET `/mentoring-qna/recruitments?semesterId=12`
{
  "data": [
    {
      "recruitmentId": 101,
      "title": "2026-1학기 지도교수 멘토링 모집",
      "status": "CLOSED"
    }
  ],
  "meta": {}
}

GET `/mentoring-qna/rooms?recruitmentId=101&page=1&size=20`
{
  "data": [
    {
      "matchingId": 9001,
      "mentee": {
        "accountId": 3001,
        "name": "홍길동",
        "department": "컴퓨터공학과",
        "grade": 3
      },
      "mentor": {
        "accountId": 5001,
        "name": "김교수",
        "department": "컴퓨터공학과"
      },
      "answerCount": 2,
      "status": "ANSWER_PENDING",
      "lastMessageAt": "2026-03-25T13:40:00"
    }
  ],
  "meta": {
    "page": 1,
    "size": 20,
    "totalElements": 153,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false,
    "sort": ["lastMessageAt,desc"]
  }
}

## 4-2. 멘토링 Q&A 대화 상세페이지 (메시지 타임라인)

GET `/mentoring-qna/rooms/{matchingId}`
{
  "data": {
    "matchingId": 9001,
    "recruitmentId": 101,
    "mentee": {
      "accountId": 3001,
      "name": "홍길동",
      "department": "컴퓨터공학과",
      "grade": 3
    },
    "mentor": {
      "accountId": 5001,
      "name": "김교수",
      "department": "컴퓨터공학과"
    },
    "status": "ANSWER_PENDING",
    "messages": [
      {
        "type": "QUESTION",
        "questionId": 7001,
        "authorAccountId": 3001,
        "content": "지도교수 상담 관련 질문드립니다.",
        "createdAt": "2026-03-25T13:40:00"
      }
    ]
  },
  "meta": {}
}