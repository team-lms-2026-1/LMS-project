# 📘 백엔드 개발 규칙 (Team LMS)

## 1. 기본 원칙
- 공공 SI 성격의 LMS 프로젝트를 전제로 한다.
- API 응답은 엔티티가 아닌 DTO를 사용한다.
- 예측 가능성, 유지보수성, 성능 제어를 우선한다.
- DB 스키마 변경은 Flyway 마이그레이션 규칙을 따른다. (별도 문서)

---

## 2. 엔티티(Entity) 설계 규칙
- 엔티티는 DB 테이블 매핑과 상태 표현만 담당한다.
- 비즈니스 로직, 검증 로직, 상태 전이 로직은 엔티티에 두지 않는다.
- 연관관계는 기본적으로 사용하지 않고 id-only(Long FK) 방식으로 관리한다.
- 엔티티 필드에 기본값을 두지 않는다.
  - 기본값은 DB DEFAULT 또는 Service 계층에서 처리한다.
- Boolean 컬럼은 DB DEFAULT 활용을 위해 Boolean wrapper 타입을 사용한다.
- 공통 컬럼(createdAt / createdBy / updatedAt / updatedBy)은
  BaseEntity에서 공통 관리한다.

---

## 3. Service 계층 규칙
- 생성 / 수정 / 상태 변경은 모두 Service에서 처리한다.
- Service의 책임:
  - 기본값 세팅
  - 존재 여부 검증
  - 중복 검증
  - 상태 충돌 검증
  - 권한 검증
- 엔티티의 static factory / 도메인 메서드는 원칙적으로 사용하지 않는다.
- 트랜잭션 경계는 Service 계층에서 관리한다.

---

## 4. Repository 규칙
- Repository는 DB 접근 전용 계층이다.
- 비즈니스 판단 로직을 포함하지 않는다.
- JpaRepository<엔티티, PK타입> 사용을 기본으로 한다.
- PK 타입은 항상 Wrapper 타입(Long)을 사용한다.

---

## 5. 조회(Query) 설계 규칙
- 조회 API에서는 엔티티를 직접 반환하지 않는다. (DTO로 반환)
- 조회 방식은 “단일 테이블 여부 / 조인 필요 여부”에 따라 선택한다.

### 5.1 단일 테이블 조회(조인 없음)
- 단일 테이블에서 필요한 값이 모두 해결되는 경우에는
  `엔티티 조회(findAll/findBy...) + DTO.from(entity)` 방식을 허용한다.
- 이 방식은 추가 쿼리(N+1)가 발생하지 않는 구조에서만 사용한다.

### 5.2 조인/다른 테이블 데이터가 필요한 조회
- 목록/상세에서 다른 테이블 컬럼(예: deptName 등)이 필요하거나,
  조건/정렬/집계가 조인에 의존하는 경우에는
  `JPQL + DTO 생성자 방식`으로 조회한다.
- 필요한 컬럼만 명시적으로 select 하고, 조인은 쿼리에서 명확히 수행한다.
- Spring Data Projection(interface)은 사용하지 않는다.
- QueryDSL은 필요 시 별도 논의 후 도입한다..

---

## 6. API 설계 규칙
- 생성 / 수정 / 삭제 / 상태 변경 API는 관리자 전용으로 분리한다.
- 프론트엔드는 역할에 따라 컬럼 표시 및 버튼 노출을 제어한다.
- 서버는 항상 권한 검증으로 최종 방어를 수행한다. 

---

## 한 줄 요약 (팀 공통 규칙)
- 엔티티는 얇게
- 생성·수정은 Service에서
- 조회는 단일 테이블은 from, 조인 필요 시 JPQL 기반 DTO 조회

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


## swagger
http://localhost:8080/swagger-ui/index.html