## 권한관리

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


## 1. 계정관리

## 1-1. 걔정 목록 조회
GET `/accounts?page=1&size=20`
검색
GET `/accounts?keyword=이름&page=1&size=20`

토글
GET `accounts?accountType=STUDENT&page=1&size=20`
GET `accounts?accountType=PROFESSOR&page=1&size=20`
GET `accounts?accountType=ADMIN&page=1&size=20`

{
  "data": [
    {
      "accountId": 9001,
      "loginId": "s202400",
      "name": "홍길동",
      "email": "hong@example.com",
      "accountType": "STUDENT",
      "status": "ACTIVE",
      "createdAt": "2025-12-01T10:00:00"
    }
  ],
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

## 1-2. 계정 상세
GET `/accounts/{accountId}`

Response
{
  "data": {
    "accountId": 9001,
    "loginId": "s202400",
    "accountType": "STUDENT",
    "status": "ACTIVE",
    "lastLoginAt": "2026-01-12T09:11:00",
    "createdAt": "2025-12-01T10:00:00",
    "profile": {
      "studentNo": "20240001",
      "name": "홍길동",
      "email": "hong@example.com",
      "phone": "010-1234-5678",
      "gradeLevel": 1,
      "academicStatus": "ENROLLED",
      "majors": [
        {
          "majorId": 101,
          "majorName": "신학",
          "dept": { "deptId": 10, "deptName": "신학과" },
          "majorType": "PRIMARY"
        },
        {
          "majorId": 205,
          "majorName": "상담",
          "dept": { "deptId": 12, "deptName": "상담학과" },
          "majorType": "DOUBLE"
        }
      ],
      "primaryDept": { "deptId": 10, "deptName": "신학과" },
      "primaryMajor": { "majorId": 101, "majorName": "신학" }
    }
  },
  "meta": {}
}


## 1-3. 계정 생성
POST `/accounts`

Request  ( 학생 )
{
  "loginId": "s200000",
  "password": "Temp!2345",
  "accountType": "STUDENT",
  "status": "ACTIVE",
  "profile": {
    "studentNo": "20240001",
    "name": "홍길동",
    "email": "hong@example.com",
    "phone": "010-1234-5678",
    "gradeLevel": 1,
    "academicStatus": "ENROLLED",
    "majors": [
      { "majorId": 101, "majorType": "PRIMARY" },
      { "majorId": 205, "majorType": "DOUBLE" }
    ]
  }
}


Request  ( 교수 )
{
  "loginId": "p200000",
  "password": "Temp!2345",
  "accountType": "PROFESSOR",
  "status": "ACTIVE",
  "profile": {
    "professorNo": "200000",
    "name": "김교수",
    "email": "prof@example.com",
    "phone": "010-2222-3333",
    "deptId": 10
  }
}


Request  ( 관리자 )
{
  "loginId": "a200000",
  "password": "Temp!2345",
  "accountType": "ADMIN",
  "status": "ACTIVE",
  "profile": {
    "adminNo": "200000",
    "name": "관리자1",
    "email": "admin@example.com",
    "phone": "010-2222-3333",
    "memo": "testtest"
  }
}

Response
{
  "data": {
    "success": true
   },
  "meta": {}
}

## 1-4. 계정 수정 (학생 예시)
PATCH `/accounts/{accountId}`
{
  "status": "ACTIVE",
  "profile": {
    "email": "hong2@example.com",
    "phone": "010-9999-8888",
    "gradeLevel": 2,
    "academicStatus": "ENROLLED",
    "majors": [
      { "majorId": 101, "majorType": "PRIMARY" }
    ]
  }
}

## 1-5. 계정 상태 변경
PATCH `/accounts/{accountId}/status`

## 2. 학과 관리

## 2-1. 학과 목록 조회
GET `/depts?page=1&size=20`
검색
GET `/depts?keyword=학과명&page=1&size=20`

Response
{
  "data": [
    {
      "deptId": 10,
      "deptCode": "D010",
      "deptName": "신학과",
      "headProfessor": { "accountId": 9102, "name": "김교수" },
      "studentNumber" : 400,
      "professorNumber" : 50,
      "isActive": true,
      "createdAt": "2025-12-01T10:00:00"
    }
  ],
  "meta": {
    "page": 1,
    "size": 20,
    "totalElements": 12,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false,
    "sort": ["createdAt,desc"]
  }
}

## 2-2. 학과 상세 조회
GET `/depts/{deptId}` (헤더용)

Response 
{
  "data": {
    "deptId": 10,
    "deptCode": "D010",
    "deptName": "신학과",
    "description": "신학 전공 기반의 목회자 양성을 목표로 합니다.",
    "headProfessor": { "accountId": 9102, "name": "김교수" },
    "isActive": true,
    "tabSummary": {
      "professorCount": 12,
      "studentCount": 230,
      "majorCount": 3
    }
  },
  "meta": {}
}


소속교수 ( 기본탭 )
GET `/depts/{deptId}/professors?page=1&size=20`
검색
GET `/depts/{deptId}/professors?keyword=김교수&page=1&size=20`

{
  "data": [
    {
      "accountId": 9102,
      "professorNo": "200000",
      "name": "김교수",
      "email": "prof@example.com",
      "phone": "010-2222-3333"
    }
  ],
  "meta": {
    "page": 1,
    "size": 20,
    "totalElements": 12,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false,
    "sort": ["name,asc"],

    "summary": {
      "professorCount": 12
    }
  }
}

소속학생
GET `/depts/{deptId}/students?page=1&size=20`
검색
GET `/depts/{deptId}/students?keyword=김교수&page=1&size=20`

{
  "data": [
      {
        "accountId": 9001,
        "studentNo": "20240001",
        "name": "홍길동",
        "gradeLevel": 2,
        "academicStatus": "ENROLLED",
        "primaryDept": { "deptId": 10, "deptName": "신학과" },
        "primaryMajor": { "majorId": 101, "majorName": "신학" }
      }
  ],
  "meta": {
    "page": 1,
    "size": 20,
    "totalElements": 230,
    "totalPages": 12,
    "hasNext": true,
    "hasPrev": false,
    "sort": ["studentNo,asc"],

    "summary": {
      "total": 230,
      "enrolledCount": 180,
      "leaveCount": 30,
      "graduatedCount": 20
    }
  }
}

전공 관리
GET `/depts/{deptId}/majors?page=1&size=20`
검색
GET `/depts/{deptId}/majors?keyword=김교수&page=1&size=20`

{
  "data": [
    {
      "majorId": 101,
      "majorName": "신학",
      "description" : "전공설명",
      "isActive": true,
      "sortOrder": 0,
      "enrolledStudentCount": 120,
      "createdAt": "2025-12-01T10:00:00"
    }
  ],
  "meta": {
    "page": 1,
    "size": 20,
    "totalElements": 3,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false,
    "sort": ["sortOrder,asc"]
  }
}




## 2-3. 학과 생성
POST `/depts`

Request
{
  "deptCode": "D013",
  "deptName": "상담학과",
  "description" : "설명",
  "headProfessorAccountId": 9102,
  "isActive": true
}

Response
{
  "data": {
    "success": true
   },
  "meta": {}
}


## 2-4. 전공 생성
POST /depts/{deptId}/majors

Request
{
  "majorCode": "M0103",
  "majorName": "목회학",
  "description": "목회 실무/리더십 중심 심화 전공",
  "sortOrder": 2,
  "isActive": true
}

Response
{
  "data": {
    "success": true
   },
  "meta": {}
}
