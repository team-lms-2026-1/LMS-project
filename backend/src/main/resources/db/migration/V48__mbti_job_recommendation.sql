-- =======================================================
-- MBTI Job Recommendation
-- - Store only the latest recommendation per account
-- =======================================================

create table if not exists mbti_job_recommendation (
    recommendation_id            bigserial primary key,
    account_id                   bigint not null unique,
    mbti_result_id               bigint not null,
    mbti_type                    varchar(10) not null,
    selected_keyword_ids_json    jsonb not null,
    candidate_job_codes_json     jsonb not null,
    model_name                   varchar(100) not null,
    prompt_version               varchar(40) not null,
    generated_at                 timestamp not null default now(),

    created_at                   timestamp not null default now(),
    created_by                   bigint,
    updated_at                   timestamp not null default now(),
    updated_by                   bigint,

    constraint fk_mjrec_mbti_result
        foreign key (mbti_result_id) references mbti_result(result_id)
);

create table if not exists mbti_job_recommendation_item (
    item_id              bigserial primary key,
    recommendation_id    bigint not null,
    rank_no              integer not null,
    job_catalog_id       bigint not null,
    job_code             varchar(20) not null,
    job_name             varchar(300) not null,
    reason_line1         varchar(45) not null,
    reason_line2         varchar(45) not null,
    reason_line3         varchar(45) not null,

    created_at           timestamp not null default now(),
    created_by           bigint,
    updated_at           timestamp not null default now(),
    updated_by           bigint,

    constraint fk_mjrec_item_recommendation
        foreign key (recommendation_id) references mbti_job_recommendation(recommendation_id) on delete cascade,
    constraint fk_mjrec_item_job_catalog
        foreign key (job_catalog_id) references job_catalog(id),
    constraint uq_mjrec_item_rank
        unique (recommendation_id, rank_no),
    constraint uq_mjrec_item_job
        unique (recommendation_id, job_catalog_id)
);

create index if not exists idx_mjrec_generated_at
    on mbti_job_recommendation(generated_at desc);
