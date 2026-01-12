## 권한관리

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
      "email" : "test@test.com"
      "accountType": "STUDENT",
      "status": "ACTIVE",
      "createdAt": "2025-12-01T10:00:00"
    },
    {
      "accountId": 9102,
      "loginId": "p200000",
      "name": "김교수",
      "email" : "test@test.com"
      "accountType": "PROFESSOR",
      "status": "INACTIVE",
      "createdAt": "2025-11-15T09:00:00"
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


## 1-2. 계정 생성
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

    "deptId": 10,

    "majors": [
      { "majorId": 101, "majorType": "PRIMARY" },
      { "majorId": 205, "majorType": "DOUBLE" },
      { "majorId": 309, "majorType": "MINOR" }
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
    "email": "adminh@example.com",
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

## 1. 학과 관리

## 1-1. 학과 목록 조회
GET `/accounts?page=1&size=20`
검색
GET `/accounts?keyword=이름&page=1&size=20`
