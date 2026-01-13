## 비교과 운영상태 규칙 (status)

- `DRAFT | OPEN | ENROLLMENT_CLOSED | IN_PROGRESS | COMPLETED | CANCELED`

- DRAFT: 임시저장. 수정/삭제 가능
- OPEN: 수강신청 가능
- ENROLLMENT_CLOSED: 수강신청 마감
- IN_PROGRESS: 운영 중 (회차 추가 가능)
- COMPLETED: 운영 종료 (COMPLETED 전환 시 수강생 수료/미수료 확정)
- CANCELED: 개설 취소 (OPEN 이후라도 가능)


## 0-1. 학기 목록 조회
GET `/semesters/options`

Response
{
  "data": [
    { "semesterId": 1, "year": 2026, "term": 1 },
    { "semesterId": 2, "year": 2025, "term": 2 }
  ],
  "meta": {}
}


## 0-2. 비교과 목록 드롭다운
GET `/extra-curricular/options`

Response
{
  "data": [
    { "extraCurricularId": 1, "extraCurricularName": "학생 성장 학습법-1" },
    { "extraCurricularId": 2, "extraCurricularName": "학생 성장 학습법-2" }
  ],
  "meta": {}
}


# 1. 비교과 관리 (관리자) - 프로그램(마스터)

## 1-1. 비교과 목록
GET `/extra-curricular?page=1&size=20`
검색
GET `/extra-curricular?keyword=비교과명&page=1&size=20`

Response
{
  "data": [
    {
      "extraCurricularId": 101,
      "extraCurricularCode": "ST101",
      "extraCurricularName": "학생 성장 학습법",
      "hostOrgName": "본교",
      "isActive": true,
      "createdAt": "2026-01-07T10:00:00"
    }
  ],
  "meta": {
    "page": 1,
    "size": 20,
    "totalElements": 42,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false,
    "sort": ["createdAt,desc"]
  }
}


## 1-2. 비교과 상세
GET `/extra-curricular/{extraCurricularId}`

Response
{
  "data": {
    "extraCurricularId": 101,
    "extraCurricularCode": "ST101",
    "extraCurricularName": "학생 성장 학습법",
    "hostOrgName": "본교",
    "description": "어쩌구.",
    "isActive": true,
    "createdAt": "2026-01-07T10:00:00",
    "updatedAt": "2026-01-09T15:30:00"
  },
  "meta": {}
}


## 1-3. 비교과 등록
POST `/extra-curricular`

Request
{
  "extraCurricularCode": "ST101",
  "extraCurricularName": "학생 성장 학습법",
  "hostOrgName": "본교",
  "description": "어쩌구.",
  "isActive": true
}

Response
{
  "data": {
    "success": true
   },
  "meta": {}
}



## 1-4. 비교과 수정
PATCH `/extra-curricular/{extraCurricularId}`

Request
{
  "extraCurricularCode": "ST101",
  "extraCurricularName": "학생 성장 학습법(수정)",
  "hostOrgName": "본교",
  "description": "어쩌구(수정).",
  "isActive": true
}

Response
{
  "data": {
    "success": true
   },
  "meta": {}
}



# 2. 비교과 운영 관리 (관리자) - 운영(Offering)

## 2-1. 비교과 운영 목록
GET `/extra-curricular-offerings?page=1&size=20`
검색
GET `/extra-curricular-offerings?semesterId=1&keyword=비교과명&page=1&size=20`
필터
GET `/extra-curricular-offerings?semesterId=1&status=OPEN&page=1&size=20`

Response
{
  "data": [
    {
      "extraOfferingId": 501,
      "extraOfferingCode": "TH101-000",
      "extraOfferingName": "2026-1학기 학생 성장 학습법 1차",

      "extraCurricular": {
        "extraCurricularId": 101,
        "extraCurricularName": "학생 성장 학습법",
        "hostOrgName": "본교"
      },

      "hostManagerName": "김담당",
      "pointDefault": 5,
      "recognizedHoursDefault": 2,

      "semester": {
        "semesterId": 12,
        "year": 2026,
        "term": 1
      },

      "status": "OPEN",
      "operationStartAt": "2026-03-01T00:00:00",
      "operationEndAt": "2026-04-30T23:59:59",

      "createdAt": "2026-01-07T10:00:00"
    }
  ],
  "meta": {
    "page": 1,
    "size": 20,
    "totalElements": 60,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false,
    "sort": ["createdAt,desc"]
  }
}

