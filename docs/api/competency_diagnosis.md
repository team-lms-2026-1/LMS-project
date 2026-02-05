## 0. 학생 역량 통합 관리 페이지 (관리자)
# 0-1. 학생 목록 조회 
GET `/admin/competencies/students`
Response
{
  "data": [
    {
      "accountId": 2000000,
      "studentNumber": "20200001",
      "deptName": "컴퓨터공학과",
      "grade": 4,
      "name": "아무개"
    },
    {
      "accountId": 2000001,
      "studentNumber": "20200002",
      "deptName": "전자공학과",
      "grade": 4,
      "name": "김철수"
    }
  ],
  "meta": {
    "page": 1,
    "size": 10,
    "totalElements": 150,
    "totalPages": 15,
    "hasNext": true,
    "hasPrev": false,
    "sort": ["studentNumber,asc"]
  }
}
# 0-2. 학생 상세 역량 활동 조회
GET `/admin/competencies/students/{studentId}/dashboard`
Response
{
  "data": {
    "profile": {
      "name": "김컴공",
      "studentNumber": "2000000",
      "deptName": "컴퓨터공학과",
      "grade": 4
    },

    "summary": {
      "maxScore": 4.00,
      "recentAvg": 3.54,
      "lastEvaluationDate": "2026-01-07T10:00:00"
    },

    "radarChart": [
      { "label": "Critical Thinking", "score": 3.60 },
      { "label": "Character", "score": 3.60 },
      { "label": "Creativity", "score": 3.60 },
      { "label": "Communication", "score": 3.60 },
      { "label": "Collaboration", "score": 3.60 },
      { "label": "Convergence", "score": 3.60 }
    ],

    "trendChart": {
      "categories": ["1-1", "1-2", "2-1", "2-2", "3-1", "4-1", "4-2"], ## 학기 있는것만 
      "series": [
        {
          "name": "Critical Thinking",
          "data": [2.5, 2.8, 3.0, 3.2, 3.6]
        },
        {
          "name": "Creativity",
          "data": [3.0, 3.1, 3.2, 3.4, 3.6]
        }
      ]
    },

    "myStatsTable": [
      {
        "competencyName": "Critical Thinking",
        "myScore": 3.60,
        "avgScore": 3.55,
        "maxScore": 4.00
      },
      {
        "competencyName": "Character",
        "myScore": 3.60,
        "avgScore": 3.55,
        "maxScore": 4.00
      }
    ],

    "comparisonTable": [
      {
        "competencyName": "Critical Thinking",
        "myScore": 3.60,
        "deptAvgScore": 3.55,
        "deptMaxScore": 4.00
      },
      {
        "competencyName": "Character",
        "myScore": 3.60,
        "deptAvgScore": 3.55,
        "deptMaxScore": 4.00
      }
    ]
  },
  "meta": {
    "requestId": "req_dash_002"
  }
}
## 1. 진단지 관리 (관리자)
# 1-1. 진단지 목록 조회
GET `/admin/diagnoses`
Response
{
  "data": [
    {
      "diagnosisId": 101,
      "title": "컴퓨터공학과 3-1 역량평가",
      "targetGrade": "3학년",
      "semesterName": "2026-1학기",
      "startedAt": "2026-03-01T00:00:00",
      "endedAt": "2026-03-14T23:59:59",
      "createdAt": "2026-02-01T00:00:00",
      "status": "DRAFT"
    },
    {
      "diagnosisId": 102,
      "title": "전체 학과 1-1 기초역량진단",
      "targetGrade": "1학년",
      "semesterName": "2026-1학기",
      "startedAt": "2026-03-01T00:00:00",
      "endedAt": "2026-03-14T23:59:59",
      "createdAt": "2026-02-01T00:00:00",
      "status": "OPEN"
    }
  ],
  "meta": {
    "page": 1,
    "size": 10,
    "totalElements": 45,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false,
    "sort": ["createdAt,desc"]
  }
}
# 1-2 진단지 상세 조회 (수정화면 진입 시)
GET `/admin/diagnoses/{diagnosisId}`
Response
{
  "data": {
    "basicInfo": {
      "diagnosisId": 101,
      "title": "컴퓨터공학과 3-1 역량평가",
      "semesterId": 202601,
      "targetGrade": 3,
      "startedAt": "2026-03-01T09:00:00",
      "endedAt": "2026-03-14T23:59:59",
      "status": "DRAFT"
    },
    "questions": [
      {
        "questionId": 501,
        "type": "SCALE",
        "text": "팀 프로젝트 수행 시 동료의 의견을 경청합니까?",
        "order": 1,
        "weights": {
          "C1": 3,
          "C2": 5,
          "C3": 0,
          "C4": 2,
          "C5": 0,
          "C6": 0
        }
      },
      {
        "questionId": 502,
        "type": "SHORT",
        "text": "가장 자신 있는 프로그래밍 언어는?",
        "order": 2,
        "weights": {
          "C1": 0,
          "C2": 0,
          "C3": 0,
          "C4": 0,
          "C5": 0,
          "C6": 0
        }
      }
    ]
  },
  "meta": {
    "requestId": "req_view_001"
  }
}

