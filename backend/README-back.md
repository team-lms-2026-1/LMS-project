# Flyway 마이그레이션 규칙 (Team LMS)

## 1. 버전 규칙
- 마이그레이션 파일은 항상 증가하는 버전으로만 추가한다.
- 이미 적용된 버전 파일은 절대 수정하지 않는다. (RDS 반영 후 수정 금지)
- 수정/보정이 필요하면 반드시 새 버전(Vn+1) 파일로 UPDATE/INSERT 한다.

## 2. 기능 단위로 묶는다
- 기능 PR 단위로 schema + seed를 같이 넣는 것을 기본으로 한다.
  - 예: Dept/Major 기능 -> Vn__dept_major_schema.sql + Vn+1__dept_major_seed.sql
- seed에는 해당 기능을 테스트/데모할 수 있는 최소 데이터만 넣는다.

## 3. Seed는 멱등성(중복 안전) 원칙
- Permission/Role/Mapping seed는 PostgreSQL `ON CONFLICT DO NOTHING`으로 중복 삽입을 방지한다.
- description 변경 등 “수정”은 새 버전에서 UPDATE로 처리한다.
- 삭제 대신 is_active=false를 사용한다.

## 4. 운영/테스트 데이터 구분
- 운영에서 절대 들어가면 안 되는 테스트용 계정/데이터는
  - (권장) 별도 Vn__seed_dev_only.sql 로 분리하거나,
  - (차선) seed 파일 내에 주석/토글 영역으로 분리한다.


## api 응답규칙

# 일반 응답 / meta 없음
ApiResponse.ok(data)

# 페이징 / meta 있는 응답
ApiResponse.of(data, PageMeta.from(page))


## admin 로그인

ADMIN
  'admin1234',
  'Admin!2345'

ADMIN password encoding 생성토큰

  eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIiwiYWNjb3VudFR5cGUiOiJBRE1JTiIsImlhdCI6MTc2ODM2NjQ5MSwiZXhwIjoxNzY4MzcwMDkxfQ.eI_28YzsD58bbpA-ofE6Mt4ceq5N6G_P2KwOD-FovMg

