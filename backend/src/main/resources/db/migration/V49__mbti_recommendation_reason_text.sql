alter table if exists mbti_job_recommendation_item
    add column if not exists reason_text text;

update mbti_job_recommendation_item
set reason_text = trim(concat_ws(' ', reason_line1, reason_line2, reason_line3))
where reason_text is null;

alter table if exists mbti_job_recommendation_item
    alter column reason_text set not null;

alter table if exists mbti_job_recommendation_item
    alter column reason_line1 drop not null;

alter table if exists mbti_job_recommendation_item
    alter column reason_line2 drop not null;

alter table if exists mbti_job_recommendation_item
    alter column reason_line3 drop not null;
