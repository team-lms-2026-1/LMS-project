# 페이지 네이션 고치기
## 0. 학생 역량 통합 관리 페이지 (관리자)
# 0-1. 학생 목록 조회 
GET `/admin/competencies/students`
Response
{
  "data": [
    {
      "accountId": 2000000,          // 상세 이동을 위한 식별자
      "studentNumber": "20200001",   // [UI] 학번
      "deptName": "컴퓨터공학과",     // [UI] 학과
      "grade": 4,                    // [UI] 학년
      "name": "아무개"               // [UI] 이름
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
    "totalPages": 15
  }
}
# 0-2. 학생 상세 역량 활동 조회
GET `/admin/competencies/students/{studentId}/dashboard`
Response
{
  "data": {
    // 1. [UI 상단] 학생 기본 정보
    "profile": {
      "name": "김컴공",
      "studentNumber": "2000000",
      "deptName": "컴퓨터공학과",
      "grade": 4
    },

    // 2. [UI 상단] 요약 카드 (Summary Cards)
    "summary": {
      "maxScore": 4.00,             // 내 최고 점수
      "recentAvg": 3.54,            // 최근 역량 평균
      "lastEvaluationDate": "2000.01.01 - 00:00" // 최근 평가 일시 (포맷팅된 문자열 권장)
    },

    // 3. [UI 중단 좌측] 내 역량 (Radar Chart)
    "radarChart": [
      { "label": "Critical Thinking", "score": 3.60 },
      { "label": "Character", "score": 3.60 },
      { "label": "Creativity", "score": 3.60 },
      { "label": "Communication", "score": 3.60 },
      { "label": "Collaboration", "score": 3.60 },
      { "label": "Convergence", "score": 3.60 }
    ],

    // 4. [UI 중단 우측] 역량 추이 (Trend Chart)
    "trendChart": {
      "categories": ["1-1", "1-2", "2-1", "2-2", "3-1"], // X축 (학기)
      "series": [
        { "name": "Critical Thinking", "data": [2.5, 2.8, 3.0, 3.2, 3.6] },
        { "name": "Creativity", "data": [3.0, 3.1, 3.2, 3.4, 3.6] }
        // ... 6개 역량 모두 포함
      ]
    },

    // 5. [UI 하단 좌측] 내 역량 통계 (My Stats Table)
    // 컬럼: 역량 이름 | 내점수 | 평균 | 최고점수
    "myStatsTable": [
      {
        "competencyName": "Critical Thinking",
        "myScore": 3.60,
        "avgScore": 3.55,   // 전체(또는 학년) 평균
        "maxScore": 4.00    // 전체(또는 학년) 최고점
      },
      {
        "competencyName": "Character",
        "myScore": 3.60,
        "avgScore": 3.55,
        "maxScore": 4.00
      }
      // ...
    ],

    // 6. [UI 하단 우측] 내 역량 비교 (Comparison Table)
    // 컬럼: 역량 이름 | 내점수 | 학과평균 | 학과최고점수
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
      // ...
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
      "targetGrade": "3학년",        // 대상 학년
      "semesterName": "2026-1학기",
      "period": "2026.03.01 ~ 2026.03.14",
      "createdAt": "2026-02-01",
      "status": "DRAFT"             // DRAFT | OPEN | CLOSED
    },
    {
      "diagnosisId": 102,
      "title": "전체 학과 1-1 기초역량진단",
      "targetGrade": "1학년",
      "semesterName": "2026-1학기",
      "period": "2026.03.01 ~ 2026.03.14",
      "createdAt": "2026-02-01",
      "status": "OPEN"
    }
  ],
  "meta": {
    "page": 1,
    "totalElements": 45,
    "totalPages": 5
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
      "startDate": "2026-03-01T09:00:00",
      "endDate": "2026-03-14T23:59:59",
      "status": "DRAFT"
    },
    "questions": [
      {
        "questionId": 501,
        "type": "SCALE",           // SCALE(5점척도) | SHORT(단답)
        "text": "팀 프로젝트 수행 시 동료의 의견을 경청합니까?",
        "order": 1,
        "weights": {               // 문항별 역량 가중치 (0~5)
          "C1": 3, "C2": 5, "C3": 0, "C4": 2, "C5": 0, "C6": 0
        }
      },
      {
        "questionId": 502,
        "type": "SHORT",
        "text": "가장 자신 있는 프로그래밍 언어는?",
        "order": 2,
        "weights": { "C1": 0, "C2": 0, "C3": 0, "C4": 0, "C5": 0, "C6": 0 }
      }
    ]
  },
  "meta": { "requestId": "req_view_001" }
}

