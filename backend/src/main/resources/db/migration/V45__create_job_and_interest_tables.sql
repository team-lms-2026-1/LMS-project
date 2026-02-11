-- ============================================================
-- V1__create_job_and_interest_tables.sql
-- MVP : job_catalog + interest_keyword_master
-- ============================================================

-- ============================================================
-- 1. 직업 테이블
-- ============================================================

create table job_catalog (
    id              bigserial primary key,

    version         varchar(20) not null,      -- ex) '2025'
    job_code        varchar(20) not null,      -- 앞자리 0 보존

    major_name      varchar(200),
    middle_name     varchar(200),
    minor_name      varchar(200),

    job_name        varchar(300) not null,

    -- 검색 최적화용 (대/중/소/직업명 합쳐서 저장)
    search_text     text not null,

    created_at      timestamp not null default now(),
    updated_at      timestamp not null default now(),

    constraint uq_job unique (version, job_code)
);

-- 검색 성능 향상 (ILIKE 최적화)
create extension if not exists pg_trgm;

create index idx_job_search_text
on job_catalog
using gin (search_text gin_trgm_ops);



-- ============================================================
-- 2. 관심 키워드 Seed 테이블
-- ============================================================

create table interest_keyword_master (
    id              bigserial primary key,

    keyword         varchar(100) not null unique,

    category        varchar(50),      -- 업무영역 / 업무방식 / 역량
    sort_order      integer,

    active          boolean not null default true,

    created_at      timestamp not null default now()
);
