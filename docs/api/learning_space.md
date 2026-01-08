## 학습공간 브런치명
## branch 'docs/learning-space'

## 공통항목

# 카테고리 ( 학습공간 : study_place, 학습공간대여 : study_place_rental, 학습공간이미지 : study_img )
## 1-1. 카테고리 목록 조회
GET `/study_place/categories?page=1&size=20`

Response
{
  "data": [
    {
      "study_placeId": 1,
      "name": "일반",
      "postCount" : 12,
      "bgColorHex": "#EEF2FF",
      "textColorHex": "#1E3A8A",
      "createdAt": "2026-01-01T09:00:00",
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
PATCH `/study_place/categories/{study_placeId}`

Request

{
    "name": "카테고리명",
    "bgColorHex": "#EEF2FF",
    "textColorHex": "#1E3A8A",
}

Response

{
  "data": {
    "name": "카테고리명",
    "bgColorHex": "#EEF2FF",
    "textColorHex": "#1E3A8A",
   },
  "meta": {
  }
}

## 1-3. 카테고리 삭제
DELETE `/study_place/categories/{study_placeId}`

Request

empty

Response


{
  "data": {
    "deleted": true
   },
  "meta": {
  }
}



## 2. 학습공간 등록

### 2-1 학습공간 등록 (관리자)
POST `/study_place`
Content-Type: application/json

Request
{
  "study_palaceId": 1,
  "palce_name": "도서관 2층",
  "min" : 2,
  "max" : 4,
  "personnel" : "",
  "content": "<p>...</p>",
  "postStartAt": "2026-01-07T09:00:00",
  "attachmentIds": [501, 502] 
}

Response (201)
{
  "data": {
    "noticeId": 101
  },
  "meta": {}
}