## 2-2. 비교과 운영 상세
GET `/extra-curricular-offerings/{extraOfferingId}`

Response
{
  "data": {
    "extraOfferingId": 501,
    "extraOfferingCode": "TH101-000",
    "extraOfferingName": "2026-1학기 학생 성장 학습법 1차",

    "status": "OPEN",

    "semester": {
      "semesterId": 12,
      "year": 2026,
      "term": 1
    },

    "operationStartAt": "2026-03-01T00:00:00",
    "operationEndAt": "2026-04-30T23:59:59",

    "pointTotal": 30,
    "recognizedHoursTotal": 30,

    "extraCurricular": {
      "extraCurricularId": 101,
      "extraCurricularCode": "ST101",
      "extraCurricularName": "학생 성장 학습법",
      "hostOrgName": "본교",
      "description": "어쩌구.",
      "isActive": true
    },

    "host": {
      "hostManagerName": "김담당",
      "hostEmail": "manager@school.ac.kr",
      "hostPhone": "010-1234-5678"
    },

    "sessions": [
      {
        "sessionId": 9001,
        "sessionName": "1회차",

        "startAt": "2026-03-10T10:00:00",
        "endAt": "2026-03-17T12:00:00",

        "status": "OPEN",

        "completionPoint": 2,
        "recognizedHours": 2,

        "video": {
          "videoId": 3001,
          "title": "학생 성장 학습법 1회차 강의",
          "videoUrl": "https://www.youtube.com/watch?v=abcdef",
          "storageKey": null,
          "durationSeconds": 1800
        }
      },
      {
        "sessionId": 9002,
        "sessionName": "2회차",
        "startAt": "2026-03-17T10:00:00",
        "endAt": "2026-03-17T12:00:00",
        "status": "OPEN",
        "completionPoint": 2,
        "recognizedHours": 2,

        "video": {
          "videoId": 3001,
          "title": "학생 성장 학습법 2회차 강의",
          "videoUrl": "https://www.youtube.com/watch?v=abcdef",
          "storageKey": null,
          "durationSeconds": 1800
        }
      }
    ],

    "createdAt": "2026-01-07T10:00:00",
    "updatedAt": "2026-01-12T16:10:00"
  },
  "meta": {}
}


## 2-5. 비교과 회차출석조회 (관리자)

- 신청은 **운영 단위**(비교과신청)
- 출석은 **회차 단위**(비교과회차이수)
- 관리자는 **조회(GET)만** 제공
- 관리자 화면에서는 “운영 상세”에서 **회차를 선택(필터)** 해서 출석현황을 봄

---

## 2-5-0. (출석관리 화면용) 운영의 회차 목록 옵션
GET `/extra-curricular-offerings/{extraOfferingId}/sessions/options`

Response
{
  "data": [
    {
      "sessionId": 9001,
      "sessionName": "1회차",
      "startAt": "2026-03-10T10:00:00",
      "endAt": "2026-03-10T12:00:00",
      "status": "OPEN"
    },
    {
      "sessionId": 9002,
      "sessionName": "2회차",
      "startAt": "2026-03-17T10:00:00",
      "endAt": "2026-03-17T12:00:00",
      "status": "OPEN"
    }
  ],
  "meta": {}
}

---
## 2-5-1. 출석 현황 조회 (운영 + 회차 필터)
GET `/extra-curricular-offerings/{extraOfferingId}/attendance?page=1&size=20&sessionId=9001`
검색
GET `/extra-curricular-offerings/{extraOfferingId}/attendance?sessionId=9001&keyword=홍길동&page=1&size=20`

