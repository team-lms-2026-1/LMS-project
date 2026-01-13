##  교과

## 공통 

## 교과 운영상태 규칙

DRAFT | OPEN | ENROLLMENT_CLOSED | IN_PROGRESS | COMPLETED | CANCELED

DRAFT: 임시저장. 수정/삭제 가능

OPEN: 수강신청 가능

ENROLLMENT_CLOSED: 수강신청 마감(정원 확정)

IN_PROGRESS: 수업 운영 중(학기 진행 및 성적입력)

COMPLETED: 운영 종료(성적입력이 완료시 COMPLETED로 변경가능)

CANCELED: 개설 취소(OPEN 이후라도 가능)

## 교과 역량 매핑규칙

각 6개의 영역에 1점부터 5점까지 int형으로 매핑

## 0-1. 학기 목록 조회
GET `/semesters/options`
{
  "data": [
    {
      "semeseterId": 1,
      "year": 2026,
      "term": "1"
    },
    {
      "semeseterId": 2,
      "year": 2025,
      "term": "2"
    }
  ],
  "meta": {}
}

## 0-2. 학과 목록 조회
GET `/depts/options`
{
  "data": [
    {
      "deptId": 1,
      "name": "신학과",
    },
    {
      "deptId": 2,
      "name": "기독교교육과",
    }
  ],
  "meta": {}
}

## 0-3. 학과로 교과목록 조회
GET `/curricular/options?deptId=1`
{
  "data": [
    {
      "curricularId": 1,
      "curricularCode": "TH101",
      "curricularName": "구약개론"
    },
    {
      "curricularId": 1,
      "curricularCode": "TH101",
      "curricularName": "구약개론"
    },
  ],
  "meta": {}
}


## 1. 교과 관리 ( 관리자 )