# 1-3. 진단지 등록(신규 생성)
POST `/admin/diagnoses`
Response
{
  "title": "2026-1학기 정기 진단",
  "semesterId": 202601,
  "targetGrade": 2, // null이면 전학년
  "startDate": "2026-03-01T00:00:00",
  "endDate": "2026-03-14T23:59:59",
  "questions": [
    {
      "type": "SCALE",
      "text": "문제 해결을 위해 다양한 시각을 고려합니까?",
      "order": 1,
      "weights": { "C1": 5, "C2": 0, "C3": 3, "C4": 0, "C5": 0, "C6": 0 }
    }
    // ...
  ]
}
# 1-4. 진단지 수정
PATCH `/admin/diagnoses/{diagnosisId}`
상태만 변경시 
Response
{
  "status": "OPEN" 
}
내용 전체 수정 시
Response
{
  "title": "제목 수정됨",
  "endDate": "2026-03-20T23:59:59",
  "questions": [
    // questionId가 있으면 수정, 없으면 신규 추가
    { "questionId": 501, "text": "문항 텍스트 수정...", "weights": {...} },
    { "type": "SCALE", "text": "새로운 문항 추가", "weights": {...} }
  ]
}
# 1-5. 진단지 삭제 
Response(성공 시)
{
  "data": {
    "deletedId": 105,
    "result": "DELETED"
  },
  "meta": {
    "requestId": "req_del_001"
  }
}
Response (실패 시 - 참여 학생이 있을경우)
{
  "error": {
    "code": "CONFLICT", // 또는 PRECONDITION_FAILED
    "message": "이미 참여한 학생이 있어 진단지를 삭제할 수 없습니다. '마감' 상태로 변경해주세요.",
    "fieldErrors": []
  }
}
## 2. 역량 통합관리
# 2-1. 결과 관리 (종합리포트)
GET `/admin/diagnoses/{diagnosisId}/report`
Response
{
  "data": {
    "summary": {
      "targetCount": 300,        // 대상자 수
      "responseCount": 287,      // 산출(응답) 대상자 수
      "totalAverage": 3.54       // 전체 평균 점수
    },
    // [UI] 역량 차트 (Radar)
    "radarChart": [
      { "label": "Critical Thinking", "score": 3.55 },
      { "label": "Character", "score": 3.55 }
      // ...
    ],
    // [UI] 상대 차트 (Trend/Line) - 시계열 데이터
    "trendChart": {
      "categories": ["1주차", "2주차", "3주차"], 
      "series": [
        { "name": "Critical Thinking", "data": [3.2, 3.4, 3.55] }
        // ...
      ]
    },
    // [UI] 하단 통계 테이블
    "statsTable": [
      {
        "competencyName": "Critical Thinking",
        "responseRatio": "287/300",
        "mean": 3.55,
        "median": 3.60,
        "stdDev": 0.85,
        "updatedAt": "2026-03-15T00:00:00"
      }
      // ...
    ]
  },
  "meta": { "requestId": "req_rep_001" }
}
# 2-2. 응답 현황(Scatter Plot 분포)
GET `/admin/diagnoses/{diagnosisId}/responses/distribution`
Response
{
  "data": {
    "totalResponseCount": 40,
    // Scatter Chart용 데이터: 각 점(Dot)의 좌표값 목록
    "distribution": [
      { "competency": "C1", "score": 4.5, "studentIdHash": "xyz..." },
      { "competency": "C1", "score": 3.2, "studentIdHash": "abc..." },
      { "competency": "C2", "score": 2.8, "studentIdHash": "def..." },
      { "competency": "C2", "score": 4.0, "studentIdHash": "ghi..." }
      // ... 모든 응답자의 역량별 점수 데이터
    ]
  },
  "meta": { "requestId": "req_dist_001" }
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
    "totalElements": 13,
    "totalPages": 2
  }
}
# 2-4. 독려 메일 발송
POST `/admin/diagnoses/{diagnosisId}/reminders/send`

Response
{
  "targetIds": [901, 902, 903],  // 선택한 대상자 ID 목록
  "sendToAllPending": false,     // true일 경우 targetIds 무시하고 전체 미실시자에게 발송
  "emailSubject": "[필독] 역량 진단 미실시 안내", // (옵션) 커스텀 제목
  "emailBody": "..."                            // (옵션) 커스텀 내용
}
Response
{
  "data": {
    "sentCount": 3,
    "failedCount": 0
  },
  "meta": { "requestId": "req_mail_001" }
}