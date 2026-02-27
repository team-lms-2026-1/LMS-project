package com.teamlms.backend.domain.survey.repository;

import com.querydsl.core.types.Projections;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.core.types.dsl.CaseBuilder;
import com.querydsl.core.types.dsl.Expressions;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;
import com.teamlms.backend.domain.survey.api.dto.SurveyListResponse;
import com.teamlms.backend.domain.survey.entity.QSurvey;
import com.teamlms.backend.domain.survey.entity.QSurveyTarget;
import com.teamlms.backend.domain.survey.enums.SurveyStatus;
import com.teamlms.backend.domain.survey.enums.SurveyTargetStatus;
import com.teamlms.backend.domain.survey.enums.SurveyType;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.support.PageableExecutionUtils;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

import static org.springframework.util.StringUtils.hasText;

@Repository
@RequiredArgsConstructor
public class SurveyRepositoryImpl implements SurveyRepositoryCustom {

    private final JPAQueryFactory queryFactory;

    @Override
    public Page<SurveyListResponse> findSurveyAdminList(
            SurveyType type,
            SurveyStatus status,
            String keyword,
            Pageable pageable
    ) {
        QSurvey s = QSurvey.survey;
        LocalDateTime now = LocalDateTime.now();

        List<SurveyListResponse> content = queryFactory
                .select(Projections.constructor(SurveyListResponse.class,
                        s.surveyId,
                        s.type,
                        s.title,
                        // 날짜 기반으로 표시 상태 동적 계산 (DB write 없이)
                        new CaseBuilder()
                                .when(s.startAt.after(now))  // 시작 전 → DRAFT
                                .then(SurveyStatus.DRAFT)
                                .when(s.endAt.before(now))   // 종료 후 → CLOSED
                                .then(SurveyStatus.CLOSED)
                                .otherwise(s.status),         // 진행 중 → DB 값
                        s.startAt,
                        s.endAt,
                        s.viewCount,
                        s.createdAt,
                        Expressions.constant(false)
                    ))
                .from(s)
                .where(
                        typeEq(type),
                        computedStatusEq(status, now),
                        titleLike(keyword)
                )
                .orderBy(s.surveyId.desc())
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .fetch();

        JPAQuery<Long> countQuery = queryFactory
                .select(s.count())
                .from(s)
                .where(
                        typeEq(type),
                        computedStatusEq(status, now),
                        titleLike(keyword)
                );

        return PageableExecutionUtils.getPage(content, pageable, countQuery::fetchOne);
    }

    @Override
    public Page<SurveyListResponse> findAvailableSurveysForUser(Long userId, String keyword, SurveyType type, Pageable pageable) {
        QSurvey s = QSurvey.survey;
        QSurveyTarget t = QSurveyTarget.surveyTarget;
        LocalDateTime now = LocalDateTime.now();

        List<SurveyListResponse> content = queryFactory
                .select(Projections.constructor(SurveyListResponse.class,
                        s.surveyId,
                        s.type,
                        s.title,
                        s.status,
                        s.startAt,
                        s.endAt,
                        s.viewCount,
                        s.createdAt,
                        t.status.eq(SurveyTargetStatus.SUBMITTED)
                ))
                .from(s)
                .join(t).on(t.surveyId.eq(s.surveyId))
                .where(
                        t.targetAccountId.eq(userId),
                        s.status.eq(SurveyStatus.OPEN),
                        s.startAt.loe(now),
                        s.endAt.goe(now),
                        titleLike(keyword),
                        typeEq(type)
                )
                .orderBy(s.surveyId.desc())
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .fetch();

        JPAQuery<Long> countQuery = queryFactory
                .select(s.count())
                .from(s)
                .join(t).on(t.surveyId.eq(s.surveyId))
                .where(
                        t.targetAccountId.eq(userId),
                        s.status.eq(SurveyStatus.OPEN),
                        s.startAt.loe(now),
                        s.endAt.goe(now),
                        titleLike(keyword),
                        typeEq(type)
                );

        return PageableExecutionUtils.getPage(content, pageable, countQuery::fetchOne);
    }

    private BooleanExpression typeEq(SurveyType type) {
        return type != null ? QSurvey.survey.type.eq(type) : null;
    }

    /** 날짜 기반 computed status로 필터링 (DB write 없이 동적 계산) */
    private BooleanExpression computedStatusEq(SurveyStatus status, LocalDateTime now) {
        if (status == null) return null;
        QSurvey s = QSurvey.survey;
        return switch (status) {
            case DRAFT  -> s.startAt.after(now);                                          // 시작 전
            case OPEN   -> s.status.eq(SurveyStatus.OPEN)
                            .and(s.startAt.loe(now)).and(s.endAt.goe(now));               // 기간 내
            case CLOSED -> s.status.eq(SurveyStatus.CLOSED)                              // 명시적 종료
                            .or(s.status.eq(SurveyStatus.OPEN).and(s.endAt.before(now)));// 기간 초과
        };
    }

    private BooleanExpression statusEq(SurveyStatus status) {
        return status != null ? QSurvey.survey.status.eq(status) : null;
    }

    private BooleanExpression titleLike(String keyword) {
        return hasText(keyword) ? QSurvey.survey.title.containsIgnoreCase(keyword) : null;
    }
}