## 1-1. 교과 목록
GET `/curricular?page=1&size=20`
검색
GET `/curricular?deptId=1&keyword=교과목명&page=1&size=20`
{
  "data": [
    {
      "curricularId": 101,
      "curricularCode": "TH101",
      "curricularName": "구약개론",
      "dept": {
        "deptId": 1,
        "name": "신학과"
      },
      "credits": 3,
      "createdAt": "2026-01-07T10:00:00",
      "isActive": true
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

## 1-2. 교과 상세
GET `/curricular/{curricularId}`

Response
{
  "data": {
    "curricularId": 101,
    "curricularCode": "TH101",
    "curricularName": "구약개론",
    "dept": {
      "deptId": 1,
      "name": "신학과"
    },
    "credits": 3,
    "description": "구약 성서의 구성과 핵심 주제를 개관한다.",
    "isActive": true,
    "createdAt": "2026-01-07T10:00:00",
    "updatedAt": "2026-01-09T14:20:00"
  },
  "meta": {}
}

## 1-3. 교과 등록
POST `/curricular`

Request
{
  "curricularCode": "TH101",
  "curricularName": "구약개론",
  "deptId": 1,
  "credits": 3,
  "description": "구약 성서의 구성과 핵심 주제를 개관한다.",
  "isActive": true
}

Response
{
  "data": {
    "success": true
   },
  "meta": {}
}

## 1-4. 교과 수정
PATCH `/curricular/{curricularId}`

Request
{
  "curricularCode": "TH101",
  "curricularName": "구약개론",
  "deptId": 1,
  "credits": 3,
  "description": "구약 성서의 구성과 핵심 주제를 개관한다.",
  "isActive": true
}

Response
{
  "data": {
    "success": true
   },
  "meta": {}
}

## 2. 교과 운영 관리

## 2-1. 교과 운영 목록
GET `/curricular-offerings?page=1&size=20`
검색
GET `/curricular-offerings?semesterId=1&keyword=교과명&page=1&size=20`

Response
{
  "data": [
    {
      "offeringId": 501,
      "offeringCode": "TH101-000",
      "curricular": {
        "curricularId": 101,
        "curricularCode": "TH101",
        "curricularName": "구약개론",
        "credits": 3
      },
      "professor": {
        "accountId": 2001,
        "name": "김교수"
      },
      "location": "본관 301호",
      "status": "OPEN",
      "enrolledCount": 28,
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

## 2-2. 교과 운영 상세 ( api 2번)
상단
GET `/curricular-offerings/{offeringId}`
{
  "data": {
    "offeringId": 1001,
    "offeringCode": "OPEN-2026-1-TH101",
    "status": "OPEN",

    "day" : "Monday",
    "period" : 5,

    "curricular": {
      "curricularId": 101,
      "curricularCode": "TH101",
      "curricularName": "구약개론",
      "credits": 3,
      "description": "구약 성서의 구성과 핵심 주제를 개관한다.",
      "dept": {
        "deptId": 1,
        "name": "신학과"
      }
    },

    "capacity": {
      "max": 30,
      "enrolled": 18
    },

    "semester": {
      "semesterId": 12,
      "year": 2026,
      "term": 1
    },

    "location": "본관 301호",

    "keyCompetencies": [
      { "competencyId": 1, "code": "C1", "name": "의사소통", "weight": 4 },
      { "competencyId": 3, "code": "C3", "name": "비판적사고", "weight": 3 }
    ],

    "professor": {
      "accountId": 5001,
      "name": "김교수",
      "email": "prof@school.ac.kr",
      "phone": "010-1234-5678",
      "dept": {
        "deptId": 1,
        "name": "신학과"
      }
    },

    "createdAt": "2026-01-07T10:00:00",
  },
  "meta": {}
}

하단
GET `/curricular-offerings/{offeringId}/enrollments?page=1&size=20`
{
  "data": [
    {
      "enrollmentId": 90001,
      "student": {
        "accountId": 30001,
        "name": "홍길동",
        "studentNo": "2020124",
        "grade": 2,
        "dept": {
          "deptId": 1,
          "name": "신학과"
        }
      },
      "score": 87.5,
      "grade": "A",
      "completionStatus": "IN_PROGRESS",
      "enrollmentStatus": "ENROLLED",
    }
  ],
  "meta": {
    "page": 1,
    "size": 20,
    "totalElements": 28,
    "totalPages": 2,
    "hasNext": true,
    "hasPrev": false,
    "sort": ["studentNo,asc"]
  }
}

## 2-3. 교과 운영 생성
POST `/curricular-offerings`

Request
{
  "offeringCode": "TH101-001",
  "curricularId": 101,
  "semesterId": 12,
  "professorAccountId": 5001,
  "location": "C301",
  "maxCapacity": 30,
  "day" : "Monday",
  "period" : 5,
}

Response
{
  "data": {
    "success": true
   },
  "meta": {}
}

## 2-4.교과 운영 수정
PATCH `/curricular-offerings/{offeringId}`

Request
get 교과운영목록과 동일

Response
{
  "data": {
    "success": true
   },
  "meta": {}
}

## 2-5. 교과 운영 삭제 ( draft only )
DELETE `/curricular-offerings/{offeringId}`

Response
{
  "data": {
    "success": true
   },
  "meta": {}
}

## 3. 교과 역량 맵핑 ( 관리자 )

## 3-1. 교과 역량 현황 목록
GET `/curricular-mapping?page=1&size=20`
검색
GET `/curricular-mapping?semesterId=1&keyword=교과명&page=1&size=20`

Response
{
  "data": [
    {
      "offeringId": 501,
      "offeringCode": "TH101-000",
      "curricular": {
        "curricularId": 101,
        "curricularName": "구약개론"
      },
      "professor": { "accountId": 2001, "name": "김교수" },

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


## 3-2. 교과 역량 매핑 상세
GET `/curricular-mapping/{offeringId}`

Response
{
  "data": {
    "offeringId": 101,
    "offeringCode": "TH101-001",

    "curricular": {
      "curricularId": 101,
      "curricularName": "구약개론"
    },

    "professor": {
      "accountId": 5001,
      "name": "김교수",
      "email": "prof@school.ac.kr",
      "phone": "010-1234-5678",
      "dept": {
        "deptId": 1,
        "name": "신학과"
      }
    },

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

## 3-3. 교과 역량 매핑 등록
POST `/curricular-mapping`

Request
{
  "offeringId": 101,
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

## 3-4. 교과 역량 매핑 수정
PATCH `/curricular-mapping/{offeringId}`

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

## 4. 교과 성적 조회 ( 관리자 )

## 4-1. 교과성적 목록 조회
GET `/student-gpas?page=1&size=20`
검색
GET `/student-gpas?deptId=1&keyword=학번또는학생명&page=1&size=20`

Request
{
  "data": [
    {
      "student": {
        "accountId": 30001,
        "studentNo": "200124",
        "name": "홍길동",
        "grade": 2,
        "dept": {
          "deptId": 1,
          "name": "신학과"
        }
      },
      "gpa": {
        "value": 3.75,
        "scale": 5.0,
        "isCalculated": true,
        "calculatedAt": "2026-06-30T18:00:00"
      }
    },
    {
      "student": {
        "accountId": 30002,
        "studentNo": "2020345",
        "name": "이영희",
        "grade": 3,
        "dept": {
          "deptId": 2,
          "name": "기독교교육과"
        }
      },
      "semester": {
        "semesterId": 12,
        "year": 2026,
        "term": 1
      },
      "gpa": {
        "value": 4.12,
        "scale": 5.0,
        "isCalculated": true,
        "calculatedAt": "2026-06-30T18:00:00"
      }
    }
  ],
  "meta": {
    "page": 1,
    "size": 20,
    "totalElements": 2480,
    "totalPages": 124,
    "hasNext": true,
    "hasPrev": false,
    "sort": ["gpa,desc"]
  }
}

## 4-1. 개인 교과 성적 추이 ( api 2개 학생성적요약 + 이수내역)

학생성적요약
GET `/students-gpas/{studentId}/summary`
{
  "data": {
    "student": {
      "accountId": 30001,
      "name": "홍길동",
      "studentNo": "2020124",
      "grade": 2,
      "dept": {
        "deptId": 1,
        "name": "신학과"
      }
    },

    "totalCredits": 45,

    "gpa": {
      "average": { "value": 3.72, "scale": 5.0 },
      "best": { "value": 4.12, "scale": 5.0 }
    },

    "trend": [
      {
        "semester": { "semesterId": 10, "year": 2025, "term": 2 },
        "gpa": { "value": 3.58, "scale": 5.0 },
        "earnedCredits": 18
      },
      {
        "semester": { "semesterId": 12, "year": 2026, "term": 1 },
        "gpa": { "value": 3.86, "scale": 5.0 },
        "earnedCredits": 15
      }
    ]
  },
  "meta": {}
}

학생 교과 이수내역
GET `/students-gpas/{studentId}/curricular?page=1&size=20`
검색
GET `/students-gpas/{studentId}/curricular?keyword=교과명&page=1&size=20`

Response
{
  "data": [
    {
      "enrollmentId": 90001,
      "semester": { "semesterId": 12, "year": 2026, "term": 1 },

      "curricular": {
        "curricularId": 101,
        "curricularCode": "TH101",
        "curricularName": "구약개론",
        "credits": 3
      },

      "grade": "A0",
      "completionStatus": "PASSED"
    }
  ],
  "meta": {
    "page": 1,
    "size": 20,
    "totalElements": 48,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false,
    "sort": ["semesterId,desc", "curricularCode,asc"]
  }
}


