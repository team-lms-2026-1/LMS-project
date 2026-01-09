## 학습공간 대여 공통 규칙

방 단위 운영기간/시간으로 바뀌었으니:

isRentable (공간 목록에 표시)

공간이 존재하고, 오늘 기준 운영 중인 방이 1개 이상이면 true
(방.사용여부=true AND today ∈ [운영시작일, 운영종료일])

minPeople/maxPeople (공간 목록에 표시)

minPeople = MIN(운영중 방.최소인원)

maxPeople = MAX(운영중 방.최대인원)

운영 중인 방이 0개면: isRentable=false

## 1. 학습공간 대여


## 1-1. 학습공간 목록 조회
GET `/spaces?page=1&size=20`
검색
GET `/spaces?keyword=카테고리명&page=1&size=20`

Response
{
  "data": [
    {
      "spaceId": 1,
      "spaceName": "도서관 프로젝트룸",
      "location": "도서관 3층",
      "isRentable": true,
      "minPeople": 2,
      "maxPeople": 8
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

## 1-2. 학습공간 상세페이지 조회
GET `/spaces/{spaceId}`

{
  "data": {
    "spaceId": 1,
    "spaceName": "도서관 프로젝트룸",
    "location": "도서관 3층",
    "description": "팀 프로젝트 및 스터디를 위한 학습공간입니다.",

    "isRentable": true,

    "rules": [
      {
        "ruleId": 101,
        "content": "음식물 반입 금지",
        "sortOrder": 0
      },
      {
        "ruleId": 102,
        "content": "사용 후 정리 필수",
        "sortOrder": 1
      }
    ]
  },
  "meta": {}
}

## 1-3. 학습공간 상세페이지 수정
※ 권한: ADMIN
PATCH `/spaces/{spaceId}`

{
  "spaceName": "도서관 프로젝트룸",
  "location": "도서관 3층",
  "description": "팀 프로젝트 및 스터디를 위한 학습공간입니다.",

  "rules": [
    {
      "ruleId": 101,
      "content": "음식물 반입 금지",
      "sortOrder": 0
    },
    {
      "ruleId": 102,
      "content": "사용 후 정리 필수",
      "sortOrder": 1
    },
    {
      "content": "소음 발생 시 이용 제한",
      "sortOrder": 2
    }
  ]
}

## 1-4. 학습공간 상세페이지 삭제
※ 권한: ADMIN
DELETE `/spaces/{spaceId}`

Response

{
  "data": {
    "success": true
   },
  "meta": {}
}

## 1-4-1. 학습공간 상세페에지 > 예약 모달창 (학생)
GET `/spaces/{spaceId}/rooms`

Response
{
  "data": [
    {
      "roomId": 11,
      "roomName": "프로젝트룸-1",
      "minPeople": 2,
      "maxPeople": 6,
      "operationStartDate": "2026-01-01",
      "operationEndDate": "2026-06-30",
      "availableStartTime": "09:00:00",
      "availableEndTime": "21:00:00"
    }
  ],
  "meta": {}
}


## 1-4-2. 학습공간 상세페에지 > 예약 모달창 - 신청 (학생)
PATCH `/spaces/{spaceId}/rooms`

Request
{
  "roomId": 12,

  "rentalDate": "2026-01-15",
  "startTime": "14:00:00",
  "endTime": "16:00:00"
}

Response

{
  "data": {
    "success": true
   },
  "meta": {}
}

## 1-4-3. 학습공간 상세페에지 > 예약 모달창 (관리자)
※ 권한: ADMIN  

GET `/spaces/{spaceId}/admin-rooms`

Response
{
  "data": [
    {
      "roomId": 11,
      "roomName": "프로젝트룸-1",
      "minPeople": 2,
      "maxPeople": 6,

      "operationStartDate": "2026-01-01",
      "operationEndDate": "2026-06-30",

      "availableStartTime": "09:00:00",
      "availableEndTime": "21:00:00"
    },
    {
      "roomId": 12,
      "roomName": "프로젝트룸-2",
      "minPeople": 4,
      "maxPeople": 8,

      "operationStartDate": "2026-02-01",
      "operationEndDate": "2026-05-31",

      "availableStartTime": "10:00:00",
      "availableEndTime": "20:00:00"
    }
  ],
  "meta": {}
}

## 1-4-4. 학습공간 상세페이지 > 예약 모달창 (관리자) - 방 등록
※ 권한: ADMIN  
POST `/spaces/{spaceId}/admin-rooms`

Request
{
  "roomName": "프로젝트룸-1",
  "minPeople": 2,
  "maxPeople": 6,

  "operationStartDate": "2026-01-01",
  "operationEndDate": "2026-06-30",

  "availableStartTime": "09:00:00",
  "availableEndTime": "21:00:00"
}

Response
{
  "data": {
    "success": true
   },
  "meta": {}
}

## 1-4-5. 학습공간 상세페이지 > 예약 모달창 (관리자) - 방 수정
※ 권한: ADMIN  
PATCH `/spaces/{spaceId}/admin-rooms/{roomId}`

Request
{
  "roomName": "프로젝트룸-1",
  "minPeople": 2,
  "maxPeople": 6,

  "operationStartDate": "2026-01-01",
  "operationEndDate": "2026-06-30",

  "availableStartTime": "09:00:00",
  "availableEndTime": "21:00:00"
}

Response
{
  "data": {
    "success": true
   },
  "meta": {}
}

## 1-4-6. 학습공간 상세페이지 > 예약 모달창 (관리자) - 방 삭제
※ 권한: ADMIN
DELETE `/spaces/{spaceId}/admin-rooms/{roomId}`

Response
{
  "data": {
    "success": true
  },
  "meta": {}
}

## 2. 학습공간 신청 관리

## 2-1. 학습공간 신청 목록 (관리자)
GET `/spaces-rentals?page=1&size=20`

검색
> keyword 검색 기준:
> - 공간명(spaceName) + 신청자명(applicantName) 통합검색
GET `/spaces-rentals?keyword=카테고리명&page=1&size=20`

Response
{
  "data": [
    {
      "rentalId": 501,
      "space": {
        "spaceId": 1,
        "spaceName": "도서관 프로젝트룸"
      },
      "room": {
        "roomId": 12,
        "roomName": "프로젝트룸-2"
      },
      "applicant": {
        "accountId": 9001,
        "name": "홍길동"
      },
      "rentalDate": "2026-01-15",
      "startTime": "14:00:00",
      "endTime": "16:00:00",
      "status": "REQUESTED",
      "requestedAt": "2026-01-10T09:30:00"
    }
  ],
  "meta": {
    "page": 1,
    "size": 20,
    "totalElements": 12,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false,
    "sort": ["requestedAt,desc"]
  }
}

## 2-2. 학습공간 신청 처리 (관리자: 승인/거부)
※ 권한: ADMIN  

PATCH `/spaces-rentals/{rentalId}`

> 관리자 1명이 신청 건을 **승인(APPROVED)** 또는 **거부(REJECTED)** 처리한다.  
> - 승인 시: 동일 방(roomId) 기준으로 APPROVED 예약과 시간 겹침이 있으면 CONFLICT  

---

Response
{
  "data": {
    "success": true
  },
  "meta": {}
}

## 2-3. 학습공간 신청 목록 (학생)
※ 권한: STUDENT  

GET `/my/spaces-rentals?page=1&size=20`
검색
GET `/my/spaces-rentals?keyword=키워드&page=1&size=20`

> keyword 검색 기준(추천):
> - 공간명(spaceName) 통합검색

Response
{
  "data": [
    {
      "rentalId": 501,
      "space": {
        "spaceId": 1,
        "spaceName": "도서관 프로젝트룸"
      },
      "room": {
        "roomId": 12,
        "roomName": "프로젝트룸-2"
      },
      "rentalDate": "2026-01-15",
      "startTime": "14:00:00",
      "endTime": "16:00:00",
      "status": "REQUESTED",
      "requestedAt": "2026-01-10T09:30:00"
    },
    {
      "rentalId": 488,
      "space": {
        "spaceId": 2,
        "spaceName": "강의실동 A"
      },
      "room": {
        "roomId": 21,
        "roomName": "301호"
      },
      "rentalDate": "2026-01-08",
      "startTime": "10:00:00",
      "endTime": "12:00:00",
      "status": "APPROVED",
      "requestedAt": "2026-01-05T11:10:00"
    }
  ],
  "meta": {
    "page": 1,
    "size": 20,
    "totalElements": 12,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false,
    "sort": ["requestedAt,desc"]
  }
}