# 1-3. 진단지 등록(신규 생성)
POST `/admin/diagnoses`
Request
{
  "title": "2026-1학기 정기 진단",
  "semesterId": 202601,
  "targetGrade": 2,
  "startedAt": "2026-03-01T00:00:00",
  "endedAt": "2026-03-14T23:59:59",
  "questions": [
    {
      "type": "SCALE",
      "text": "문제 해결을 위해 다양한 시각을 고려합니까?",
      "order": 1,
      "weights": {
        "C1": 5,
        "C2": 0,
        "C3": 3,
        "C4": 0,
        "C5": 0,
        "C6": 0
      }
    }
  ]
}
Response
{
  "data": {
    "diagnosisId": 201,
    "status": "DRAFT",
    "createdAt": "2026-02-01T10:15:00"
  },
  "meta": {
    "requestId": "req_create_001"
  }
}
# 1-4. 진단지 수정
PATCH `/admin/diagnoses/{diagnosisId}`
## 상태만 변경시 
Request
{
  "status": "OPEN"
}
Response
{
  "data": {
    "diagnosisId": 101,
    "status": "OPEN",
    "updatedAt": "2026-02-15T09:00:00"
  },
  "meta": {
    "requestId": "req_status_001"
  }
}
## 내용 전체 수정 시
Request
{
  "title": "제목 수정됨",
  "endedAt": "2026-03-20T23:59:59",
  "questions": [
    {
      "questionId": 501,
      "text": "문항 텍스트 수정...",
      "weights": {
        "C1": 3,
        "C2": 2,
        "C3": 0,
        "C4": 0,
        "C5": 0,
        "C6": 0
      }
    },
    {
      "type": "SCALE",
      "text": "새로운 문항 추가",
      "order": 3,
      "weights": {
        "C1": 0,
        "C2": 0,
        "C3": 5,
        "C4": 0,
        "C5": 0,
        "C6": 0
      }
    }
  ]
}
Response
{
  "data": {
    "diagnosisId": 101,
    "status": "DRAFT",
    "updatedAt": "2026-02-15T09:30:00"
  },
  "meta": {
    "requestId": "req_update_002"
  }
}

Response 
{
  "error": {
    "code": "CONFLICT",
    "message": "OPEN 상태의 진단지는 수정할 수 없습니다."
  }
}
Response 
{
  "error": {
    "code": "FORBIDDEN",
    "message": "진단지 수정 권한이 없습니다."
  }
}
# 1-5. 진단지 삭제 
Response
{
  "data": {
    "deletedId": 105,
    "result": "DELETED"
  },
  "meta": {
    "requestId": "req_del_001"
  }
}
Response 
{
  "error": {
    "code": "CONFLICT",
    "message": "이미 참여한 학생이 있어 진단지를 삭제할 수 없습니다. '마감' 상태로 변경해주세요.",
    "fieldErrors": []
  }
}
Response
{
  "error": {
    "code": "NOT_FOUND",
    "message": "존재하지 않는 진단지입니다."
  }
}
## 2. 역량 통합관리
# 2-1. 결과 관리 (종합리포트)
GET `/admin/diagnoses/{diagnosisId}/report`
Response
{
  "data": {
    "summary": {
      "targetCount": 300,
      "responseCount": 287,
      "totalAverage": 3.54
    },

    "radarChart": [
      { "label": "Critical Thinking", "score": 3.55 },
      { "label": "Character", "score": 3.55 }
    ],

    "trendChart": {
      "categories": ["1주차", "2주차", "3주차"],
      "series": [
        {
          "name": "Critical Thinking",
          "data": [3.2, 3.4, 3.55]
        }
      ]
    },

    "statsTable": [
      {
        "competencyName": "Critical Thinking",
        "targetCount": 300,
        "responseCount": 287,
        "mean": 3.55,
        "median": 3.60,
        "stdDev": 0.85,
        "updatedAt": "2026-03-15T00:00:00"
      }
    ]
  },
  "meta": {
    "requestId": "req_rep_001"
  }
}

Response
{
  "error": {
    "code": "CONFLICT",
    "message": "아직 응답 데이터가 없어 리포트를 생성할 수 없습니다."
  }
}
# 2-2. 응답 현황(Scatter Plot 분포)
GET `/admin/diagnoses/{diagnosisId}/responses/distribution`
Response
{
  "data": {
    "totalResponseCount": 40,

    "distribution": [
      {
        "competencyCode": "C1",
        "score": 4.5,
        "studentHash": "xyz..."
      },
      {
        "competencyCode": "C1",
        "score": 3.2,
        "studentHash": "abc..."
      },
      {
        "competencyCode": "C2",
        "score": 2.8,
        "studentHash": "def..."
      },
      {
        "competencyCode": "C2",
        "score": 4.0,
        "studentHash": "ghi..."
      }
    ]
  },
  "meta": {
    "requestId": "req_dist_001"
  }
}
# 2-3. 미실시 학생 목록 조회
GET `/admin/diagnoses/{diagnosisId}/participants`
Response
{
  "data": [
    {
      "targetId": 901,
      "studentNumber": "2000000",
      "name": "김철수",
      "email": "test@test.com",
      "status": "PENDING"
    },
    {
      "targetId": 902,
      "studentNumber": "2000001",
      "name": "이영희",
      "email": "lee@test.com",
      "status": "PENDING"
    }
  ],
  "meta": {
    "page": 1,
    "size": 10,
    "totalElements": 13,
    "totalPages": 2,
    "hasNext": true,
    "hasPrev": false,
    "sort": ["studentNumber,asc"]
  }
}
# 2-4. 독려 메일 발송
POST `/admin/diagnoses/{diagnosisId}/reminders/send`

Request
{
  "targetIds": [901, 902, 903],
  "sendToAllPending": false,
  "emailSubject": "[필독] 역량 진단 미실시 안내",
  "emailBody": "안녕하세요.\n아직 역량 진단에 참여하지 않으셨습니다.\n기한 내 참여 부탁드립니다."
}
Response
{
  "data": {
    "sentCount": 3,
    "failedCount": 0
  },
  "meta": {
    "requestId": "req_mail_001"
  }
}