Response
{
  "data": [
    {
      "applicationId": 7001,
      "student": {
        "accountId": 9001,
        "studentNo": "20260001",
        "name": "홍길동",
        "gradeLevel": 2,
        "enrollmentStatus": "ENROLLED"
      },
      "appliedAt": "2026-03-01T10:00:00",
      "attendance": {
        "isAttended": true,
        "attendedAt": "2026-03-10T11:55:00"
      },
      "earned": {
        "point": 5,
        "hours": 2
      }
    },
    {
      "applicationId": 7002,
      "student": {
        "accountId": 9002,
        "studentNo": "20260002",
        "name": "김학생",
        "gradeLevel": 1,
        "enrollmentStatus": "ENROLLED"
      },
      "appliedAt": "2026-03-02T09:00:00",
      "attendance": {
        "isAttended": false,
        "attendedAt": null
      },
      "earned": {
        "point": 0,
        "hours": 0
      }
    }
  ],
  "meta": {
    "page": 1,
    "size": 20,
    "totalElements": 80,
    "totalPages": 4,
    "hasNext": true,
    "hasPrev": false,
    "sort": ["appliedAt,asc"]
  },
  "summary": {
    "totalStudents": 80,
    "attendedCount": 65,
    "absentCount": 15
  }
}


## 3. 역량맵핑 현황 조회 및 관리

## 3-1. 비교과 역량 현황 목록
GET `/extra-curricular-mapping?page=1&size=20`
검색
GET `/extra-curricular-mapping?semesterId=1&keyword=교과명&page=1&size=20`

Response
{
  "data": [
    {
      "extraOfferingId": 501,
      "extraOfferingCode": "TH101-000",
      "extraOfferingName" : "test"

      "hostManagerName": "김담당",

      "mappingStatus": "MAPPED", 
      "keyCompetencies": [
        { "competencyId": 1, "code": "C1", "name": "의사소통", "weight": 5 },
        { "competencyId": 3, "code": "C3", "name": "비판적사고", "weight": 5 }
      ],

      "semester": {
        "semesterId": 12,
        "year": 2026,
        "term": 1
      },

      "status": "OPEN",
      "createdAt": "2026-02-20T10:00:00"
    }
  ],
  "meta": {
    "page": 1,
    "size": 20,
    "totalElements": 60,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false,
    "sort": ["createdAt,desc"]
  }
}



## 3-2. 비교과 역량 매핑 상세
GET `/extra-curricular-mapping/{extraOfferingId}`

Response
{
  "data": {
    "extraOfferingId": 101,
    "extraOfferingCode": "TH101-001",
    "extraOfferingName" : "test"

    "hostManagerName": "김담당",

    "semester": {
      "semesterId": 12,
      "year": 2026,
      "term": 1
    },

    "keyCompetencies": [
      { "competencyId": 1, "code": "C1", "name": "의사소통", "weight": 4 },
      { "competencyId": 3, "code": "C3", "name": "비판적사고", "weight": 3 }
    ],
    "competencies": [
        { "competencyId": 1, "code": "C1", "name": "의사소통", "weight": 4 },
        { "competencyId": 2, "code": "C2", "name": "협업", "weight": 3 },
        { "competencyId": 3, "code": "C3", "name": "비판적사고", "weight": 3 },
        { "competencyId": 4, "code": "C4", "name": "창의성", "weight": 2 },
        { "competencyId": 5, "code": "C5", "name": "문제해결", "weight": 4 },
        { "competencyId": 6, "code": "C6", "name": "자기주도", "weight": 2 }
    ]

    "status": "OPEN",
    
    "createdAt": "2026-01-07T10:00:00",
  },
  "meta": {}
}

## 3-3. 비교과 역량 매핑 등록
POST `/extra-curricular-mapping`

Request
{
  "extraOfferingId": 101,
  "competencies": [
    { "competencyId": 1, "weight": 4 },
    { "competencyId": 2, "weight": 3 },
    { "competencyId": 3, "weight": 3 },
    { "competencyId": 4, "weight": 2 },
    { "competencyId": 5, "weight": 4 },
    { "competencyId": 6, "weight": 2 }
  ]
}

Response
{
  "data": {
    "success": true
   },
  "meta": {}
}


## 3-4. 비교과 역량 매핑 수정
PATCH `/extra-curricular-mapping/{extraOfferingId}`

Request
{
  "competencies": [
    { "competencyId": 1, "weight": 5 },
    { "competencyId": 2, "weight": 2 },
    { "competencyId": 3, "weight": 3 },
    { "competencyId": 4, "weight": 1 },
    { "competencyId": 5, "weight": 4 },
    { "competencyId": 6, "weight": 2 }
  ]
}

Response
{
  "data": {
    "success": true
   },
  "meta": {}
}