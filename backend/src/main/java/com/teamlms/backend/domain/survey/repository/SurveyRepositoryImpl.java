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
                        new CaseBuilder()
                                .when(s.startAt.after(now).or(s.endAt.before(now)))
                                .then(SurveyStatus.CLOSED)
                                .otherwise(s.status),
                        s.startAt,
                        s.endAt,
                        s.viewCount,
                        s.createdAt,
                        Expressions.constant(false)
                    ))
                .from(s)
                .where(
                        typeEq(type),
                        statusEq(status),
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
                        statusEq(status),
                        titleLike(keyword)
                );

        return PageableExecutionUtils.getPage(content, pageable, countQuery::fetchOne);
    }

    @Override
    public List<SurveyListResponse> findAvailableSurveysForUser(Long userId, String keyword, SurveyType type) {
        QSurvey s = QSurvey.survey;
        QSurveyTarget t = QSurveyTarget.surveyTarget;
        LocalDateTime now = LocalDateTime.now();

        return queryFactory
                .select(Projections.constructor(SurveyListResponse.class,
                        s.surveyId,
                        s.type,
                        s.title,
                        new CaseBuilder()
                                .when(s.startAt.after(now).or(s.endAt.before(now)))
                                .then(SurveyStatus.CLOSED)
                                .otherwise(s.status),
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
                        titleLike(keyword),
                        typeEq(type)
                )
                .orderBy(s.surveyId.desc())
                .fetch();
    }

    private BooleanExpression typeEq(SurveyType type) {
        return type != null ? QSurvey.survey.type.eq(type) : null;
    }

    private BooleanExpression statusEq(SurveyStatus status) {
        return status != null ? QSurvey.survey.status.eq(status) : null;
    }

    private BooleanExpression titleLike(String keyword) {
        return hasText(keyword) ? QSurvey.survey.title.containsIgnoreCase(keyword) : null;
    }
}
